"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ArrowRightLeft,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Loader2,
  History,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { formatUnits } from "viem";
import { useENS } from "@/hooks/useENS";

interface Transaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  fromToken: {
    symbol: string;
    amount: string;
    decimals: number;
    logoURI?: string;
  };
  toToken: {
    symbol: string;
    amount: string;
    decimals: number;
    logoURI?: string;
  };
  status: "success" | "pending" | "failed";
  gasUsed?: string;
  network: string;
}

// Mock data for demonstration - in production, fetch from 1inch API or blockchain
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    hash: "0x1234...5678",
    timestamp: Date.now() - 3600000, // 1 hour ago
    from: "0xuser...address",
    to: "0x1inch...router",
    fromToken: {
      symbol: "MATIC",
      amount: "100000000000000000000", // 100 MATIC
      decimals: 18,
    },
    toToken: {
      symbol: "USDC",
      amount: "85000000", // 85 USDC
      decimals: 6,
    },
    status: "success",
    gasUsed: "0.05",
    network: "Polygon",
  },
  {
    hash: "0xabcd...efgh",
    timestamp: Date.now() - 86400000, // 1 day ago
    from: "0xuser...address",
    to: "0x1inch...router",
    fromToken: {
      symbol: "USDC",
      amount: "50000000", // 50 USDC
      decimals: 6,
    },
    toToken: {
      symbol: "WETH",
      amount: "25000000000000000", // 0.025 WETH
      decimals: 18,
    },
    status: "success",
    gasUsed: "0.03",
    network: "Polygon",
  },
];

export default function TransactionHistory() {
  const { user } = usePrivy();
  const { getDisplayName } = useENS();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "swaps" | "deposits">("all");

  useEffect(() => {
    // In production, fetch real transactions from 1inch API or blockchain
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTransactions(MOCK_TRANSACTIONS);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.wallet?.address) {
      fetchTransactions();
    }
  }, [user]);

  const formatAmount = (amount: string, decimals: number): string => {
    const formatted = formatUnits(BigInt(amount), decimals);
    const num = parseFloat(formatted);
    if (num < 0.01) return "< 0.01";
    if (num < 1) return num.toFixed(4);
    if (num < 100) return num.toFixed(2);
    return num.toFixed(0);
  };

  const getRelativeTime = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getExplorerUrl = (hash: string, network: string): string => {
    const explorers: Record<string, string> = {
      Polygon: "https://polygonscan.com/tx/",
      Ethereum: "https://etherscan.io/tx/",
      Base: "https://basescan.org/tx/",
    };
    return `${explorers[network] || explorers.Polygon}${hash}`;
  };

  if (!user?.wallet?.address) {
    return (
      <div className="card text-center py-12">
        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Please connect your wallet to view transaction history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Transaction History
          </h2>
          <p className="text-gray-600 mt-1">Track your swaps and deposits</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {["all", "swaps", "deposits"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-600">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Token Swap</p>
                      <p className="text-sm text-gray-500">
                        {getRelativeTime(tx.timestamp)} • {tx.network}
                      </p>
                    </div>
                  </div>
                  <a
                    href={getExplorerUrl(tx.hash, tx.network)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* From Token */}
                    <div className="text-center">
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-semibold text-gray-900">
                        {formatAmount(
                          tx.fromToken.amount,
                          tx.fromToken.decimals
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tx.fromToken.symbol}
                      </p>
                    </div>

                    <ArrowRightLeft className="w-4 h-4 text-gray-400" />

                    {/* To Token */}
                    <div className="text-center">
                      <p className="text-sm text-gray-500">To</p>
                      <p className="font-semibold text-gray-900">
                        {formatAmount(tx.toToken.amount, tx.toToken.decimals)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tx.toToken.symbol}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Status</p>
                    <p
                      className={`text-sm font-medium ${
                        tx.status === "success"
                          ? "text-green-600"
                          : tx.status === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </p>
                    {tx.gasUsed && (
                      <p className="text-xs text-gray-500">
                        Gas: {tx.gasUsed} MATIC
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Swaps</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.filter((tx) => tx.status === "success").length}
                </p>
              </div>
              <ArrowRightLeft className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volume (24h)</p>
                <p className="text-2xl font-bold text-gray-900">$135.50</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gas Saved</p>
                <p className="text-2xl font-bold text-gray-900">$2.45</p>
              </div>
              <TrendingDown className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
