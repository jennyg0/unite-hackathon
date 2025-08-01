import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { getCachedENSName, formatAddressWithENS } from '@/lib/1inch-domains';

export function useENS() {
  const { user } = usePrivy();
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAPI, setHasCheckedAPI] = useState(false);

  useEffect(() => {
    const checkENS = async () => {
      if (!user?.wallet?.address) {
        setIsLoading(false);
        return;
      }

      try {
        // First check localStorage for saved ENS name
        const savedENS = localStorage.getItem('userENSName');
        if (savedENS) {
          setEnsName(savedENS);
        }

        // Then check using 1inch Domains API for reverse resolution
        if (!hasCheckedAPI) {
          console.log('🔍 Checking ENS for user address:', user.wallet.address);
          const resolvedName = await getCachedENSName(user.wallet.address);
          
          if (resolvedName) {
            // Remove .eth suffix if present for consistency
            const cleanName = resolvedName.replace('.eth', '');
            setEnsName(cleanName);
            localStorage.setItem('userENSName', cleanName);
            console.log('✅ Found ENS name:', resolvedName);
          } else {
            console.log('ℹ️ No ENS name found for address');
          }
          setHasCheckedAPI(true);
        }
      } catch (error) {
        console.error('Error checking ENS:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkENS();
  }, [user, hasCheckedAPI]);

  const getDisplayName = (address?: string): string => {
    const targetAddress = address || user?.wallet?.address;
    
    if (!targetAddress) {
      return 'Not connected';
    }
    
    // Use our 1inch-domains utility to format address with ENS
    return formatAddressWithENS(targetAddress, ensName ? `${ensName}.eth` : null);
  };

  const checkAvailability = async (name: string): Promise<boolean> => {
    // For now, return false since we'd need additional API endpoints
    // This could be enhanced with 1inch Domains API forward lookup if available
    console.warn('ENS availability checking not implemented with 1inch Domains API yet');
    return false;
  };

  const setUserENS = (name: string) => {
    localStorage.setItem('userENSName', name);
    setEnsName(name);
  };

  const clearENS = () => {
    localStorage.removeItem('userENSName');
    setEnsName(null);
  };

  return {
    ensName,
    isLoading,
    getDisplayName,
    setUserENS,
    clearENS,
    hasENS: !!ensName,
    checkAvailability,
  };
} 