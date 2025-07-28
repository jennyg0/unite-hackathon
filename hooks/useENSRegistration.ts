import { useState, useCallback, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { createWalletClient, createPublicClient, custom, http } from 'viem';
import { mainnet } from 'viem/chains';
import {
  generateSecret,
  checkENSAvailable,
  getENSPrice,
  createENSCommitment,
  submitCommitment,
  registerENSName,
  COMMITMENT_WAIT_TIME,
  type RegistrationState,
  type ENSPrice,
} from '@/lib/ens-registration';

export function useENSRegistration() {
  const { user, sendTransaction } = usePrivy();
  const [state, setState] = useState<RegistrationState>({ step: 'idle' });
  const [price, setPrice] = useState<ENSPrice | null>(null);
  const [registrationData, setRegistrationData] = useState<{
    name: string;
    secret: `0x${string}`;
    commitment: `0x${string}`;
  } | null>(null);

  // Create clients
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY || 'demo'}`),
  });

  // Check if name is available and get price
  const checkNameAndPrice = useCallback(async (name: string) => {
    setState({ step: 'checking' });
    
    try {
      // Check availability
      const isAvailable = await checkENSAvailable(name, publicClient);
      if (!isAvailable) {
        setState({ 
          step: 'error', 
          error: `${name}.eth is not available` 
        });
        return false;
      }

      // Get price
      const ensPrice = await getENSPrice(name, undefined, publicClient);
      setPrice(ensPrice);
      
      setState({ step: 'idle' });
      return true;
    } catch (error) {
      setState({ 
        step: 'error', 
        error: error instanceof Error ? error.message : 'Failed to check name' 
      });
      return false;
    }
  }, [publicClient]);

  // Start registration process
  const startRegistration = useCallback(async (name: string) => {
    if (!user?.wallet?.address) {
      setState({ step: 'error', error: 'Wallet not connected' });
      return;
    }

    setState({ step: 'committing' });

    try {
      // Generate secret and commitment
      const secret = generateSecret();
      const commitment = await createENSCommitment(
        {
          name,
          owner: user.wallet.address,
        },
        secret,
        publicClient
      );

      // Store registration data
      setRegistrationData({ name, secret, commitment });

      // Submit commitment transaction using Privy
      const txData = {
        to: '0x253553366Da8546fC250F225fe3d25d0C782303b', // ENS Controller
        data: `0x0f14a06e${commitment.slice(2)}`, // commit function selector + commitment
        chainId: 1, // Ethereum mainnet
      };

      const txReceipt = await sendTransaction(txData);
      const hash = typeof txReceipt === 'string' ? txReceipt : txReceipt.transactionHash;

      // Wait for transaction confirmation
      await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });

      // Start waiting period
      const waitEndTime = Date.now() + (COMMITMENT_WAIT_TIME * 1000);
      setState({ 
        step: 'waiting', 
        commitmentHash: hash,
        waitEndTime,
      });

      // Store in localStorage for recovery
      localStorage.setItem('ensRegistration', JSON.stringify({
        name,
        secret,
        commitment,
        commitmentHash: hash,
        waitEndTime,
      }));

    } catch (error) {
      setState({ 
        step: 'error', 
        error: error instanceof Error ? error.message : 'Failed to submit commitment' 
      });
    }
  }, [user, publicClient, sendTransaction]);

  // Complete registration after waiting period
  const completeRegistration = useCallback(async () => {
    if (!registrationData || !price || !user?.wallet?.address) {
      setState({ step: 'error', error: 'Missing registration data' });
      return;
    }

    setState({ step: 'registering' });

    try {
      // Prepare registration transaction data
      const { name, secret } = registrationData;
      
      // This is a simplified version - in production, you'd encode the full transaction
      const txData = {
        to: '0x253553366Da8546fC250F225fe3d25d0C782303b', // ENS Controller
        value: ((price.total * BigInt(110)) / BigInt(100)).toString(), // Add 10% buffer
        chainId: 1, // Ethereum mainnet
        // In production, properly encode the register function call
        data: '0x...' // This would be the encoded register function
      };

      const txReceipt = await sendTransaction(txData);
      const hash = typeof txReceipt === 'string' ? txReceipt : txReceipt.transactionHash;

      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });

      setState({ 
        step: 'complete', 
        registrationHash: hash 
      });

      // Clean up localStorage
      localStorage.removeItem('ensRegistration');

      // Store the ENS name
      localStorage.setItem('userENSName', name);

    } catch (error) {
      setState({ 
        step: 'error', 
        error: error instanceof Error ? error.message : 'Failed to complete registration' 
      });
    }
  }, [registrationData, price, user, publicClient, sendTransaction]);

  // Check for pending registration on mount
  useEffect(() => {
    const stored = localStorage.getItem('ensRegistration');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setRegistrationData({
          name: data.name,
          secret: data.secret,
          commitment: data.commitment,
        });
        
        if (data.waitEndTime > Date.now()) {
          setState({
            step: 'waiting',
            commitmentHash: data.commitmentHash,
            waitEndTime: data.waitEndTime,
          });
        }
      } catch (error) {
        console.error('Failed to restore registration:', error);
      }
    }
  }, []);

  // Auto-complete registration when wait time is over
  useEffect(() => {
    if (state.step === 'waiting' && state.waitEndTime) {
      const timeLeft = state.waitEndTime - Date.now();
      if (timeLeft <= 0) {
        // Wait time is over, ready to complete
        setState(prev => ({ ...prev, step: 'idle' }));
      } else {
        // Set timer for remaining time
        const timer = setTimeout(() => {
          setState(prev => ({ ...prev, step: 'idle' }));
        }, timeLeft);
        return () => clearTimeout(timer);
      }
    }
  }, [state.step, state.waitEndTime]);

  return {
    state,
    price,
    checkNameAndPrice,
    startRegistration,
    completeRegistration,
    timeRemaining: state.waitEndTime ? Math.max(0, state.waitEndTime - Date.now()) : 0,
  };
} 