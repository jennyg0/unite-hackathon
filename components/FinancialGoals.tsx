"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, Shield, DollarSign, Calendar, ArrowRight } from "lucide-react";
import { useOnboarding } from "./OnboardingProvider";
import { useWallet } from "@/hooks/useWallet";
import { FinancialFreedomCalculator } from "./FinancialFreedomCalculator";
import { FinancialGoalsChart } from "./FinancialGoalsChart";

interface GoalProgress {
  current: number;
  target: number;
  percentage: number;
  monthsRemaining: number;
  onTrack: boolean;
}

export function FinancialGoals({ onShowDeposit }: { onShowDeposit?: () => void }) {
  const { state, updateUserGoals } = useOnboarding();
  const { totalBalance } = useWallet();
  const [emergencyGoal, setEmergencyGoal] = useState<GoalProgress | null>(null);
  const [freedomGoal, setFreedomGoal] = useState<GoalProgress | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    calculateGoalProgress();
  }, [totalBalance, state.userGoals]);

  const calculateGoalProgress = () => {
    const currentBalance = totalBalance || 0;
    const monthlySavings = state.userGoals.monthlySavingsGoal || 500; // Default to $500 if not set

    // Use actual monthly expenses if available, otherwise estimate from savings
    let monthlyExpenses = state.userGoals.monthlyExpenses;
    
    if (!monthlyExpenses || monthlyExpenses <= 0) {
      // Fallback: estimate from savings (savings rate of 20-33%)
      monthlyExpenses = monthlySavings * 3.5; // Conservative estimate: 22% savings rate
    }
    
    const emergencyTarget = monthlyExpenses * 6; // 6 months of expenses
    
    if (emergencyTarget > 0) {
      const emergencyPercentage = Math.min((currentBalance / emergencyTarget) * 100, 100);
      const emergencyRemaining = Math.max(emergencyTarget - currentBalance, 0);
      const emergencyMonthsRemaining = monthlySavings > 0 ? emergencyRemaining / monthlySavings : 999;
      
      setEmergencyGoal({
        current: currentBalance,
        target: emergencyTarget,
        percentage: emergencyPercentage,
        monthsRemaining: Math.ceil(emergencyMonthsRemaining),
        onTrack: emergencyMonthsRemaining <= 18 // On track if achievable within 1.5 years
      });
    }

    // Financial Freedom Goal: Use stored number or calculate 25x annual expenses (4% rule)
    let financialFreedomTarget = state.userGoals.financialFreedomNumber;
    
    if (!financialFreedomTarget || financialFreedomTarget <= 0) {
      // Calculate based on expenses: 25x annual expenses for 4% withdrawal rate
      financialFreedomTarget = monthlyExpenses * 12 * 25;
    }
    
    if (financialFreedomTarget > 0) {
      const freedomPercentage = Math.min((currentBalance / financialFreedomTarget) * 100, 100);
      const freedomRemaining = Math.max(financialFreedomTarget - currentBalance, 0);
      
      // Calculate with compound interest (8% annual return assumption from DeFi yields)
      const annualReturnRate = 0.08;
      const monthlyReturnRate = annualReturnRate / 12;
      let monthsToGoal = 0;
      
      if (monthlySavings > 0 && freedomRemaining > 0) {
        // Use the compound interest formula for annuity plus present value
        // FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
        // Solve for n when FV = target
        
        // Iterative approach is more accurate for this complex calculation
        let balance = currentBalance;
        let months = 0;
        
        while (balance < financialFreedomTarget && months < 720) { // Cap at 60 years
          balance = balance * (1 + monthlyReturnRate) + monthlySavings;
          months++;
        }
        
        monthsToGoal = months;
      } else if (freedomRemaining <= 0) {
        monthsToGoal = 0; // Already achieved!
      } else {
        monthsToGoal = 999; // No savings = never achievable
      }
      
      setFreedomGoal({
        current: currentBalance,
        target: financialFreedomTarget,
        percentage: freedomPercentage,
        monthsRemaining: monthsToGoal,
        onTrack: monthsToGoal <= 360 // On track if achievable within 30 years
      });
    }
  };

  // Calculate months to goal with traditional banking (0.5% APY)
  const calculateTraditionalMonths = (currentBalance: number, targetAmount: number, monthlyContribution: number, annualAPY: number = 0.005) => {
    if (monthlyContribution <= 0) return 999;
    
    const monthlyRate = annualAPY / 12;
    let balance = currentBalance;
    let months = 0;
    
    // Iterative calculation for compound interest with monthly contributions
    while (balance < targetAmount && months < 720) { // Cap at 60 years
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      months++;
    }
    
    return months;
  };

  // Prepare chart data
  const getChartData = () => {
    const monthlySavings = state.userGoals.monthlySavingsGoal || 500;
    
    const emergencyChartData = emergencyGoal ? {
      current: emergencyGoal.current,
      target: emergencyGoal.target,
      monthlyContribution: monthlySavings,
      currentAPY: 8.5, // DeFi average
      traditionalAPY: 0.5, // Traditional bank
      monthsToGoalDeFi: emergencyGoal.monthsRemaining,
      monthsToGoalTraditional: calculateTraditionalMonths(emergencyGoal.current, emergencyGoal.target, monthlySavings),
      title: "Emergency Fund",
      color: "#3B82F6"
    } : undefined;

    const freedomChartData = freedomGoal ? {
      current: freedomGoal.current,
      target: freedomGoal.target,
      monthlyContribution: monthlySavings,
      currentAPY: 8.5, // DeFi average
      traditionalAPY: 0.5, // Traditional bank
      monthsToGoalDeFi: freedomGoal.monthsRemaining,
      monthsToGoalTraditional: calculateTraditionalMonths(freedomGoal.current, freedomGoal.target, monthlySavings),
      title: "Financial Freedom",
      color: "#8B5CF6"
    } : undefined;

    return { emergencyChartData, freedomChartData };
  };

  if (!emergencyGoal && !freedomGoal) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Your Financial Goals</h3>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowChart(!showChart)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
          >
            <TrendingUp className="w-3 h-3" />
            <span>{showChart ? 'Hide' : 'Show'} Timeline</span>
          </button>
          <button 
            onClick={() => setShowGoalModal(true)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
          >
            <span>Adjust Goals</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emergency Fund Goal */}
        {emergencyGoal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Emergency Fund</h4>
                <p className="text-sm text-gray-600">6 months of expenses</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  ${emergencyGoal.current.toLocaleString()} of ${emergencyGoal.target.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {emergencyGoal.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${emergencyGoal.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-blue-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Time to Goal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {emergencyGoal.monthsRemaining > 12 
                    ? `${Math.round(emergencyGoal.monthsRemaining / 12)} years`
                    : `${emergencyGoal.monthsRemaining} months`
                  } to goal
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                emergencyGoal.onTrack 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {emergencyGoal.onTrack ? 'On Track' : 'Behind'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Financial Freedom Goal */}
        {freedomGoal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Financial Freedom</h4>
                <p className="text-sm text-gray-600">Work becomes optional</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  ${freedomGoal.current.toLocaleString()} of ${freedomGoal.target.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-purple-600">
                  {freedomGoal.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${freedomGoal.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="bg-purple-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Time to Goal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {freedomGoal.monthsRemaining > 12 
                    ? `${Math.round(freedomGoal.monthsRemaining / 12)} years`
                    : `${freedomGoal.monthsRemaining} months`
                  } to goal
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                freedomGoal.onTrack 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {freedomGoal.onTrack ? 'On Track' : 'Adjust Plan'}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Financial Goals Chart */}
      {showChart && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FinancialGoalsChart 
            emergencyGoal={getChartData().emergencyChartData}
            freedomGoal={getChartData().freedomChartData}
          />
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Accelerate Your Goals</h4>
            <p className="text-sm text-gray-600">Set up automated deposits to stay on track</p>
          </div>
          <button 
            onClick={onShowDeposit}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Automate Savings
          </button>
        </div>
      </div>

      {/* Goal Adjustment Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Financial Freedom Calculator</h3>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FinancialFreedomCalculator />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

