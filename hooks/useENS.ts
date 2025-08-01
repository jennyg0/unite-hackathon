import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
// Create a public client for ENS lookups using our 1inch proxy
// Only create client if we're in browser environment
const publicClient = typeof window !== 'undefined' ? createPublicClient({
  chain: mainnet,
  transport: http('/api/1inch-rpc/1'),
}) : null;

export function useENS() {
  const { user } = usePrivy();
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedChain, setHasCheckedChain] = useState(false);

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

        // Then check the actual blockchain for reverse resolution
        if (!hasCheckedChain && publicClient) {
          const name = await publicClient.getEnsName({
            address: user.wallet.address as `0x${string}`,
          });
          
          if (name) {
            setEnsName(name.replace('.eth', ''));
            localStorage.setItem('userENSName', name.replace('.eth', ''));
          }
          setHasCheckedChain(true);
        }
      } catch (error) {
        console.error('Error checking ENS:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkENS();
  }, [user, hasCheckedChain]);

  const getDisplayName = (address?: string): string => {
    if (ensName) {
      return `${ensName}.eth`;
    }
    
    if (!address) {
      address = user?.wallet?.address;
    }
    
    if (!address) {
      return 'Not connected';
    }
    
    // Return shortened address if no ENS
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const checkAvailability = async (name: string): Promise<boolean> => {
    if (!publicClient) return false;
    
    try {
      const normalizedName = normalize(name);
      const resolver = await publicClient.getEnsResolver({ name: `${normalizedName}.eth` });
      // If no resolver, the name is likely available
      return !resolver;
    } catch (error) {
      // If normalization fails or other errors, assume unavailable
      console.error('Error checking ENS availability:', error);
      return false;
    }
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