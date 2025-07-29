import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { parseUnits, Address } from 'viem';
import { createGelatoAutomation } from '@/lib/gelato-automation';
import { ethers } from 'ethers';
// import { create1inchProvider, getUSDCBalance, formatBalance } from '@/lib/1inch-rpc'; // Disabled due to API issues
import { 
  CONTRACTS, 
  DEPOSIT_FREQUENCIES, 
  ABIS, 
  DEFAULT_CHAIN_ID,
  getUSDCAddress,
  type DepositFrequency,
  APP_CONFIG
} from '@/lib/constants';

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
      // Calculate next deposit date using constants
      const frequencyInSeconds = DEPOSIT_FREQUENCIES[config.frequency];
      const frequencyInMs = Number(frequencyInSeconds) * 1000;
      const nextDeposit = new Date(Date.now() + frequencyInMs);

      // For now, save to localStorage (will be replaced with real contract calls after deployment)
      const depositConfig = {
        ...config,
        nextDeposit: nextDeposit.toISOString(),
        userAddress: user.wallet.address,
        createdAt: new Date().toISOString(),
        gelatoTaskId: null, // Will be set after Gelato task creation
      };

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save configuration
      localStorage.setItem(`deposits-${user.id}`, JSON.stringify(depositConfig));

      // Update state
      setState(prev => ({
        ...prev,
        isEnabled: true,
        config,
        nextDeposit,
        error: null,
      }));

      console.log('✅ Automated deposits configured:', depositConfig);

    } catch (error) {
      console.error('Failed to setup automated deposits:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Setup failed',
      }));
      throw error;
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
        args: [(scheduleCount as bigint) - 1n, false], // Disable latest schedule
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