"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Repeat,
  Settings,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

interface DepositSchedule {
  id: string;
  amount: string;
  token: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  startDate: string;
  endDate?: string;
  isActive: boolean;
  nextDeposit: string;
  totalDeposited: string;
}

const MOCK_SCHEDULES: DepositSchedule[] = [
  {
    id: "1",
    amount: "50",
    token: "USDC",
    frequency: "weekly",
    startDate: "2024-01-01",
    isActive: true,
    nextDeposit: "2024-01-08",
    totalDeposited: "200",
  },
];

export default function AutomatedDeposits() {
  const { user } = usePrivy();
  const [schedules, setSchedules] = useState<DepositSchedule[]>(MOCK_SCHEDULES);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    token: "USDC",
    frequency: "weekly" as const,
    startDate: new Date().toISOString().split("T")[0],
  });

  const handleCreateSchedule = () => {
    const newSchedule: DepositSchedule = {
      id: Date.now().toString(),
      ...formData,
      isActive: true,
      nextDeposit: formData.startDate,
      totalDeposited: "0",
    };
    setSchedules([...schedules, newSchedule]);
    setShowCreateForm(false);
    setFormData({
      amount: "",
      token: "USDC",
      frequency: "weekly",
      startDate: new Date().toISOString().split("T")[0],
    });
  };

  const toggleSchedule = (id: string) => {
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: "Daily",
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      monthly: "Monthly",
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const getNextDepositText = (date: string) => {
    const nextDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil(
      (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    return nextDate.toLocaleDateString();
  };

  if (!user?.wallet?.address) {
    return (
      <div className="card text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Please connect your wallet to set up automated deposits
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
            Automated Deposits
          </h2>
          <p className="text-gray-600 mt-1">
            Set up recurring deposits to grow your savings automatically
          </p>
        </div>

        <button onClick={() => setShowCreateForm(true)} className="btn-primary">
          <Repeat className="w-4 h-4 mr-2" />
          New Schedule
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create Deposit Schedule
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token
              </label>
              <select
                value={formData.token}
                onChange={(e) =>
                  setFormData({ ...formData, token: e.target.value })
                }
                className="input-field"
              >
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="DAI">DAI</option>
                <option value="MATIC">MATIC</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value as any })
                }
                className="input-field"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
                className="input-field"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSchedule}
                disabled={!formData.amount}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Schedules */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Active Schedules
        </h3>

        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <Repeat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No automated deposits set up yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        schedule.isActive ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <Repeat
                        className={`w-5 h-5 ${
                          schedule.isActive ? "text-green-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {schedule.amount} {schedule.token}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getFrequencyLabel(schedule.frequency)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSchedule(schedule.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      schedule.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {schedule.isActive ? "Active" : "Paused"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Next deposit</p>
                    <p className="font-medium text-gray-900">
                      {getNextDepositText(schedule.nextDeposit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total deposited</p>
                    <p className="font-medium text-gray-900">
                      {schedule.totalDeposited} {schedule.token}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              How automated deposits work
            </h4>
            <p className="text-sm text-blue-700">
              Set up recurring deposits to automatically save tokens at your
              chosen frequency. You'll need to approve the spending limit once,
              then deposits will happen automatically based on your schedule.
              You can pause or cancel anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Schedules</p>
              <p className="text-2xl font-bold text-gray-900">
                {schedules.filter((s) => s.isActive).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Total</p>
              <p className="text-2xl font-bold text-gray-900">$200</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Next Deposit</p>
              <p className="text-2xl font-bold text-gray-900">2 days</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
