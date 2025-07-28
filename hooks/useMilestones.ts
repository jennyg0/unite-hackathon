import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { MilestoneSDK, MilestoneType, type UserMilestoneData, type Milestone } from '@/lib/milestone-nft';
import type { Address } from 'viem';

interface UseMilestonesReturn {
  userData: UserMilestoneData | null;
  milestones: Milestone[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  hasAchievedMilestone: (type: MilestoneType) => boolean;
  getNextMilestones: () => NextMilestone[];
  getMilestoneProgress: (type: MilestoneType) => number;
}

interface NextMilestone {
  type: MilestoneType;
  title: string;
  description: string;
  progress: number;
  target: number;
  emoji: string;
  color: string;
}

export function useMilestones(chainId: number = 137): UseMilestonesReturn {
  const { user } = usePrivy();
  const [sdk, setSdk] = useState<MilestoneSDK | null>(null);
  const [userData, setUserData] = useState<UserMilestoneData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize SDK
  useEffect(() => {
    try {
      const milestoneSDK = new MilestoneSDK(chainId);
      setSdk(milestoneSDK);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize milestone SDK');
    }
  }, [chainId]);

  // Fetch user data
  const refreshData = useCallback(async () => {
    if (!sdk || !user?.wallet?.address) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await sdk.getUserData(user.wallet.address as Address);
      setUserData(data);
    } catch (err) {
      console.error('Failed to fetch milestone data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch milestone data');
    } finally {
      setIsLoading(false);
    }
  }, [sdk, user]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Check if user has achieved a specific milestone
  const hasAchievedMilestone = useCallback((type: MilestoneType): boolean => {
    if (!userData) return false;
    return userData.milestones.some(m => m.type === type);
  }, [userData]);

  // Get next milestones to work towards
  const getNextMilestones = useCallback((): NextMilestone[] => {
    if (!userData || !sdk) return [];

    const nextMilestones: NextMilestone[] = [];

    // Amount milestones
    const amountMilestones = [100, 1000, 5000, 10000, 50000, 100000];
    for (const target of amountMilestones) {
      if (userData.totalDeposited < target) {
        const info = sdk.getMilestoneInfo(MilestoneType.AMOUNT_SAVED);
        nextMilestones.push({
          type: MilestoneType.AMOUNT_SAVED,
          title: `Save $${target.toLocaleString()}`,
          description: `You're ${Math.round((userData.totalDeposited / target) * 100)}% there!`,
          progress: userData.totalDeposited,
          target,
          emoji: info.emoji,
          color: info.color,
        });
        break; // Only show next milestone
      }
    }

    // Streak milestones
    const streakMilestones = [7, 30, 90, 180, 365];
    for (const target of streakMilestones) {
      if (userData.depositStreak < target) {
        const info = sdk.getMilestoneInfo(MilestoneType.SAVINGS_STREAK);
        nextMilestones.push({
          type: MilestoneType.SAVINGS_STREAK,
          title: `${target} Day Streak`,
          description: `Keep saving for ${target - userData.depositStreak} more days`,
          progress: userData.depositStreak,
          target,
          emoji: info.emoji,
          color: info.color,
        });
        break;
      }
    }

    // Financial freedom progress
    if (userData.financialFreedomTarget > 0) {
      const percentage = Math.round((userData.totalDeposited / userData.financialFreedomTarget) * 100);
      const milestones = [25, 50, 75, 100];
      
      for (const target of milestones) {
        if (percentage < target) {
          const info = sdk.getMilestoneInfo(MilestoneType.FINANCIAL_FREEDOM);
          nextMilestones.push({
            type: MilestoneType.FINANCIAL_FREEDOM,
            title: `${target}% to Freedom`,
            description: `Reach ${target}% of your financial freedom goal`,
            progress: percentage,
            target,
            emoji: info.emoji,
            color: info.color,
          });
          break;
        }
      }
    }

    // Education progress
    const completedModules = countBits(userData.educationProgress);
    if (completedModules < 10) {
      const info = sdk.getMilestoneInfo(MilestoneType.EDUCATION_COMPLETE);
      nextMilestones.push({
        type: MilestoneType.EDUCATION_COMPLETE,
        title: 'Complete All Lessons',
        description: `${completedModules}/10 modules completed`,
        progress: completedModules,
        target: 10,
        emoji: info.emoji,
        color: info.color,
      });
    }

    return nextMilestones.slice(0, 3); // Return top 3 next milestones
  }, [userData, sdk]);

  // Get progress for a specific milestone type
  const getMilestoneProgress = useCallback((type: MilestoneType): number => {
    if (!userData) return 0;

    switch (type) {
      case MilestoneType.AMOUNT_SAVED:
        // Progress to next amount milestone
        const amounts = [100, 1000, 5000, 10000, 50000, 100000];
        const nextAmount = amounts.find(a => a > userData.totalDeposited) || amounts[amounts.length - 1];
        return Math.min((userData.totalDeposited / nextAmount) * 100, 100);

      case MilestoneType.SAVINGS_STREAK:
        // Progress to next streak milestone
        const streaks = [7, 30, 90, 180, 365];
        const nextStreak = streaks.find(s => s > userData.depositStreak) || streaks[streaks.length - 1];
        return Math.min((userData.depositStreak / nextStreak) * 100, 100);

      case MilestoneType.FINANCIAL_FREEDOM:
        // Progress to financial freedom
        if (userData.financialFreedomTarget === 0) return 0;
        return Math.min((userData.totalDeposited / userData.financialFreedomTarget) * 100, 100);

      case MilestoneType.EDUCATION_COMPLETE:
        // Progress through education modules
        const completed = countBits(userData.educationProgress);
        return (completed / 10) * 100;

      case MilestoneType.REFERRAL_CHAMPION:
        // Progress to next referral milestone
        const referrals = [1, 3, 5, 10, 25];
        const nextReferral = referrals.find(r => r > userData.referralCount) || referrals[referrals.length - 1];
        return Math.min((userData.referralCount / nextReferral) * 100, 100);

      default:
        return 0;
    }
  }, [userData]);

  return {
    userData,
    milestones: userData?.milestones || [],
    isLoading,
    error,
    refreshData,
    hasAchievedMilestone,
    getNextMilestones,
    getMilestoneProgress,
  };
}

// Helper function to count set bits
function countBits(n: number): number {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
} 