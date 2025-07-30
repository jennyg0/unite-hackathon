import { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { 
  getOneInchFusionSDK, 
  getCrossChainQuote, 
  findOptimalDepositRoute, 
  getSupportedCrossChainRoutes,
  type FusionQuoteResult 
} from '@/lib/1inch-fusion-sdk';

interface FusionSwapState {
  isLoading: boolean;
  error: string | null;
  quote: FusionQuoteResult | null;
  supportedChains: Array<{ chainId: number; name: string }>;
  bestRoutes: {
    bestOption: any;
    allOptions: any[];
  } | null;
}

export function useFusionSwap() {
  const { user, authenticated } = usePrivy();
  const [state, setState] = useState<FusionSwapState>({
    isLoading: false,
    error: null,
    quote: null,
    supportedChains: [],
    bestRoutes: null,
  });

  // Get cross-chain swap quote
  const getQuote = useCallback(async (params: {
    fromChainId: number;
    fromTokenAddress: string;
    amount: string;
    toChainId?: number;
  }) => {
    if (!user?.wallet?.address) {
      throw new Error('User wallet not connected');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const quote = await getCrossChainQuote(
        user.wallet.address,
        params.fromChainId,
        params.fromTokenAddress,
        params.amount,
        params.toChainId
      );

      setState(prev => ({ ...prev, quote, isLoading: false }));
      return quote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get quote';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, [user?.wallet?.address]);

  // Find best deposit routes across chains
  const findBestRoutes = useCallback(async (targetAmountUsd: number, targetChainId?: number) => {
    if (!user?.wallet?.address) {
      throw new Error('User wallet not connected');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const routes = await findOptimalDepositRoute(
        user.wallet.address,
        targetAmountUsd,
        targetChainId
      );

      setState(prev => ({ ...prev, bestRoutes: routes, isLoading: false }));
      return routes;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to find routes';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, [user?.wallet?.address]);

  // Load supported chains
  const loadSupportedChains = useCallback(() => {
    try {
      const chains = getSupportedCrossChainRoutes();
      setState(prev => ({ ...prev, supportedChains: chains }));
      return chains;
    } catch (error) {
      console.error('Failed to load supported chains:', error);
      return [];
    }
  }, []);

  // Check if a route is supported
  const isRouteSupported = useCallback((fromChainId: number, toChainId: number) => {
    try {
      const sdk = getOneInchFusionSDK();
      return sdk.isRouteSupported(fromChainId, toChainId);
    } catch (error) {
      console.error('Failed to check route support:', error);
      return false;
    }
  }, []);

  // Get user's orders
  const getUserOrders = useCallback(async () => {
    if (!user?.wallet?.address) {
      throw new Error('User wallet not connected');
    }

    try {
      const sdk = getOneInchFusionSDK();
      return await sdk.getOrdersByMaker(user.wallet.address);
    } catch (error) {
      console.error('Failed to get user orders:', error);
      return [];
    }
  }, [user?.wallet?.address]);

  // Clear current state
  const clearState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      quote: null,
      supportedChains: [],
      bestRoutes: null,
    });
  }, []);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    quote: state.quote,
    supportedChains: state.supportedChains,
    bestRoutes: state.bestRoutes,

    // Actions
    getQuote,
    findBestRoutes,
    loadSupportedChains,
    getUserOrders,
    clearState,

    // Utilities
    isRouteSupported,
    isConnected: authenticated && !!user?.wallet?.address,
  };
}