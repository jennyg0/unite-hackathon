"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Zap,
  Target
} from "lucide-react";
import { getOneInchCharts, ChartDataPoint } from "@/lib/1inch-charts";
import { ChartSkeleton } from "@/components/ui/LoadingSkeletons";
import { ErrorState } from "@/components/ui/ErrorStates";
import { usePrivy } from "@privy-io/react-auth";
import { use1inchData } from "@/hooks/use1inchData";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";

// Utility functions
function formatPrice(price: number, symbol: string) {
  if (symbol === 'USDC') return `$${price.toFixed(4)}`;
  if (price > 1000) return `$${price.toFixed(0)}`;
  if (price > 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(6)}`;
}

function formatChange(change: number, isPercent: boolean = false) {
  const prefix = change >= 0 ? '+' : '';
  if (isPercent) {
    return `${prefix}${change.toFixed(2)}%`;
  }
  return `${prefix}$${Math.abs(change).toFixed(2)}`;
}

interface PortfolioChartsProps {
  tokens?: Array<{
    address: string;
    symbol: string;
    balance: number;
    balanceUsd: number;
  }>;
}

interface ChartPeriod {
  value: '1h' | '4h' | '1d' | '1w' | '1M';
  label: string;
}

interface TokenChartData {
  token: {
    address: string;
    symbol: string;
  };
  data: ChartDataPoint[];
  currentPrice: number;
  change24h: number;
  changePercent: number;
}

export default function PortfolioCharts({ tokens }: PortfolioChartsProps) {
  const { authenticated, user } = usePrivy();
  const [chartData, setChartData] = useState<TokenChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod['value']>('1d');
  const [selectedChart, setSelectedChart] = useState<'portfolio' | 'individual'>('portfolio');

  const periods: ChartPeriod[] = [
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1M', label: '1M' },
  ];

  // Get real wallet balances
  const {
    walletBalances,
    totalWalletValue,
    fetchWalletBalances,
    isLoading: balancesLoading,
    error: balancesError,
  } = use1inchData({ chainId: DEFAULT_CHAIN_ID });

  // Use real wallet tokens or provided tokens, filtered to only show tokens with value
  const realTokens = walletBalances
    .filter(balance => balance.balanceUsd > 0.01) // Only show tokens with meaningful value
    .map(balance => ({
      address: balance.token.address,
      symbol: balance.token.symbol,
      balance: parseFloat(balance.balance) / Math.pow(10, balance.token.decimals),
      balanceUsd: balance.balanceUsd
    }));

  const displayTokens = tokens || realTokens;

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      // First fetch wallet balances, then chart data
      fetchWalletBalances(user.wallet.address).then(() => {
        fetchChartData();
      });
    }
  }, [selectedPeriod, authenticated, user?.wallet?.address]);

  const fetchChartData = async () => {
    if (displayTokens.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const charts = getOneInchCharts();
      const chartPromises = displayTokens.map(async (token) => {
        try {
          const data = await charts.getTokenPriceChart(
            token.address,
            selectedPeriod,
            137 // Polygon
          );

          // Calculate price changes
          const currentPrice = data[data.length - 1]?.price || 0;
          const previousPrice = data[0]?.price || currentPrice;
          const change24h = currentPrice - previousPrice;
          const changePercent = previousPrice > 0 ? (change24h / previousPrice) * 100 : 0;

          return {
            token: {
              address: token.address,
              symbol: token.symbol,
            },
            data,
            currentPrice,
            change24h,
            changePercent,
          };
        } catch (error) {
          console.error(`Failed to fetch chart for ${token.symbol}:`, error);
          
          return {
            token: {
              address: token.address,
              symbol: token.symbol,
            },
            data: [],
            currentPrice: 0,
            change24h: 0,
            changePercent: 0,
          };
        }
      });

      const results = await Promise.all(chartPromises);
      setChartData(results);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setError('Failed to load chart data');
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };


  const calculatePortfolioValue = () => {
    return displayTokens.reduce((total, token, index) => {
      const chartInfo = chartData[index];
      const currentValue = chartInfo ? token.balance * chartInfo.currentPrice : token.balanceUsd;
      return total + currentValue;
    }, 0);
  };

  const calculatePortfolioChange = () => {
    const totalValue = calculatePortfolioValue();
    const initialValue = displayTokens.reduce((total, token) => total + token.balanceUsd, 0);
    const change = totalValue - initialValue;
    const changePercent = initialValue > 0 ? (change / initialValue) * 100 : 0;
    return { change, changePercent };
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <ChartSkeleton key={i} />
          ))}
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="card text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Connect your wallet to view portfolio charts and analytics
        </p>
      </div>
    );
  }

  if (displayTokens.length === 0 && !isLoading) {
    return (
      <div className="card text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Tokens Found
        </h3>
        <p className="text-gray-600">
          Your portfolio will appear here once you have tokens with value in your wallet
        </p>
      </div>
    );
  }

  if (error && chartData.length === 0) {
    return (
      <ErrorState
        title="Charts Unavailable"
        message="Unable to load portfolio charts. Please try again later."
        onAction={fetchChartData}
      />
    );
  }

  const portfolioStats = calculatePortfolioChange();

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Portfolio Performance</h3>
            <p className="text-gray-600 text-sm">Real-time price data via 1inch Charts API</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchChartData}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div 
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700">Total Value</p>
                <p className="text-xl font-bold text-green-900">
                  ${calculatePortfolioValue().toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className={`rounded-lg p-4 ${
              portfolioStats.change >= 0 
                ? 'bg-gradient-to-br from-blue-50 to-blue-100' 
                : 'bg-gradient-to-br from-red-50 to-red-100'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                portfolioStats.change >= 0 ? 'bg-blue-600' : 'bg-red-600'
              }`}>
                {portfolioStats.change >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-white" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <p className={`text-sm ${
                  portfolioStats.change >= 0 ? 'text-blue-700' : 'text-red-700'
                }`}>
                  24h Change
                </p>
                <p className={`text-xl font-bold ${
                  portfolioStats.change >= 0 ? 'text-blue-900' : 'text-red-900'
                }`}>
                  {formatChange(portfolioStats.changePercent, true)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700">Assets</p>
                <p className="text-xl font-bold text-purple-900">
                  {displayTokens.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-yellow-700">Best Performer</p>
                <p className="text-xl font-bold text-yellow-900">
                  {chartData.length > 0 
                    ? chartData.reduce((best, current) => 
                        current.changePercent > best.changePercent ? current : best
                      ).token.symbol
                    : 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedChart('portfolio')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedChart === 'portfolio'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Portfolio
            </button>
            <button
              onClick={() => setSelectedChart('individual')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedChart === 'individual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LineChart className="w-4 h-4 inline mr-1" />
              Individual
            </button>
          </div>
        </div>
      </motion.div>

      {/* Charts Display */}
      <AnimatePresence mode="wait">
        {selectedChart === 'portfolio' ? (
          <PortfolioChart key="portfolio" chartData={chartData} tokens={displayTokens} />
        ) : (
          <IndividualCharts key="individual" chartData={chartData} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Portfolio Chart Component
function PortfolioChart({ chartData, tokens }: { 
  chartData: TokenChartData[]; 
  tokens: any[];
}) {
  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Composition</h4>
      
      {/* Asset Breakdown */}
      <div className="space-y-3">
        {tokens.map((token, index) => {
          const chartInfo = chartData[index];
          const percentage = (token.balanceUsd / tokens.reduce((sum, t) => sum + t.balanceUsd, 0)) * 100;
          
          return (
            <motion.div
              key={token.address}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {token.symbol.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{token.symbol}</p>
                  <p className="text-sm text-gray-500">
                    {token.balance.toLocaleString()} tokens
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${token.balanceUsd.toFixed(2)}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500">
                    {percentage.toFixed(1)}%
                  </p>
                  {chartInfo && (
                    <p className={`text-sm font-medium ${
                      chartInfo.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatChange(chartInfo.changePercent, true)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Individual Charts Component
function IndividualCharts({ chartData }: { chartData: TokenChartData[] }) {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {chartData.map((chart, index) => (
        <motion.div
          key={chart.token.address}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">{chart.token.symbol}</h4>
              <p className="text-sm text-gray-500">
                {formatPrice(chart.currentPrice, chart.token.symbol)}
              </p>
            </div>
            <div className={`text-right ${
              chart.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className="flex items-center space-x-1">
                {chart.changePercent >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {formatChange(chart.changePercent, true)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Mini Chart Visualization */}
          <div className="h-24 flex items-end space-x-1">
            {chart.data.length > 0 ? (
              chart.data.slice(-20).map((point, i) => {
                const height = Math.max(((point.price - Math.min(...chart.data.map(p => p.price))) / 
                  (Math.max(...chart.data.map(p => p.price)) - Math.min(...chart.data.map(p => p.price)))) * 100, 5);
                
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className={`flex-1 rounded-t ${
                      chart.changePercent >= 0 ? 'bg-green-400' : 'bg-red-400'
                    }`}
                  />
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <LineChart className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs">No data</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}