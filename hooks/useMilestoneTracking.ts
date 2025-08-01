"use client";

import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { MilestoneSDK, MilestoneType } from "@/lib/milestone-nft";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";

interface MilestoneTrackingOptions {
  onMilestoneEarned?: (milestone: MilestoneType) => void;
  onError?: (error: Error) => void;
}

export function useMilestoneTracking(options: MilestoneTrackingOptions = {}) {
  const { user, authenticated } = usePrivy();
  const milestoneSDK = new MilestoneSDK(DEFAULT_CHAIN_ID);

  const trackDeposit = useCallback(async (amountUSD: number) => {
    if (!authenticated || !user?.wallet?.address) return;

    try {
      console.log('🏆 Tracking deposit milestone:', amountUSD);
      
      // For demo purposes, we'll simulate milestone tracking
      // In a real app, this would call the smart contract
      
      // Check if this is the first deposit
      const hasFirstDeposit = await milestoneSDK.hasAchievedMilestone(
        user.wallet.address as `0x${string}`,
        MilestoneType.FIRST_DEPOSIT
      );

      if (!hasFirstDeposit) {
        console.log('🎉 First deposit milestone earned!');
        options.onMilestoneEarned?.(MilestoneType.FIRST_DEPOSIT);
      }

      // Check for amount milestones
      if (amountUSD >= 1000) {
        const hasAmountMilestone = await milestoneSDK.hasAchievedMilestone(
          user.wallet.address as `0x${string}`,
          MilestoneType.AMOUNT_SAVED
        );

        if (!hasAmountMilestone) {
          console.log('🎉 Amount saved milestone earned!');
          options.onMilestoneEarned?.(MilestoneType.AMOUNT_SAVED);
        }
      }

      // Record the deposit (in a real app, this would be called by the smart contract)
      // await milestoneSDK.recordDeposit(user.wallet.address as `0x${string}`, amountUSD);
      
    } catch (error) {
      console.error('Error tracking deposit milestone:', error);
      options.onError?.(error as Error);
    }
  }, [authenticated, user?.wallet?.address, options]);

  const trackEducationProgress = useCallback(async (moduleId: number) => {
    if (!authenticated || !user?.wallet?.address) return;

    try {
      console.log('📚 Tracking education progress:', moduleId);
      
      // Simulate education progress tracking
      // await milestoneSDK.recordEducationProgress(user.wallet.address as `0x${string}`, moduleId);
      
      // Check if all modules are completed (for demo, assume 3 modules total)
      if (moduleId >= 2) { // 0-indexed, so 2 means 3 modules completed
        console.log('🎉 Education complete milestone earned!');
        options.onMilestoneEarned?.(MilestoneType.EDUCATION_COMPLETE);
      }
      
    } catch (error) {
      console.error('Error tracking education milestone:', error);
      options.onError?.(error as Error);
    }
  }, [authenticated, user?.wallet?.address, options]);

  const trackReferral = useCallback(async (referredAddress: string) => {
    if (!authenticated || !user?.wallet?.address) return;

    try {
      console.log('🤝 Tracking referral milestone:', referredAddress);
      
      // Simulate referral tracking
      // This would increment the user's referral count
      console.log('🎉 Referral milestone progress updated!');
      
    } catch (error) {
      console.error('Error tracking referral milestone:', error);
      options.onError?.(error as Error);
    }
  }, [authenticated, user?.wallet?.address, options]);

  const setFinancialFreedomTarget = useCallback(async (targetUSD: number) => {
    if (!authenticated || !user?.wallet?.address) return;

    try {
      console.log('🎯 Setting financial freedom target:', targetUSD);
      
      // await milestoneSDK.setFinancialFreedomTarget(user.wallet.address as `0x${string}`, targetUSD);
      
    } catch (error) {
      console.error('Error setting financial freedom target:', error);
      options.onError?.(error as Error);
    }
  }, [authenticated, user?.wallet?.address, options]);

  const checkMilestoneProgress = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) return null;

    try {
      const userData = await milestoneSDK.getUserData(user.wallet.address as `0x${string}`);
      return userData;
    } catch (error) {
      console.error('Error checking milestone progress:', error);
      options.onError?.(error as Error);
      return null;
    }
  }, [authenticated, user?.wallet?.address, options]);

  return {
    trackDeposit,
    trackEducationProgress,
    trackReferral,
    setFinancialFreedomTarget,
    checkMilestoneProgress,
    isReady: authenticated && !!user?.wallet?.address,
  };
}

export default useMilestoneTracking;