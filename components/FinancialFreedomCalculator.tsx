"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Target, TrendingUp, DollarSign } from "lucide-react";

interface CalculatorResult {
  yearlyExpenses: number;
  financialFreedomNumber: number;
  monthlySavingsNeeded: number;
  yearsToFreedom: number;
}

export function FinancialFreedomCalculator() {
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [monthlySavings, setMonthlySavings] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculateFinancialFreedom = () => {
    const monthly = parseFloat(monthlyExpenses) || 0;
    const current = parseFloat(currentSavings) || 0;
    const monthlySave = parseFloat(monthlySavings) || 0;

    if (monthly <= 0) return;

    const yearlyExpenses = monthly * 12;
    const financialFreedomNumber = yearlyExpenses * 25; // 4% rule
    const remainingNeeded = financialFreedomNumber - current;

    let yearsToFreedom = 0;
    if (monthlySave > 0) {
      yearsToFreedom = remainingNeeded / (monthlySave * 12);
    }

    setResult({
      yearlyExpenses,
      financialFreedomNumber,
      monthlySavingsNeeded: remainingNeeded / 12,
      yearsToFreedom: Math.max(0, yearsToFreedom),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Financial Freedom Calculator
        </h2>
        <p className="text-gray-600">
          Calculate how much you need to save to achieve financial independence
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Your Financial Information
          </h3>

          <div className="space-y-4">
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
                  className="input-field pl-10"
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
                  className="input-field pl-10"
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
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              onClick={calculateFinancialFreedom}
              className="btn-primary w-full mt-6"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Your Results
          </h3>

          {result ? (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">
                    Financial Freedom Number
                  </h4>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  ${result.financialFreedomNumber.toLocaleString()}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Based on 4% withdrawal rule (yearly expenses × 25)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-600 mb-1">
                    Yearly Expenses
                  </h5>
                  <p className="text-lg font-semibold text-gray-900">
                    ${result.yearlyExpenses.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-600 mb-1">
                    Monthly Savings Needed
                  </h5>
                  <p className="text-lg font-semibold text-gray-900">
                    ${result.monthlySavingsNeeded.toLocaleString()}
                  </p>
                </div>
              </div>

              {result.yearsToFreedom > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">
                      Time to Freedom
                    </h4>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {result.yearsToFreedom.toFixed(1)} years
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    At your current savings rate
                  </p>
                </div>
              )}

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">
                  Next Steps
                </h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Set up automated monthly deposits</li>
                  <li>• Consider DeFi yield strategies</li>
                  <li>• Track your progress regularly</li>
                  <li>• Adjust your savings rate as needed</li>
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
