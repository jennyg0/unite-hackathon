import { useEffect, useState } from 'react';
import { useENS } from './useENS';
import { Milestone, MilestoneType } from '@/lib/milestone-nft';

/**
 * Hook to check if user has achieved ENS milestone
 */
export function useENSMilestone(): {
  ensMilestone: Milestone | null;
  hasENSMilestone: boolean;
} {
  const { hasENS, ensName } = useENS();
  const [ensMilestone, setEnsMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    if (hasENS && ensName) {
      const milestone: Milestone = {
        id: 999, // Special ID for ENS milestone
        type: MilestoneType.ENS_IDENTITY,
        value: 1, // Boolean milestone (1 = achieved)
        title: 'Web3 Identity',
        description: `Owns ENS name: ${ensName}.eth`,
        timestamp: new Date(), // We don't know when they got it, so use current time
        imageUrl: '🌐', // Use emoji as placeholder
      };
      setEnsMilestone(milestone);
    } else {
      setEnsMilestone(null);
    }
  }, [hasENS, ensName]);

  return {
    ensMilestone,
    hasENSMilestone: hasENS,
  };
}