import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

// Create a public client for ENS lookups on mainnet
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY || 'demo'}`),
});

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
        if (!hasCheckedChain) {
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