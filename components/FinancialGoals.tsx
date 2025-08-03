"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, Shield, DollarSign, Calendar, ArrowRight, HelpCircle } from "lucide-react";
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

export function FinancialGoals({ 
  onShowDeposit, 
  totalBalance: providedBalance 
}: { 
  onShowDeposit?: () => void;
  totalBalance?: number;
}) {
  const { state, updateUserGoals } = useOnboarding();
  const { totalBalance: walletBalance } = useWallet();
  
  // Use provided balance if available, otherwise fall back to wallet balance
  const totalBalance = providedBalance ?? walletBalance;
  const [emergencyGoal, setEmergencyGoal] = useState<GoalProgress | null>(null);
  const [freedomGoal, setFreedomGoal] = useState<GoalProgress | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showEmergencyTooltip, setShowEmergencyTooltip] = useState(false);
  const [showFreedomTooltip, setShowFreedomTooltip] = useState(false);

  useEffect(() => {
    calculateGoalProgress();
  }, [totalBalance, state.userGoals]);

  // Listen for storage changes to update when financial freedom calculator is used
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('byob_')) {
        console.log("📱 localStorage changed, recalculating goals:", e.key);
        calculateGoalProgress();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const calculateGoalProgress = () => {
    const currentBalance = totalBalance || 0;
    
    // Check localStorage for updated monthly savings from calculator
    let monthlySavings = state.userGoals.monthlySavingsGoal || 500; // Default to $500 if not set
    const savedMonthlySavings = localStorage.getItem("byob_monthly_savings");
    if (savedMonthlySavings) {
      const parsedSavings = parseFloat(savedMonthlySavings);
      if (parsedSavings > 0) {
        monthlySavings = parsedSavings;
        console.log("💰 Using saved monthly savings:", parsedSavings);
      }
    }
    
    // Debug logging to track balance issues
    console.log("🎯 Financial Goals Debug:", {
      totalBalance,
      currentBalance,
      monthlySavings,
      userGoals: state.userGoals
    });

    // Use actual monthly expenses: check localStorage first, then stored value, then estimate
    let monthlyExpenses = state.userGoals.monthlyExpenses;
    
    // Check localStorage for updated monthly expenses from calculator
    const savedMonthlyExpenses = localStorage.getItem("byob_monthly_expenses");
    if (savedMonthlyExpenses) {
      const parsedExpenses = parseFloat(savedMonthlyExpenses);
      if (parsedExpenses > 0) {
        monthlyExpenses = parsedExpenses;
        console.log("🏠 Using saved monthly expenses:", parsedExpenses);
      }
    }
    
    if (!monthlyExpenses || monthlyExpenses <= 0) {
      // Fallback: estimate from savings (savings rate of 20-33%)
      monthlyExpenses = monthlySavings * 3.5; // Conservative estimate: 22% savings rate
      console.log("🏠 Estimated monthly expenses from savings:", monthlyExpenses);
    }
    
    const emergencyTarget = monthlyExpenses * 6; // 6 months of expenses
    
    if (emergencyTarget > 0) {
      const emergencyPercentage = Math.min((currentBalance / emergencyTarget) * 100, 100);
      const emergencyRemaining = Math.max(emergencyTarget - currentBalance, 0);
      
      // Calculate with compound interest (8% annual return assumption from DeFi yields)
      const annualReturnRate = 0.08;
      const monthlyReturnRate = annualReturnRate / 12;
      let emergencyMonthsRemaining = 0;
      
      if (monthlySavings > 0 && emergencyRemaining > 0) {
        // Use compound interest calculation for emergency fund too
        let balance = currentBalance;
        let months = 0;
        
        while (balance < emergencyTarget && months < 240) { // Cap at 20 years
          balance = balance * (1 + monthlyReturnRate) + monthlySavings;
          months++;
        }
        
        emergencyMonthsRemaining = months;
      } else if (emergencyRemaining <= 0) {
        emergencyMonthsRemaining = 0; // Already achieved!
      } else {
        emergencyMonthsRemaining = 999; // No savings = never achievable
      }
      
      setEmergencyGoal({
        current: currentBalance,
        target: emergencyTarget,
        percentage: emergencyPercentage,
        monthsRemaining: emergencyMonthsRemaining,
        onTrack: emergencyMonthsRemaining <= 18 // On track if achievable within 1.5 years
      });
    }

    // Financial Freedom Goal: Check localStorage first, then stored number, then calculate
    let financialFreedomTarget = state.userGoals.financialFreedomNumber;
    
    // Check localStorage for updated financial freedom number
    const savedFinancialFreedomNumber = localStorage.getItem("byob_financial_freedom_number");
    if (savedFinancialFreedomNumber) {
      const parsedNumber = parseFloat(savedFinancialFreedomNumber);
      if (parsedNumber > 0) {
        financialFreedomTarget = parsedNumber;
        console.log("🎯 Using saved financial freedom number:", parsedNumber);
      }
    }
    
    if (!financialFreedomTarget || financialFreedomTarget <= 0) {
      // Calculate based on expenses: 25x annual expenses for 4% withdrawal rate
      financialFreedomTarget = monthlyExpenses * 12 * 25;
      console.log("🎯 Calculated financial freedom number:", financialFreedomTarget);
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
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">Emergency Fund</h4>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowEmergencyTooltip(true)}
                    onMouseLeave={() => setShowEmergencyTooltip(false)}
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help" />
                    {showEmergencyTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
                      >
                        <div className="bg-gray-900 text-white text-sm rounded-lg p-4 w-72 shadow-xl">
                          <div className="font-medium mb-2">Emergency Fund</div>
                          <div className="leading-relaxed">6 months of living expenses set aside for unexpected events like job loss, medical bills, or major repairs. Protects you from going into debt during emergencies.</div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
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

            {/* Time to Goal & Time Savings */}
            <div className="space-y-3">
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
              
              {(() => {
                const monthlySavings = state.userGoals.monthlySavingsGoal || 500;
                const traditionalMonths = calculateTraditionalMonths(emergencyGoal.current, emergencyGoal.target, monthlySavings);
                const yearsSaved = (traditionalMonths - emergencyGoal.monthsRemaining) / 12;
                
                return yearsSaved > 0.1 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-green-800">
                        <span className="font-semibold">⚡ {yearsSaved.toFixed(1)} years faster</span> than banks
                      </div>
                      <div className="text-xs text-green-600">
                        8% vs 0.5% APY
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
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
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">Financial Freedom</h4>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowFreedomTooltip(true)}
                    onMouseLeave={() => setShowFreedomTooltip(false)}
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-purple-600 cursor-help" />
                    {showFreedomTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
                      >
                        <div className="bg-gray-900 text-white text-sm rounded-lg p-4 w-72 shadow-xl">
                          <div className="font-medium mb-2">Financial Freedom</div>
                          <div className="leading-relaxed">Having enough invested money (usually 25x your yearly expenses) to live off investment returns alone. Based on the 4% withdrawal rule - work becomes optional!</div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
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

            {/* Time to Goal & Time Savings */}
            <div className="space-y-3">
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
              
              {(() => {
                const monthlySavings = state.userGoals.monthlySavingsGoal || 500;
                const traditionalMonths = calculateTraditionalMonths(freedomGoal.current, freedomGoal.target, monthlySavings);
                const yearsSaved = (traditionalMonths - freedomGoal.monthsRemaining) / 12;
                
                return yearsSaved > 0.1 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-green-800">
                        <span className="font-semibold">⚡ {yearsSaved.toFixed(1)} years faster</span> than banks
                      </div>
                      <div className="text-xs text-green-600">
                        8% vs 0.5% APY
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
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

