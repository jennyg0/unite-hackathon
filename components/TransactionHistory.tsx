"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Repeat,
  ArrowRightLeft,
  ExternalLink,
  Filter,
  Calendar,
  DollarSign,
  Activity,
  Zap,
} from "lucide-react";
import {
  transactionHistory,
  Transaction,
  TransactionSummary,
  formatTransactionAmount,
  getTransactionIcon,
  getTransactionColor,
} from "@/lib/transaction-history";
import { TransactionSkeleton } from "@/components/ui/LoadingSkeletons";
import { EmptyState } from "@/components/ui/ErrorStates";
import { usePrivy } from "@privy-io/react-auth";

interface TransactionHistoryProps {
  limit?: number;
  showSummary?: boolean;
}

export default function TransactionHistory({
  limit = 20,
  showSummary = true,
}: TransactionHistoryProps) {
  const { authenticated } = usePrivy();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<Transaction["type"] | "all">(
    "all"
  );
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Only load transactions if user is authenticated
    const loadTransactions = async () => {
      if (!authenticated) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Disable demo mode for real users
      transactionHistory.disableDemoMode();

      // Simulate API delay for loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      const allTransactions = transactionHistory.getTransactions(limit);
      const summaryData = transactionHistory.getSummary();

      setTransactions(allTransactions);
      setSummary(summaryData);
      setIsLoading(false);
    };

    loadTransactions();
  }, [limit, authenticated]);

  const filteredTransactions =
    filterType === "all"
      ? transactions
      : transactions.filter((tx) => tx.type === filterType);

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case "automated_deposit":
        return <Repeat className="w-4 h-4 text-blue-600" />;
      case "earning":
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case "cross_chain_swap":
        return <ArrowRightLeft className="w-4 h-4 text-indigo-600" />;
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {showSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <TransactionSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="card text-center">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Connect your wallet to view your transaction history
        </p>
      </div>
    );
  }

  if (transactions.length === 0 && !isLoading) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={<Activity className="w-16 h-16" />}
          title="No Transactions Yet"
          message="Your transaction history will appear here once you start depositing and earning."
          actionLabel="Make Your First Deposit"
          onAction={() => {
            // Navigate to earnings tab or trigger deposit
            console.log("Navigate to deposit");
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {showSummary && summary && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Deposited</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${summary.totalDeposited.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Earned</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${summary.totalEarned.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Transactions</p>
                <p className="text-lg font-semibold text-gray-900">
                  {summary.totalTransactions}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average APY</p>
                <p className="text-lg font-semibold text-gray-900">
                  {summary.averageApy.toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Transaction List */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Header with Filters */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 flex flex-wrap gap-2"
            >
              {(
                [
                  "all",
                  "deposit",
                  "automated_deposit",
                  "earning",
                  "cross_chain_swap",
                ] as const
              ).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filterType === type
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type === "all"
                    ? "All"
                    : type
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction Items */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                  transaction.status === "pending"
                    ? "bg-yellow-50 border-yellow-200"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Type Icon */}
                  <div className="flex-shrink-0">
                    {getTypeIcon(transaction.type)}
                  </div>

                  {/* Token Icon */}
                  {transaction.token.logoURI ? (
                    <img
                      src={transaction.token.logoURI}
                      alt={transaction.token.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {transaction.token.symbol.slice(0, 2)}
                      </span>
                    </div>
                  )}

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 truncate">
                        {transaction.description}
                      </p>
                      {getStatusIcon(transaction.status)}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{formatDate(transaction.timestamp)}</span>
                      <span>{formatTime(transaction.timestamp)}</span>
                      {transaction.route && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {transaction.route}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p
                      className={`font-semibold ${getTransactionColor(
                        transaction.type
                      )}`}
                    >
                      {transaction.type === "withdrawal" ? "-" : "+"}$
                      {transaction.amountUsd.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatTransactionAmount(transaction)}
                    </p>
                  </div>

                  {transaction.txHash && (
                    <button
                      onClick={() =>
                        window.open(
                          `https://polygonscan.com/tx/${transaction.txHash}`,
                          "_blank"
                        )
                      }
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Show More Button */}
        {filteredTransactions.length === limit && (
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button className="text-green-600 hover:text-green-700 font-medium">
              Load More Transactions
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
