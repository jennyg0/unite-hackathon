"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, ChartNoAxesGantt } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { transactionHistory } from "@/lib/transaction-history";

interface MiniChartProps {
  className?: string;
}

export default function MiniPortfolioChart({ className = "" }: MiniChartProps) {
  const { authenticated } = usePrivy();
  const [hasEarnings, setHasEarnings] = useState(false);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    if (authenticated) {
      // Check if user has any actual earnings or deposits
      const transactions = transactionHistory.getTransactions(100);
      const deposits = transactions.filter(tx => 
        tx.type === 'deposit' || tx.type === 'automated_deposit'
      );
      const earnings = transactions.filter(tx => tx.type === 'earning');
      
      const deposited = deposits.reduce((sum, tx) => sum + tx.amountUsd, 0);
      const earned = earnings.reduce((sum, tx) => sum + tx.amountUsd, 0);
      
      setTotalDeposited(deposited);
      setTotalEarned(earned);
      setHasEarnings(deposited > 0 || earned > 0);
    }
  }, [authenticated]);

  if (!authenticated || !hasEarnings) {
    return (
      <motion.div 
        className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <ChartNoAxesGantt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No portfolio data yet</p>
            <p className="text-xs text-gray-500 mt-1">Start depositing to see your growth</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentValue = totalDeposited + totalEarned;
  const isPositive = totalEarned >= 0;
  const changePercent = totalDeposited > 0 ? (totalEarned / totalDeposited) * 100 : 0;

  return (
    <motion.div 
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Portfolio Growth</h4>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            ${currentValue.toFixed(2)}
          </p>
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Simple Progress Bar for Real Earnings */}
      <div className="h-16 flex items-end">
        <div className="w-full bg-gray-200 rounded-lg h-8 overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: totalDeposited > 0 ? `${Math.min((totalEarned / totalDeposited) * 100, 100)}%` : '0%' }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full rounded-lg ${
              isPositive ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'
            }`}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
            Earnings Progress
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">Deposited</p>
          <p className="text-sm font-medium text-gray-700">
            ${totalDeposited.toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Earned</p>
          <p className={`text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}${totalEarned.toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">APY</p>
          <p className="text-sm font-medium text-blue-600">
            {totalDeposited > 0 ? `${((totalEarned / totalDeposited) * 100).toFixed(1)}%` : '0%'}
          </p>
        </div>
      </div>

      {/* Sparkle Animation */}
      <motion.div
        className="absolute top-2 right-2 w-1 h-1 bg-blue-400 rounded-full"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}