import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletClient } from 'wagmi';
import { AutomatedDepositsSDK, type DepositSchedule, type CreateScheduleParams } from '@/lib/automated-deposits';
import { getOneInchAPI } from '@/lib/1inch-api';
import type { Address } from 'viem';

interface UseAutomatedDepositsReturn {
  schedules: DepositSchedule[];
  isLoading: boolean;
  error: string | null;
  createSchedule: (params: CreateScheduleParams) => Promise<void>;
  updateSchedule: (scheduleId: number, isActive: boolean) => Promise<void>;
  executeDeposit: (scheduleId: number) => Promise<void>;
  refreshSchedules: () => Promise<void>;
}

export function useAutomatedDeposits(chainId: number = 137): UseAutomatedDepositsReturn {
  const { user } = usePrivy();
  const { data: walletClient } = useWalletClient();
  const [sdk, setSdk] = useState<AutomatedDepositsSDK | null>(null);
  const [schedules, setSchedules] = useState<DepositSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize SDK
  useEffect(() => {
    const automatedDepositsSDK = new AutomatedDepositsSDK(chainId);
    if (walletClient) {
      automatedDepositsSDK.setWalletClient(walletClient);
    }
    setSdk(automatedDepositsSDK);
  }, [chainId, walletClient]);

  // Fetch user's schedules
  const refreshSchedules = useCallback(async () => {
    if (!sdk || !user?.wallet?.address) return;

    setIsLoading(true);
    setError(null);

    try {
      const userSchedules = await sdk.getUserSchedules(user.wallet.address as Address);
      
      // Enrich with token info from 1inch API
      const api = getOneInchAPI(chainId);
      const enrichedSchedules = await Promise.all(
        userSchedules.map(async (schedule) => {
          try {
            // Get token metadata from 1inch
            const tokenInfo = await api.getTokenMetadata(schedule.token as string);
            return {
              ...schedule,
              tokenInfo,
            };
          } catch {
            // Fallback if token info fails
            return schedule;
          }
        })
      );

      setSchedules(enrichedSchedules);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schedules');
    } finally {
      setIsLoading(false);
    }
  }, [sdk, user, chainId]);

  // Create a new schedule
  const createSchedule = useCallback(async (params: CreateScheduleParams) => {
    if (!sdk || !user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.createSchedule(params);
      console.log('Schedule created:', result);
      
      // Refresh schedules after creation
      await refreshSchedules();
    } catch (err) {
      console.error('Failed to create schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to create schedule');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, user, refreshSchedules]);

  // Update schedule status
  const updateSchedule = useCallback(async (scheduleId: number, isActive: boolean) => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const txHash = await sdk.updateSchedule(scheduleId, isActive);
      console.log('Schedule updated:', txHash);
      
      // Update local state optimistically
      setSchedules(prev => prev.map((s, idx) => 
        idx === scheduleId ? { ...s, isActive } : s
      ));
      
      // Refresh to get latest data
      await refreshSchedules();
    } catch (err) {
      console.error('Failed to update schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to update schedule');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, refreshSchedules]);

  // Execute a deposit manually (user can trigger their own deposits)
  const executeDeposit = useCallback(async (scheduleId: number) => {
    if (!sdk || !user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const txHash = await sdk.executeDeposit(
        user.wallet.address as Address,
        scheduleId
      );
      console.log('Deposit executed:', txHash);
      
      // Refresh to get updated totals
      await refreshSchedules();
    } catch (err) {
      console.error('Failed to execute deposit:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute deposit');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, user, refreshSchedules]);

  // Load schedules on mount and when dependencies change
  useEffect(() => {
    refreshSchedules();
  }, [refreshSchedules]);

  return {
    schedules,
    isLoading,
    error,
    createSchedule,
    updateSchedule,
    executeDeposit,
    refreshSchedules,
  };
}

// Helper hook to get formatted schedule data
export function useFormattedSchedules(chainId: number = 137) {
  const { schedules, ...rest } = useAutomatedDeposits(chainId);

  const formattedSchedules = schedules.map((schedule, index) => {
    const sdk = new AutomatedDepositsSDK(chainId);
    
    // Format for display
    const formatted = sdk.formatSchedule(schedule, {
      decimals: 18, // Default, should use actual token decimals
      symbol: 'TOKEN', // Default, should use actual token symbol
    });

    return {
      id: index,
      ...schedule,
      ...formatted,
      canExecute: BigInt(Math.floor(Date.now() / 1000)) >= schedule.nextDeposit,
    };
  });

  return {
    schedules: formattedSchedules,
    ...rest,
  };
} 