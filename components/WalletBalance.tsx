"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, RefreshCw, TrendingUp, Eye, EyeOff } from "lucide-react";
import { use1inchData } from "@/hooks/use1inchData";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

interface WalletBalanceProps {
  showHidden?: boolean;
  className?: string;
}

export function WalletBalance({
  showHidden = false,
  className = "",
}: WalletBalanceProps) {
  const { user } = usePrivy();
  const [showBalances, setShowBalances] = useState(true);
  const [showZeroBalances, setShowZeroBalances] = useState(false);

  const {
    walletBalances,
    totalWalletValue,
    loading,
    error,
    fetchWalletBalances,
    getTokenPrice,
  } = use1inchData({ autoRefresh: true });

  const walletAddress = user?.wallet?.address;

  // Fetch wallet balances when wallet is connected
  useEffect(() => {
    if (walletAddress) {
      fetchWalletBalances(walletAddress);
    }
  }, [walletAddress, fetchWalletBalances]);

  // Filter balances based on settings
  const filteredBalances = walletBalances.filter((balance) => {
    const hasBalance = parseFloat(balance.balance) > 0;
    return showZeroBalances || hasBalance;
  });

  // Sort by USD value (highest first)
  const sortedBalances = [...filteredBalances].sort(
    (a, b) => b.balanceUsd - a.balanceUsd
  );

  if (!walletAddress) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Connect your wallet to view balances</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wallet className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Wallet Balance
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showBalances ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => walletAddress && fetchWalletBalances(walletAddress)}
            disabled={loading.balances}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading.balances ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Total Value */}
      {showBalances && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                $
                {totalWalletValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error.balances && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error.balances}</p>
        </div>
      )}

      {/* Balance List */}
      {showBalances && (
        <div className="space-y-3">
          {sortedBalances.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No tokens found</p>
              <p className="text-sm text-gray-400">
                {showZeroBalances
                  ? "Your wallet is empty"
                  : "No tokens with balance"}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {sortedBalances.map((balance, index) => {
                const token = balance.token;
                const price = getTokenPrice(token.address);
                const balanceNum = parseFloat(balance.balance);
                const formattedBalance = balanceNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                });

                return (
                  <motion.div
                    key={token.address}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      {/* Token Info */}
                      <div className="flex items-center space-x-3">
                        {token.logoURI ? (
                          <img
                            src={token.logoURI}
                            alt={token.symbol}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-600">
                              {token.symbol.charAt(0)}
                            </span>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {token.symbol}
                          </h4>
                          <p className="text-sm text-gray-500">{token.name}</p>
                        </div>
                      </div>

                      {/* Balance Info */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formattedBalance} {token.symbol}
                        </p>
                        <p className="text-sm text-gray-600">
                          $
                          {balance.balanceUsd.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        {price && (
                          <p className="text-xs text-gray-500">
                            ${price.toFixed(4)} per {token.symbol}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Portfolio Allocation */}
                    {totalWalletValue > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Portfolio Allocation</span>
                          <span>
                            {(
                              (balance.balanceUsd / totalWalletValue) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                (balance.balanceUsd / totalWalletValue) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Show Zero Balances Toggle */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showZeroBalances}
            onChange={(e) => setShowZeroBalances(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-600">Show zero balances</span>
        </label>

        <span className="text-gray-500">
          {filteredBalances.length} token
          {filteredBalances.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Loading State */}
      {loading.balances && (
        <div className="text-center py-8">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading wallet balances...</p>
        </div>
      )}
    </div>
  );
}

// Mini wallet balance for compact display
export function MiniWalletBalance({ className = "" }: { className?: string }) {
  const { user } = usePrivy();
  const { totalWalletValue, walletBalances } = use1inchData({
    autoRefresh: true,
  });

  if (!user?.wallet?.address) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-gray-500">Connect wallet</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wallet className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">Portfolio</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            $
            {totalWalletValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-500">
            {walletBalances.length} token
            {walletBalances.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
