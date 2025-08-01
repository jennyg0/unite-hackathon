"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useENS } from "@/hooks/useENS";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  DollarSign,
  BarChart3,
  Activity,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { use1inchData } from "@/hooks/use1inchData";
import { getOneInchAPI, WalletBalance } from "@/lib/1inch-api";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";
import { 
  TokenBalanceSkeleton, 
  LoadingDots,
  BalanceCardSkeleton 
} from "@/components/ui/LoadingSkeletons";
import { 
  ErrorState, 
  APIError, 
  NetworkError,
  InlineError 
} from "@/components/ui/ErrorStates";

interface PortfolioData {
  totalValue: number;
  totalPnl: number;
  totalPnlPercentage: number;
  assets: Array<{
    token: {
      address: string;
      symbol: string;
      name: string;
      decimals: number;
      logoURI: string;
    };
    balance: string;
    balanceUsd: number;
    price: number;
    pnl: number;
    pnlPercentage: number;
  }>;
}

export default function WalletBalanceV2() {
  const { user, authenticated } = usePrivy();
  const { getDisplayName, hasENS } = useENS();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const {
    walletBalances,
    totalWalletValue,
    fetchWalletBalances,
    prices,
    isLoading: hookLoading,
    error: hookError,
  } = use1inchData({ chainId: DEFAULT_CHAIN_ID });

  // Fetch portfolio data using wallet balances only (portfolio API has issues)
  const fetchPortfolioData = async () => {
    if (!user?.wallet?.address) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔗 Fetching data for wallet:', user.wallet.address);
      
      // Skip portfolio API, just fetch balances and prices
      await fetchWalletBalances(user.wallet.address);
      setLastUpdated(new Date());
      
      console.log('✅ Successfully fetched wallet data');
    } catch (err) {
      console.error('❌ Failed to fetch portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      console.log('🔗 Wallet connected:', user.wallet.address);
      console.log('👤 User object:', user);
      fetchPortfolioData();
      
      const interval = setInterval(fetchPortfolioData, 30000);
      return () => clearInterval(interval);
    } else {
      console.log('❌ No wallet address found:', { authenticated, userWallet: user?.wallet });
    }
  }, [authenticated, user?.wallet?.address]);

  // Calculate USD values using fetched prices from hook
  const calculateBalanceUsd = (balance: WalletBalance): number => {
    const tokenBalance = parseFloat(balance.balance) / Math.pow(10, balance.token.decimals);
    
    // Get price data from the hook's prices object
    const priceKey = balance.token.address;
    const priceData = prices[priceKey] || prices[priceKey.toLowerCase()];
    
    if (priceData && priceData.price > 0) {
      const usdValue = tokenBalance * priceData.price;
      console.log(`💰 ${balance.token.symbol}: ${tokenBalance} tokens × $${priceData.price} = $${usdValue}`);
      return usdValue;
    }
    
    console.warn(`⚠️ No price data for ${balance.token.symbol} (${priceKey})`);
    return 0;
  };
  
  const getTokenPrice = (balance: WalletBalance): number => {
    const priceKey = balance.token.address;
    const priceData = prices[priceKey] || prices[priceKey.toLowerCase()];
    return priceData?.price || 0;
  };
  
  // Calculate total value with current prices
  const calculateTotalValue = (): number => {
    return walletBalances.reduce((total, balance) => {
      return total + calculateBalanceUsd(balance);
    }, 0);
  };
  
  // Determine data source (portfolio API or balance API fallback)
  const displayData = portfolioData || {
    totalValue: calculateTotalValue(),
    totalPnl: 0,
    totalPnlPercentage: 0,
    assets: walletBalances.map(balance => ({
      token: balance.token,
      balance: balance.balance,
      balanceUsd: calculateBalanceUsd(balance),
      price: getTokenPrice(balance),
      pnl: 0,
      pnlPercentage: 0,
    })),
  };

  const formatCurrency = (value: number) => {
    if (hideBalances) return "••••••";
    
    // Check if we have price data from the hook
    const hasPriceData = walletBalances.some(balance => {
      const priceKey = balance.token.address;
      const priceData = prices[priceKey] || prices[priceKey.toLowerCase()];
      return priceData && priceData.price > 0;
    });
    
    if (!hasPriceData && value === 0) {
      return "Price unavailable";
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBalance = (balance: string, decimals: number) => {
    if (hideBalances) return "••••••";
    const formattedBalance = parseFloat(balance) / Math.pow(10, decimals);
    return formattedBalance.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  };

  const formatPercentage = (percentage: number) => {
    if (hideBalances) return "••••";
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage.toFixed(2)}%`;
  };

  if (!authenticated) {
    return (
      <div className="card text-center">
        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Connect your wallet to view your portfolio and balances
        </p>
      </div>
    );
  }

  const loading = isLoading || hookLoading;

  return (
    <div className="space-y-4">
      {/* Main Portfolio Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
                {hasENS && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    ENS
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">
                  {getDisplayName()}
                </p>
                {lastUpdated && (
                  <>
                    <span className="text-gray-300">•</span>
                    <p className="text-sm text-gray-500">
                      Updated {lastUpdated.toLocaleTimeString()}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setHideBalances(!hideBalances)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {hideBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <button
              onClick={fetchPortfolioData}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <InlineError 
              message={error} 
              onDismiss={() => {
                setError(null);
                fetchPortfolioData();
              }} 
            />
          </div>
        )}

        {loading ? (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Main balance skeleton */}
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-32 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  animate={{ x: [-100, 100] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </div>
              <div className="h-4 bg-gray-200 rounded w-24 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  animate={{ x: [-100, 100] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.1 }}
                />
              </div>
            </div>
            
            {/* Stats grid skeleton */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-12 mx-auto relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                      animate={{ x: [-20, 20] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: i * 0.1 }}
                    />
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-8 mx-auto relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                      animate={{ x: [-20, 20] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: i * 0.1 + 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Loading status */}
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
              <span>Loading portfolio data</span>
              <LoadingDots />
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Total Value */}
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(displayData.totalValue)}
                </span>
                {portfolioData && (
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    displayData.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {displayData.totalPnl >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>{formatCurrency(Math.abs(displayData.totalPnl))}</span>
                    <span>({formatPercentage(displayData.totalPnlPercentage)})</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Total Portfolio Value</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">Assets</div>
                <div className="text-lg font-semibold text-gray-900">
                  {displayData.assets.length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">Tokens with Value</div>
                <div className="text-lg font-semibold text-gray-900">
                  {displayData.assets.filter(a => a.balanceUsd > 0.01).length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">Data Source</div>
                <div className="text-lg font-semibold text-gray-900">
                  {portfolioData ? "Portfolio API" : "Balance API"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-4 flex items-center justify-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="text-sm font-medium">
            {showDetails ? 'Hide Details' : 'View Asset Details'}
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </motion.div>

      {/* Asset Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card overflow-hidden"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Asset Breakdown</h4>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <TokenBalanceSkeleton key={i} />
                ))}
              </div>
            ) : displayData.assets.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No assets found in this wallet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayData.assets
                  .sort((a, b) => b.balanceUsd - a.balanceUsd)
                  .map((asset, index) => (
                    <motion.div
                      key={asset.token.address}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {asset.token.logoURI ? (
                          <img
                            src={asset.token.logoURI}
                            alt={asset.token.symbol}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {asset.token.symbol.slice(0, 2)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {asset.token.symbol}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatBalance(asset.balance, asset.token.decimals)} {asset.token.symbol}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {asset.price > 0 ? formatCurrency(asset.balanceUsd) : (
                            <span className="text-gray-500 text-sm">Price unavailable</span>
                          )}
                        </div>
                        {asset.price > 0 && (
                          <div className="text-xs text-gray-500">
                            ${asset.price.toFixed(asset.price < 1 ? 4 : 2)} per token
                          </div>
                        )}
                        {portfolioData && asset.pnl !== 0 && (
                          <div className={`text-sm ${
                            asset.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercentage(asset.pnlPercentage)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}