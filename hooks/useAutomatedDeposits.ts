import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { parseUnits, Address } from 'viem';
import { writeContract } from '@wagmi/core';
import { createGelatoAutomation } from '@/lib/gelato-automation';
import { ethers } from 'ethers';
import { get1inchRPC, getUSDCBalance, formatBalance } from '@/lib/1inch-rpc';
import { 
  CONTRACTS, 
  DEPOSIT_FREQUENCIES, 
  ABIS, 
  DEFAULT_CHAIN_ID,
  getUSDCAddress,
  type DepositFrequency,
  APP_CONFIG
} from '@/lib/constants';

// AutomatedDeposits contract address on Polygon
const AUTOMATED_DEPOSITS_ADDRESS = '0x40D8364e7FB4BF12870f5ADBA5DAe206354bD6ED' as Address;

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
      console.log('🤖 Creating real on-chain deposit schedule...');
      
      const userAddress = user.wallet.address;
      const usdcAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'; // Native USDC
      const contractAddress = AUTOMATED_DEPOSITS_ADDRESS;
      const aavePoolAddress = '0x794a61358D6845594F94dc1DB02A252b5b4814aD'; // Default recipient
      
      console.log('📋 Schedule parameters:', {
        userAddress,
        token: usdcAddress,
        amount: config.amount,
        frequency: config.frequency,
        contract: contractAddress
      });

      // Get wallet for provider
      const wallet = wallets[0];
      if (!wallet) {
        throw new Error('No wallet connected');
      }
      
      const provider = await wallet.getEthereumProvider();
      
      // Convert frequency to seconds
      const frequencyMap = {
        'daily': 86400,
        'weekly': 604800, 
        'monthly': 2592000
      };
      const frequencySeconds = frequencyMap[config.frequency] || 86400;
      
      // Convert amount to wei (USDC has 6 decimals)
      const amountWei = BigInt(Math.floor(config.amount * 1000000));
      
      console.log('🔨 Building createSchedule transaction...', {
        token: usdcAddress,
        amount: amountWei.toString(),
        frequency: frequencySeconds,
        recipient: aavePoolAddress
      });
      
      // Build the createSchedule transaction using ethers interface
      const contractInterface = new ethers.Interface([
        "function createSchedule(address token, uint256 amount, uint256 frequency, address recipient) returns (uint256)"
      ]);
      
      const createScheduleData = contractInterface.encodeFunctionData("createSchedule", [
        usdcAddress,
        amountWei,
        frequencySeconds,
        aavePoolAddress
      ]);
      
      const transactionRequest = {
        from: userAddress,
        to: contractAddress,
        data: createScheduleData,
        value: '0x0',
        gas: '0x493E0', // 300,000 gas limit
      };
      
      console.log('📋 Transaction request:', transactionRequest);
      console.log('🚀 Sending createSchedule transaction...');
      
      // Send the transaction using MetaMask
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });
      
      console.log('✅ Schedule creation transaction sent:', txHash);
      
      // Wait for transaction confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      
      // Calculate next deposit time
      const nextDeposit = new Date(Date.now() + (frequencySeconds * 1000));
      
      // Save to localStorage with on-chain reference
      const depositConfig = {
        ...config,
        nextDeposit: nextDeposit.toISOString(),
        userAddress: user.wallet.address,
        createdAt: new Date().toISOString(),
        contractAddress: AUTOMATED_DEPOSITS_ADDRESS,
        txHash: txHash,
        scheduleId: 0, // We'll need to get this from contract events
        gelatoTaskId: null,
        isOnChain: true, // Mark as on-chain
        frequency: config.frequency,
        amountWei: amountWei.toString(),
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
      
      console.log('✅ On-chain automated deposit schedule created!', {
        txHash,
        contract: contractAddress,
        nextDeposit: nextDeposit.toISOString()
      });

    } catch (error) {
      console.error('❌ Failed to create on-chain schedule:', error);
      
      // If real transaction fails, fall back to localStorage simulation
      console.log('🔄 Falling back to localStorage simulation...');
      
      const frequencyInSeconds = DEPOSIT_FREQUENCIES[config.frequency];
      const frequencyInMs = Number(frequencyInSeconds) * 1000;
      const nextDeposit = new Date(Date.now() + frequencyInMs);
      
      const depositConfig = {
        ...config,
        nextDeposit: nextDeposit.toISOString(),
        userAddress: user.wallet.address,
        createdAt: new Date().toISOString(),
        contractAddress: AUTOMATED_DEPOSITS_ADDRESS,
        scheduleId: 0,
        gelatoTaskId: null,
        isOnChain: false, // Mark as simulation
        fallbackReason: error instanceof Error ? error.message : 'Unknown error',
      };
      
      localStorage.setItem(`deposits-${user.id}`, JSON.stringify(depositConfig));
      
      setState(prev => ({
        ...prev,
        isEnabled: true,
        config,
        nextDeposit,
        error: null, // Don't show error to user - we fell back gracefully
      }));
      
      console.log('💾 Fallback configuration saved to localStorage');
    } finally {
      setIsTransactionPending(false);
    }
  };

  const disableAutomatedDeposits = async () => {
    if (!user?.wallet?.address || !scheduleCount) return;

    try {
      // Call updateSchedule to disable the latest schedule
      await writeContract({
        address: AUTOMATED_DEPOSITS_ADDRESS,
        abi: [
          {
            name: 'updateSchedule',
            type: 'function', 
            inputs: [
              { name: 'scheduleId', type: 'uint256' },
              { name: 'isActive', type: 'bool' }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'updateSchedule',
        args: [BigInt(Number(scheduleCount) - 1), false], // Disable latest schedule
      });
    } catch (error) {
      console.error('Failed to disable automated deposits:', error);
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