"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  ArrowRightLeft,
  DollarSign,
  Clock,
  TrendingDown,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  Info,
  Zap,
  Globe,
} from "lucide-react";
import { useFusionSwap } from "@/hooks/useFusionSwap";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";

interface CrossChainDepositProps {
  onDepositSelected?: (route: any) => void;
  targetAmount?: number;
}

export default function CrossChainDeposit({ 
  onDepositSelected, 
  targetAmount = 100 
}: CrossChainDepositProps) {
  const { authenticated } = usePrivy();
  const {
    isLoading,
    error,
    bestRoutes,
    supportedChains,
    findBestRoutes,
    loadSupportedChains,
    isRouteSupported,
  } = useFusionSwap();

  const [selectedAmount, setSelectedAmount] = useState(targetAmount);
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize supported chains on mount
  useEffect(() => {
    if (authenticated && !isInitialized) {
      loadSupportedChains();
      setIsInitialized(true);
    }
  }, [authenticated, loadSupportedChains, isInitialized]);

  // Auto-search for routes when amount changes
  useEffect(() => {
    if (authenticated && selectedAmount > 0 && isInitialized) {
      const debounceTimer = setTimeout(() => {
        findBestRoutes(selectedAmount, DEFAULT_CHAIN_ID);
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [authenticated, selectedAmount, findBestRoutes, isInitialized]);

  const handleRefresh = () => {
    if (selectedAmount > 0) {
      findBestRoutes(selectedAmount, DEFAULT_CHAIN_ID);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatTokenAmount = (amount: string, decimals: number) => {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  };

  const getChainName = (chainId: number) => {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      8453: 'Base',
      42161: 'Arbitrum',
      10: 'Optimism',
      56: 'BNB Chain',
      43114: 'Avalanche',
      250: 'Fantom',
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  if (!authenticated) {
    return (
      <div className="card text-center">
        <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Cross-Chain Deposits
        </h3>
        <p className="text-gray-600">
          Connect your wallet to deposit from any supported chain
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cross-Chain Deposits</h3>
              <p className="text-sm text-gray-500">Powered by 1inch Fusion+</p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deposit Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(parseFloat(e.target.value) || 0)}
              placeholder="100"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-purple-900 mb-1">
                Deposit from Any Chain
              </h4>
              <p className="text-sm text-purple-700">
                Use Fusion+ to deposit tokens from Ethereum, Base, Arbitrum, and more. 
                We'll automatically convert them to USDC on Polygon for your automated savings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card">
          <div className="text-center py-4">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      )}

      {/* Best Route */}
      {bestRoutes?.bestOption && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">🏆 Best Route</h4>
            <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>Optimal</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-purple-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-sm font-medium text-gray-700">
                  {getChainName(bestRoutes.bestOption.fromChainId)}
                </div>
                <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                <div className="text-sm font-medium text-gray-700">
                  {getChainName(DEFAULT_CHAIN_ID)} (Polygon)
                </div>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>~{bestRoutes.bestOption.quote?.estimatedTimeMinutes || 5}m</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">You Send</div>
                <div className="font-medium">
                  {bestRoutes.bestOption.quote && 
                    formatTokenAmount(
                      bestRoutes.bestOption.quote.fromAmount, 
                      bestRoutes.bestOption.quote.fromToken.decimals
                    )
                  } {bestRoutes.bestOption.fromTokenSymbol}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">You Receive</div>
                <div className="font-medium text-green-600">
                  {bestRoutes.bestOption.quote && 
                    formatTokenAmount(
                      bestRoutes.bestOption.quote.toAmount, 
                      bestRoutes.bestOption.quote.toToken.decimals
                    )
                  } USDC
                </div>
              </div>
            </div>

            {bestRoutes.bestOption.quote?.fees && bestRoutes.bestOption.quote.fees.length > 0 && (
              <div className="text-xs text-gray-600 mb-4">
                <strong>Total Fees:</strong> {formatCurrency(
                  bestRoutes.bestOption.quote.fees.reduce((sum: number, fee: any) => sum + fee.amountUsd, 0)
                )}
              </div>
            )}

            <button
              onClick={() => onDepositSelected?.(bestRoutes.bestOption)}
              className="w-full bg-gradient-to-r from-green-600 to-purple-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Use This Route</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* All Options */}
      {bestRoutes?.allOptions && bestRoutes.allOptions.length > 1 && (
        <div className="card">
          <button
            onClick={() => setShowAllOptions(!showAllOptions)}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <h4 className="text-lg font-semibold text-gray-900">
              All Routes ({bestRoutes.allOptions.filter(opt => opt.quote).length})
            </h4>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showAllOptions ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showAllOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                {bestRoutes.allOptions
                  .filter(option => option.quote)
                  .map((option, index) => (
                    <motion.div
                      key={`${option.fromChainId}-${option.fromTokenAddress}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer"
                      onClick={() => onDepositSelected?.(option)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {getChainName(option.fromChainId)}
                          </span>
                          <ArrowRightLeft className="w-3 h-3 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            Polygon
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          ~{option.quote?.estimatedTimeMinutes || 5}m
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          {option.quote && 
                            formatTokenAmount(
                              option.quote.fromAmount, 
                              option.quote.fromToken.decimals
                            )
                          } {option.fromTokenSymbol}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          {option.quote && 
                            formatTokenAmount(
                              option.quote.toAmount, 
                              option.quote.toToken.decimals
                            )
                          } USDC
                        </div>
                      </div>

                      {option.quote?.fees && option.quote.fees.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Fees: {formatCurrency(
                            option.quote.fees.reduce((sum: number, fee: any) => sum + fee.amountUsd, 0)
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* No Routes Found */}
      {bestRoutes && !bestRoutes.bestOption && !isLoading && (
        <div className="card text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Routes Available
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any cross-chain routes for this amount. 
            Try a different amount or deposit directly on Polygon.
          </p>
          <button
            onClick={handleRefresh}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}