"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Target, TrendingUp, DollarSign } from "lucide-react";

interface CalculatorResult {
  yearlyExpenses: number;
  financialFreedomNumber: number;
  defiYears: number;
  bankYears: number;
  yearDifference: number;
  defiTotalSaved: number;
  defiCompoundInterest: number;
  bankTotalSaved: number;
  bankCompoundInterest: number;
}

export function FinancialFreedomCalculator() {
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [monthlySavings, setMonthlySavings] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  // Load saved values from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem("byob_monthly_expenses");
    const savedCurrentSavings = localStorage.getItem("byob_current_savings");
    const savedMonthlySavings = localStorage.getItem("byob_monthly_savings");
    const savedResult = localStorage.getItem("byob_financial_freedom_result");

    if (savedExpenses) setMonthlyExpenses(savedExpenses);
    if (savedCurrentSavings) setCurrentSavings(savedCurrentSavings);
    if (savedMonthlySavings) setMonthlySavings(savedMonthlySavings);
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (err) {
        console.error("Failed to parse saved result:", err);
      }
    }
  }, []);

  // Save values to localStorage whenever they change
  useEffect(() => {
    if (monthlyExpenses) {
      localStorage.setItem("byob_monthly_expenses", monthlyExpenses);
    }
  }, [monthlyExpenses]);

  useEffect(() => {
    if (currentSavings) {
      localStorage.setItem("byob_current_savings", currentSavings);
    }
  }, [currentSavings]);

  useEffect(() => {
    if (monthlySavings) {
      localStorage.setItem("byob_monthly_savings", monthlySavings);
    }
  }, [monthlySavings]);

  const calculateFinancialFreedom = () => {
    const monthly = parseFloat(monthlyExpenses) || 0;
    const current = parseFloat(currentSavings) || 0;
    const monthlySave = parseFloat(monthlySavings) || 0;

    if (monthly <= 0 || monthlySave <= 0) return;

    const yearlyExpenses = monthly * 12;
    const financialFreedomNumber = yearlyExpenses * 25; // 4% rule

    // DeFi yield assumptions (conservative estimates)
    const defiAPY = 0.07; // 7% APY (realistic DeFi yield)
    const bankAPY = 0.005; // 0.5% APY (traditional savings)

    // Calculate years needed with compound interest
    const calculateYearsToTarget = (
      targetAmount: number,
      currentAmount: number,
      monthlyContribution: number,
      annualRate: number
    ): number => {
      if (monthlyContribution <= 0) return Infinity;

      const monthlyRate = annualRate / 12;
      const futureValue = targetAmount;
      const presentValue = currentAmount;
      const payment = monthlyContribution;

      if (monthlyRate === 0) {
        // Simple case: no interest
        return (futureValue - presentValue) / (payment * 12);
      }

      // Using the future value of annuity formula to solve for time
      // FV = PV(1+r)^n + PMT[((1+r)^n - 1) / r]
      // This requires iterative solution
      let years = 0;
      let currentValue = presentValue;

      while (currentValue < futureValue && years < 100) {
        currentValue = currentValue * (1 + annualRate) + payment * 12;
        years++;
      }

      return years;
    };

    const defiYears = calculateYearsToTarget(
      financialFreedomNumber,
      current,
      monthlySave,
      defiAPY
    );
    const bankYears = calculateYearsToTarget(
      financialFreedomNumber,
      current,
      monthlySave,
      bankAPY
    );

    // Calculate final amounts and compound interest
    const calculateFinalAmounts = (
      years: number,
      currentAmount: number,
      monthlyContribution: number,
      annualRate: number
    ) => {
      let totalValue = currentAmount;
      let totalContributions = currentAmount;

      for (let year = 0; year < years; year++) {
        totalValue = totalValue * (1 + annualRate) + monthlyContribution * 12;
        totalContributions += monthlyContribution * 12;
      }

      return {
        totalSaved: totalValue,
        compoundInterest: totalValue - totalContributions,
      };
    };

    const defiResults = calculateFinalAmounts(
      defiYears,
      current,
      monthlySave,
      defiAPY
    );
    const bankResults = calculateFinalAmounts(
      bankYears,
      current,
      monthlySave,
      bankAPY
    );

    const calculatedResult = {
      yearlyExpenses,
      financialFreedomNumber,
      defiYears: Math.max(0, defiYears),
      bankYears: Math.max(0, bankYears),
      yearDifference: Math.max(0, bankYears - defiYears),
      defiTotalSaved: defiResults.totalSaved,
      defiCompoundInterest: defiResults.compoundInterest,
      bankTotalSaved: bankResults.totalSaved,
      bankCompoundInterest: bankResults.compoundInterest,
    };

    setResult(calculatedResult);

    // Save result to localStorage
    localStorage.setItem("byob_financial_freedom_result", JSON.stringify(calculatedResult));
    
    // Also save the financial freedom number separately for easy access by other components
    localStorage.setItem("byob_financial_freedom_number", financialFreedomNumber.toString());
    
    console.log("💾 Saved financial freedom calculation:", {
      financialFreedomNumber,
      yearlyExpenses,
      monthlyExpenses: monthly
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="text-center mb-6 md:mb-8">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
          <Calculator className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Financial Freedom Calculator
        </h2>
        <p className="text-sm md:text-base text-gray-600 px-4">
          See how much faster you can reach financial freedom with DeFi vs
          traditional banking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
            Your Financial Information
          </h3>

          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Expenses
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  placeholder="0.00"
                  className="input-field pl-10 h-12 md:h-10 text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Savings
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  placeholder="0.00"
                  className="input-field pl-10 h-12 md:h-10 text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Savings
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={monthlySavings}
                  onChange={(e) => setMonthlySavings(e.target.value)}
                  placeholder="0.00"
                  className="input-field pl-10 h-12 md:h-10 text-base"
                />
              </div>
            </div>

            <button
              onClick={calculateFinancialFreedom}
              className="btn-primary w-full mt-6 py-3 md:py-4 text-base md:text-lg font-semibold"
            >
              Calculate Financial Freedom
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
            Your Results
          </h3>

          {result ? (
            <div className="space-y-4 md:space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">
                    Financial Freedom Target
                  </h4>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  ${result.financialFreedomNumber.toLocaleString()}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Based on 4% withdrawal rule (yearly expenses × 25)
                </p>
              </div>

              {/* DeFi vs Bank Comparison */}
              <div className="grid grid-cols-1 gap-4">
                {/* DeFi Results */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">
                      With DeFi (6.5% APY)
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-green-900">
                        {result.defiYears.toFixed(1)} years
                      </p>
                      <p className="text-sm text-green-700">
                        Time to financial freedom
                      </p>
                    </div>

                    <div className="border-t border-green-200 pt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-green-700">
                          Total Saved:
                        </span>
                        <span className="font-semibold text-green-900 text-right">
                          ${result.defiTotalSaved > 1000000 
                            ? `${(result.defiTotalSaved / 1000000).toFixed(1)}M`
                            : result.defiTotalSaved.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-700">
                          Compound Interest:
                        </span>
                        <span className="font-semibold text-green-900 text-right">
                          ${result.defiCompoundInterest > 1000000 
                            ? `${(result.defiCompoundInterest / 1000000).toFixed(1)}M`
                            : result.defiCompoundInterest.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Results */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-700">
                      Traditional Bank (0.5% APY)
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-gray-700">
                        {result.bankYears.toFixed(1)} years
                      </p>
                      <p className="text-sm text-gray-600">
                        Time to financial freedom
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">
                          Total Saved:
                        </span>
                        <span className="font-semibold text-gray-700 text-right">
                          ${result.bankTotalSaved > 1000000 
                            ? `${(result.bankTotalSaved / 1000000).toFixed(1)}M`
                            : result.bankTotalSaved.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Compound Interest:
                        </span>
                        <span className="font-semibold text-gray-700 text-right">
                          ${result.bankCompoundInterest > 1000000 
                            ? `${(result.bankCompoundInterest / 1000000).toFixed(1)}M`
                            : result.bankCompoundInterest.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Difference Highlight */}
              {result.yearDifference > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-4"
                >
                  <div className="text-center">
                    <h4 className="font-bold text-lg mb-2">
                      🚀 DeFi Advantage
                    </h4>
                    <p className="text-2xl font-bold mb-1">
                      {result.yearDifference.toFixed(1)} years faster
                    </p>
                    <p className="text-sm opacity-90">
                      Reach financial freedom {result.yearDifference.toFixed(1)}{" "}
                      years earlier with DeFi yields
                    </p>
                    <div className="mt-3 text-sm opacity-90">
                      <span className="font-semibold">
                        Extra compound interest: $
                        {(
                          result.defiCompoundInterest -
                          result.bankCompoundInterest
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">
                  Start Your DeFi Journey
                </h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">🏦</span>
                    <span>
                      Deposit USDC to Aave and start earning 6.5%+ APY
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">🤖</span>
                    <span>
                      Use AI-powered yield optimization for higher returns
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">📊</span>
                    <span>Set up automated monthly deposits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">⚡</span>
                    <span>Track your progress towards financial freedom</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Enter your financial information to see your results</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
