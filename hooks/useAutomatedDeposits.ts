import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { 
  type DepositFrequency,
  APP_CONFIG
} from '@/lib/constants';

// Backend API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-api.vercel.app';

// Simplified auto deposit contract address
const SIMPLE_AUTO_DEPOSIT_ADDRESS = '0x93CCA0c23c52E59a4aDA7694F1D7eaEf2cF89C13';

interface DepositConfig {
  amount: number;
  frequency: DepositFrequency;
  token: string;
}

interface DepositState {
  isEnabled: boolean;
  config: DepositConfig | null;
  nextDeposit: Date | null;
  totalDeposited: number;
  isLoading: boolean;
  error: string | null;
  gelatoTaskId: string | null; // Track Gelato automation task
}

export function useAutomatedDeposits() {
  const { user, authenticated, sendTransaction } = usePrivy();
  const { wallets } = useWallets();
  const [state, setState] = useState<DepositState>({
    isEnabled: false,
    config: null,
    nextDeposit: null,
    totalDeposited: 0,
    isLoading: false,
    error: null,
    gelatoTaskId: null,
  });

  const [scheduleCount, setScheduleCount] = useState<bigint | null>(null);
  const [allowance, setAllowance] = useState<bigint | null>(null);
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  // Load user's deposit configuration on mount
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      loadUserData();
    }
  }, [authenticated, user?.wallet?.address]);

  // Update loading state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: isTransactionPending,
    }));
  }, [isTransactionPending]);

  const loadUserData = async () => {
    if (!user?.wallet?.address) return;

    try {
      // For now, load from localStorage (since we don't have contract deployed)
      const savedConfig = localStorage.getItem(`deposits-${user.id}`);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setState(prev => ({
          ...prev,
          isEnabled: true,
          config: {
            amount: config.amount,
            frequency: config.frequency,
            token: 'USDC'
          },
          nextDeposit: new Date(config.nextDeposit),
          gelatoTaskId: config.gelatoTaskId || null,
        }));
      }

      // Check USDC balance using 1inch RPC
      try {
        // const balance = await getUSDCBalance(user.wallet.address, DEFAULT_CHAIN_ID);
        // const formattedBalance = formatBalance(balance, 6); // USDC has 6 decimals
        const formattedBalance = '0'; // Disabled due to RPC issues
        console.log('User USDC balance:', formattedBalance);
      } catch (error) {
        console.error('Failed to fetch USDC balance:', error);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };


  const setupAutomatedDeposits = async (config: DepositConfig) => {
    if (!user?.wallet?.address) throw new Error('User wallet not connected');

    setIsTransactionPending(true);
    setState(prev => ({ ...prev, error: null }));

    try {
      console.log('🤖 Setting up automated deposits...');
      
      const userAddress = user.wallet.address;
      const usdcAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'; // Native USDC on Polygon
      
      // First: Get user approval for the contract
      const wallet = wallets[0];
      if (!wallet) {
        throw new Error('No wallet connected');
      }
      
      const provider = await wallet.getEthereumProvider();
      
      // Convert amount to wei (USDC has 6 decimals)
      const amountWei = BigInt(Math.floor(config.amount * 1000000));
      
      console.log('🔐 Requesting USDC approval for auto deposits...');
      
      // Build approval transaction
      const approvalData = `0x095ea7b3${SIMPLE_AUTO_DEPOSIT_ADDRESS
        .slice(2)
        .padStart(64, "0")}${(amountWei * BigInt(365)) // Approve enough for a year
        .toString(16)
        .padStart(64, "0")}`;

      const approvalRequest = {
        from: userAddress,
        to: usdcAddress,
        data: approvalData,
        value: "0x0",
        gas: "0x186A0", // 100,000 gas limit
      };

      console.log('📋 Requesting approval transaction...');
      
      const approvalTxHash = await provider.request({
        method: "eth_sendTransaction",
        params: [approvalRequest],
      });
      
      console.log('✅ Approval transaction sent:', approvalTxHash);
      console.log('⏳ Waiting for approval confirmation...');
      
      // Wait for approval confirmation
      let confirmed = false;
      let attempts = 0;
      const maxAttempts = 30;
      
      while (!confirmed && attempts < maxAttempts) {
        try {
          const receipt = await provider.request({
            method: "eth_getTransactionReceipt",
            params: [approvalTxHash],
          });
          
          if (receipt && receipt.status === "0x1") {
            confirmed = true;
            console.log("✅ Approval confirmed");
          } else if (receipt && receipt.status === "0x0") {
            throw new Error("Approval transaction failed");
          }
        } catch (receiptError) {
          console.log(`⏳ Waiting for approval... (${attempts + 1}/${maxAttempts})`);
        }
        
        if (!confirmed) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempts++;
        }
      }
      
      if (!confirmed) {
        throw new Error("Approval not confirmed within timeout");
      }
      
      // Convert frequency to days for backend API
      const frequencyMap = {
        'daily': 1,
        'weekly': 7,
        'bi-weekly': 14,
        'monthly': 30
      } as const;
      const intervalDays = frequencyMap[config.frequency] || 30;
      
      console.log('📡 Scheduling with backend API...');
      
      // Schedule with backend API
      const response = await fetch(`${API_BASE_URL}/api/schedule-auto-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userAddress,
          token: usdcAddress,
          amount: config.amount.toString(),
          intervalDays: intervalDays,
          startTime: new Date(Date.now() + (intervalDays * 24 * 60 * 60 * 1000)).toISOString()
        }),
      });
      
      const apiResult = await response.json();
      
      if (!apiResult.success) {
        throw new Error(`Backend API error: ${apiResult.error}`);
      }
      
      console.log('✅ Auto deposit scheduled:', apiResult.scheduleId);
      
      // Calculate next deposit time
      const nextDeposit = new Date(apiResult.schedule.nextDeposit);
      
      // Save configuration
      const depositConfig = {
        ...config,
        nextDeposit: nextDeposit.toISOString(),
        userAddress: userAddress,
        createdAt: new Date().toISOString(),
        scheduleId: apiResult.scheduleId,
        approvalTxHash: approvalTxHash,
        isBackendScheduled: true,
        intervalDays: intervalDays,
      };
      
      localStorage.setItem(`deposits-${user.id}`, JSON.stringify(depositConfig));
      
      // Update state
      setState(prev => ({
        ...prev,
        isEnabled: true,
        config,
        nextDeposit,
        error: null,
      }));

      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('autoDepositChanged'));
      }
      
      console.log('✅ Auto deposit setup complete!', {
        scheduleId: apiResult.scheduleId,
        nextDeposit: nextDeposit.toISOString(),
        approvalTx: approvalTxHash
      });

    } catch (error) {
      console.error('❌ Failed to setup auto deposit:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Setup failed',
      }));
    } finally {
      setIsTransactionPending(false);
    }
  };

  const disableAutomatedDeposits = async () => {
    if (!user?.wallet?.address) return;

    try {
      console.log('🛑 Disabling automated deposits...');
      
      // Get the stored config to find the schedule ID
      const savedConfig = localStorage.getItem(`deposits-${user.id}`);
      if (!savedConfig) {
        throw new Error('No saved deposit configuration found');
      }
      
      const config = JSON.parse(savedConfig);
      const scheduleId = config.scheduleId;
      
      if (!scheduleId) {
        throw new Error('No schedule ID found');
      }
      
      // Call backend API to cancel the schedule
      const response = await fetch(`${API_BASE_URL}/api/scheduled-deposits/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Failed to cancel schedule: ${result.error}`);
      }
      
      console.log('✅ Schedule cancelled successfully');
      
      // Update local state
      setState(prev => ({
        ...prev,
        isEnabled: false,
        config: null,
        nextDeposit: null,
        error: null,
      }));
      
      // Clear localStorage
      localStorage.removeItem(`deposits-${user.id}`);
      
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('autoDepositChanged'));
      }
      
    } catch (error) {
      console.error('❌ Failed to disable automated deposits:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disable',
      }));
    }
  };

  const updateDepositConfig = async (updates: Partial<DepositConfig>) => {
    if (!state.config || !user) return;

    // For updates, we disable old schedule and create new one
    await disableAutomatedDeposits();
    const newConfig = { ...state.config, ...updates };
    await setupAutomatedDeposits(newConfig);
  };

  const getProjectedEarnings = (monthlyAmount: number, apy: number = APP_CONFIG.DEFAULT_APY) => {
    const annualAmount = monthlyAmount * 12;
    const projectedEarnings = annualAmount * apy;
    
    return {
      annual: projectedEarnings,
      monthly: projectedEarnings / 12,
      daily: projectedEarnings / 365,
    };
  };

  const getNextDepositAmount = (): number => {
    if (!state.config) return 0;
    return state.config.amount;
  };

  const getDaysUntilNextDeposit = (): number => {
    if (!state.nextDeposit) return 0;
    const now = new Date();
    const diff = state.nextDeposit.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return {
    // State
    isEnabled: state.isEnabled,
    config: state.config,
    nextDeposit: state.nextDeposit,
    totalDeposited: state.totalDeposited,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    setupAutomatedDeposits,
    disableAutomatedDeposits,
    updateDepositConfig,

    // Utilities
    getProjectedEarnings,
    getNextDepositAmount,
    getDaysUntilNextDeposit,
  };
}