"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { 
  Clock, 
  DollarSign, 
  Calendar, 
  Pause, 
  Play, 
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Backend API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ScheduledDeposit {
  id: string;
  user: string;
  token: string;
  amount: string;
  intervalDays: number;
  nextDeposit: string;
  isActive: boolean;
  createdAt: string;
  totalDeposited: string;
  lastExecution?: {
    timestamp: string;
    txHash: string;
    amount: string;
  };
}

export default function AutoDepositDashboard() {
  const { authenticated, user } = usePrivy();
  const [schedules, setSchedules] = useState<ScheduledDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    if (!user?.wallet?.address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/scheduled-deposits/${user.wallet.address}`);
      const data = await response.json();
      
      if (data.success) {
        setSchedules(data.schedules);
      } else {
        setError(data.error || 'Failed to fetch schedules');
      }
    } catch (err) {
      setError('Network error: Unable to fetch schedules');
      console.error('Error fetching schedules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      fetchSchedules();
    }
  }, [authenticated, user?.wallet?.address]);

  const cancelSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/scheduled-deposits/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the schedules list
        await fetchSchedules();
      } else {
        setError(result.error || 'Failed to cancel schedule');
      }
    } catch (err) {
      setError('Failed to cancel schedule');
      console.error('Error cancelling schedule:', err);
    }
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toFixed(2);
  };

  const formatInterval = (days: number) => {
    if (days === 1) return 'Daily';
    if (days === 7) return 'Weekly';
    if (days === 30) return 'Monthly';
    return `Every ${days} days`;
  };

  const getDaysUntilNext = (nextDeposit: string) => {
    const next = new Date(nextDeposit);
    const now = new Date();
    const diffTime = next.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateYearlyProjection = (amount: string, intervalDays: number) => {
    const monthlyAmount = (parseFloat(amount) * 30) / intervalDays;
    const yearlyAmount = monthlyAmount * 12;
    const apy = 0.045; // 4.5% APY assumption
    const yearlyEarnings = yearlyAmount * apy;
    return {
      deposits: yearlyAmount,
      earnings: yearlyEarnings,
      total: yearlyAmount + yearlyEarnings
    };
  };

  if (!authenticated) {
    return (
      <div className="card text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Auto Deposit Dashboard
        </h3>
        <p className="text-gray-600">
          Connect your wallet to view your scheduled deposits
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Auto Deposit Dashboard</h2>
          <p className="text-gray-600">Manage your automated savings schedules</p>
        </div>
        <motion.button
          onClick={fetchSchedules}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="card text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your scheduled deposits...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && schedules.length === 0 && (
        <div className="card text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Scheduled Deposits
          </h3>
          <p className="text-gray-600">
            Set up your first automated deposit to start building wealth automatically
          </p>
        </div>
      )}

      {/* Schedules List */}
      {!isLoading && schedules.length > 0 && (
        <div className="space-y-4">
          {schedules.map((schedule, index) => {
            const daysUntil = getDaysUntilNext(schedule.nextDeposit);
            const projection = calculateYearlyProjection(schedule.amount, schedule.intervalDays);
            
            return (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card border-l-4 ${
                  schedule.isActive 
                    ? 'border-l-green-500 bg-green-50' 
                    : 'border-l-gray-400 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Status and Amount */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        {schedule.isActive ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Pause className="w-5 h-5 text-gray-500" />
                        )}
                        <span className={`font-medium ${
                          schedule.isActive ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {schedule.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-lg font-semibold text-gray-900">
                        <DollarSign className="w-5 h-5" />
                        <span>{formatAmount(schedule.amount)}</span>
                        <span className="text-sm font-normal text-gray-600">
                          {formatInterval(schedule.intervalDays)}
                        </span>
                      </div>
                    </div>

                    {/* Schedule Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Next Deposit</span>
                        <div className="font-medium">
                          {daysUntil === 0 ? 'Due today' : `${daysUntil} days`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(schedule.nextDeposit).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Total Deposited</span>
                        <div className="font-medium">
                          ${formatAmount(schedule.totalDeposited)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Yearly Projection</span>
                        <div className="font-medium">
                          ${projection.total.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${projection.deposits.toFixed(0)} + ${projection.earnings.toFixed(0)} earnings
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Created</span>
                        <div className="font-medium">
                          {new Date(schedule.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Last Execution */}
                    {schedule.lastExecution && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">Last execution: </span>
                        <span className="text-xs text-gray-700">
                          ${formatAmount(schedule.lastExecution.amount)} on {' '}
                          {new Date(schedule.lastExecution.timestamp).toLocaleDateString()}
                        </span>
                        <a 
                          href={`https://polygonscan.com/tx/${schedule.lastExecution.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          View tx ↗
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <motion.button
                      onClick={() => cancelSchedule(schedule.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Cancel schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}