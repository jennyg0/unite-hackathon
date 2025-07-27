import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export function useENS() {
  const { user } = usePrivy();
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved ENS name
    const savedENS = localStorage.getItem('userENSName');
    if (savedENS) {
      setEnsName(savedENS);
    }
    
    // In production, this would also check the ENS registry
    // to see if the user already has an ENS name registered
    setIsLoading(false);
  }, [user]);

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
  };
} 