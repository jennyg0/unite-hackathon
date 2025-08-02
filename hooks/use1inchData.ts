"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getOneInchAPI, 
  getCommonTokens, 
  getTokenPriceUSD, 
  getWalletTotalValue,
  TokenInfo, 
  PriceData, 
  WalletBalance, 
  GasPrice,
  QuoteResponse 
} from '@/lib/1inch-api';

interface Use1inchDataOptions {
  chainId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function use1inchData(options: Use1inchDataOptions = {}) {
  const { 
    chainId = 137, 
    autoRefresh = true, 
    refreshInterval = 30000 // 30 seconds
  } = options;

  // State for different data types
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [commonTokens, setCommonTokens] = useState<TokenInfo[]>([]);
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
  const [gasPrice, setGasPrice] = useState<GasPrice | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});

  // API instance
  const api = useMemo(() => getOneInchAPI(chainId), [chainId]);

  // Loading state helpers
  const setLoadingState = useCallback((key: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  const setErrorState = useCallback((key: string, errorMessage: string) => {
    setError(prev => ({ ...prev, [key]: errorMessage }));
  }, []);

  // Fetch all supported tokens
  const fetchTokens = useCallback(async () => {
    setLoadingState('tokens', true);
    setErrorState('tokens', '');
    
    try {
      const allTokens = await api.getTokens();
      setTokens(allTokens);
      
      // Also fetch common tokens
      const common = await getCommonTokens(chainId);
      setCommonTokens(common);
    } catch (err) {
      setErrorState('tokens', err instanceof Error ? err.message : 'Failed to fetch tokens');
    } finally {
      setLoadingState('tokens', false);
    }
  }, [api, chainId, setLoadingState, setErrorState]);

  // Fetch token prices
  const fetchTokenPrices = useCallback(async (tokenAddresses: string[]) => {
    if (tokenAddresses.length === 0) return;
    
    setLoadingState('prices', true);
    setErrorState('prices', '');
    
    try {
      console.log('💵 Fetching prices for tokens:', tokenAddresses);
      const priceData = await api.getTokenPrices(tokenAddresses);
      console.log('💵 Received price data:', priceData.length, 'prices');
      
      const priceMap = priceData.reduce((acc, price) => {
        acc[price.token] = price;
        return acc;
      }, {} as Record<string, PriceData>);
      
      setPrices(prev => ({ ...prev, ...priceMap }));
      console.log('💵 Updated price map with', Object.keys(priceMap).length, 'new prices');
    } catch (err) {
      console.error('❌ Failed to fetch token prices:', err);
      setErrorState('prices', err instanceof Error ? err.message : 'Failed to fetch prices');
      // Don't throw, just log the error and continue
    } finally {
      setLoadingState('prices', false);
    }
  }, [api, setLoadingState, setErrorState]);

  // Fetch single token price
  const fetchTokenPrice = useCallback(async (tokenAddress: string) => {
    setLoadingState(`price-${tokenAddress}`, true);
    setErrorState(`price-${tokenAddress}`, '');
    
    try {
      const priceData = await api.getTokenPrice(tokenAddress);
      if (priceData) {
        setPrices(prev => ({ ...prev, [tokenAddress]: priceData }));
      }
    } catch (err) {
      setErrorState(`price-${tokenAddress}`, err instanceof Error ? err.message : 'Failed to fetch price');
    } finally {
      setLoadingState(`price-${tokenAddress}`, false);
    }
  }, [api, setLoadingState, setErrorState]);

  // Fetch wallet balances
  const fetchWalletBalances = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return;
    
    setLoadingState('balances', true);
    setErrorState('balances', '');
    
    try {
      console.log('🔍 Fetching wallet balances for:', walletAddress);
      const balances = await api.getWalletBalances(walletAddress);
      console.log('✅ Received balances:', balances.length);
      setWalletBalances(balances);
      
      // Also fetch prices for tokens with balances
      const tokenAddresses = balances.map(b => b.token.address).filter(Boolean);
      console.log('💰 Fetching prices for tokens:', tokenAddresses);
      if (tokenAddresses.length > 0) {
        try {
          await fetchTokenPrices(tokenAddresses);
        } catch (priceError) {
          console.warn('⚠️ Failed to fetch prices, but balances are available:', priceError);
          // Don't fail the entire operation if only prices fail
        }
      }
    } catch (err) {
      console.error('❌ Failed to fetch wallet balances:', err);
      setErrorState('balances', err instanceof Error ? err.message : 'Failed to fetch balances');
      
      // Set empty array to prevent undefined errors, but try to maintain any existing data
      if (walletBalances.length === 0) {
        console.log("⚠️ No existing balances, setting to empty array");
        setWalletBalances([]);
      } else {
        console.log("⚡ Keeping existing balances to prevent data loss");
      }
    } finally {
      setLoadingState('balances', false);
    }
  }, [api, fetchTokenPrices, setLoadingState, setErrorState]);

  // Fetch gas price
  const fetchGasPrice = useCallback(async () => {
    setLoadingState('gas', true);
    setErrorState('gas', '');
    
    try {
      const gasData = await api.getGasPrice();
      setGasPrice(gasData);
    } catch (err) {
      setErrorState('gas', err instanceof Error ? err.message : 'Failed to fetch gas price');
    } finally {
      setLoadingState('gas', false);
    }
  }, [api, setLoadingState, setErrorState]);

  // Get swap quote
  const getQuote = useCallback(async (
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    walletAddress?: string
  ): Promise<QuoteResponse | null> => {
    setLoadingState('quote', true);
    setErrorState('quote', '');
    
    try {
      const quote = await api.getQuote(fromTokenAddress, toTokenAddress, amount, walletAddress);
      return quote;
    } catch (err) {
      setErrorState('quote', err instanceof Error ? err.message : 'Failed to get quote');
      return null;
    } finally {
      setLoadingState('quote', false);
    }
  }, [api, setLoadingState, setErrorState]);

  // Get token metadata
  const getTokenMetadata = useCallback(async (tokenAddress: string): Promise<TokenInfo | null> => {
    setLoadingState(`metadata-${tokenAddress}`, true);
    setErrorState(`metadata-${tokenAddress}`, '');
    
    try {
      const metadata = await api.getTokenMetadata(tokenAddress);
      return metadata;
    } catch (err) {
      setErrorState(`metadata-${tokenAddress}`, err instanceof Error ? err.message : 'Failed to fetch metadata');
      return null;
    } finally {
      setLoadingState(`metadata-${tokenAddress}`, false);
    }
  }, [api, setLoadingState, setErrorState]);

  // Get price chart data
  const getPriceChart = useCallback(async (tokenAddress: string, days: number = 30) => {
    setLoadingState(`chart-${tokenAddress}`, true);
    setErrorState(`chart-${tokenAddress}`, '');
    
    try {
      const chartData = await api.getPriceChart(tokenAddress, days);
      return chartData;
    } catch (err) {
      setErrorState(`chart-${tokenAddress}`, err instanceof Error ? err.message : 'Failed to fetch chart data');
      return [];
    } finally {
      setLoadingState(`chart-${tokenAddress}`, false);
    }
  }, [api, setLoadingState, setErrorState]);

  // Get portfolio overview
  const getPortfolioOverview = useCallback(async (walletAddress: string) => {
    setLoadingState('portfolio', true);
    setErrorState('portfolio', '');
    
    try {
      const portfolio = await api.getPortfolioOverview(walletAddress);
      return portfolio;
    } catch (err) {
      setErrorState('portfolio', err instanceof Error ? err.message : 'Failed to fetch portfolio');
      return null;
    } finally {
      setLoadingState('portfolio', false);
    }
  }, [api, setLoadingState, setErrorState]);

  // Get token details
  const getTokenDetails = useCallback(async (tokenAddress: string) => {
    setLoadingState(`details-${tokenAddress}`, true);
    setErrorState(`details-${tokenAddress}`, '');
    
    try {
      const details = await api.getTokenDetails(tokenAddress);
      return details;
    } catch (err) {
      setErrorState(`details-${tokenAddress}`, err instanceof Error ? err.message : 'Failed to fetch token details');
      return null;
    } finally {
      setLoadingState(`details-${tokenAddress}`, false);
    }
  }, [api, setLoadingState, setErrorState]);

  // Get transaction history
  const getTransactionHistory = useCallback(async (walletAddress: string, limit: number = 100) => {
    setLoadingState('history', true);
    setErrorState('history', '');
    
    try {
      const history = await api.getTransactionHistory(walletAddress, limit);
      return history;
    } catch (err) {
      setErrorState('history', err instanceof Error ? err.message : 'Failed to fetch transaction history');
      return [];
    } finally {
      setLoadingState('history', false);
    }
  }, [api, setLoadingState, setErrorState]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Refresh prices and gas price
      if (Object.keys(prices).length > 0) {
        fetchTokenPrices(Object.keys(prices));
      }
      fetchGasPrice();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, prices, fetchTokenPrices, fetchGasPrice]);

  // Initial data fetch
  useEffect(() => {
    fetchTokens();
    fetchGasPrice();
  }, [fetchTokens, fetchGasPrice]);

  // Computed values
  const totalWalletValue = useMemo(() => {
    const total = walletBalances.reduce((total, balance) => total + balance.balanceUsd, 0);
    console.log("💰 Calculated totalWalletValue:", total, "from", walletBalances.length, "tokens");
    return total;
  }, [walletBalances]);

  const isLoading = useMemo(() => {
    return Object.values(loading).some(Boolean);
  }, [loading]);

  const hasError = useMemo(() => {
    return Object.keys(error).length > 0;
  }, [error]);

  return {
    // Data
    tokens,
    commonTokens,
    prices,
    walletBalances,
    gasPrice,
    totalWalletValue,
    
    // Loading states
    loading,
    isLoading,
    
    // Error states
    error,
    hasError,
    
    // Actions
    fetchTokens,
    fetchTokenPrices,
    fetchTokenPrice,
    fetchWalletBalances,
    fetchGasPrice,
    getQuote,
    getTokenMetadata,
    getPriceChart,
    getPortfolioOverview,
    getTokenDetails,
    getTransactionHistory,
    
    // Utilities
    getTokenPrice: (tokenAddress: string) => prices[tokenAddress]?.price || 0,
    getTokenBalance: (tokenAddress: string) => 
      walletBalances.find(b => b.token.address.toLowerCase() === tokenAddress.toLowerCase()),
  };
} 