"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, ArrowRight, ArrowLeft, DollarSign } from "lucide-react";
import { useOnboarding } from "../OnboardingProvider";

interface OnboardingGoalsProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingGoals({ onNext, onBack }: OnboardingGoalsProps) {
  const { completeStep, updateUserGoals, state } = useOnboarding();

  const [monthlyGoal, setMonthlyGoal] = useState(
    state.userGoals.monthlySavingsGoal?.toString() || ""
  );
  const [timeline, setTimeline] = useState("10");

  const handleNext = () => {
    if (monthlyGoal) {
      updateUserGoals({
        monthlySavingsGoal: parseFloat(monthlyGoal),
      });
      completeStep("goals");
      onNext();
    }
  };

  const suggestedGoal = state.userGoals.monthlySavingsGoal || 0;

  return (
    <div className="py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Set Your Savings Goals
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          Based on your financial freedom calculation, let's set realistic
          monthly savings goals.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          {/* Suggested Goal */}
          {suggestedGoal > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Suggested Monthly Goal
              </h3>
              <p className="text-2xl font-bold text-blue-900">
                ${suggestedGoal.toLocaleString()}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                This will help you reach your financial freedom number
              </p>
            </div>
          )}

          {/* Monthly Goal Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Monthly Savings Goal
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(e.target.value)}
                placeholder="0.00"
                className="input-field pl-10 h-12 md:h-10 text-base"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Start with what feels achievable, you can always adjust later
            </p>
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Timeline (years)
            </label>
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="input-field h-12 md:h-10 text-base"
            >
              <option value="5">5 years</option>
              <option value="10">10 years</option>
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="25">25 years</option>
              <option value="30">30 years</option>
            </select>
          </div>

          {/* Goal Preview */}
          {monthlyGoal && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                Your Goal Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monthly savings:</span>
                  <span className="font-semibold">
                    ${parseFloat(monthlyGoal).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Yearly savings:</span>
                  <span className="font-semibold">
                    ${(parseFloat(monthlyGoal) * 12).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total in {timeline} years:</span>
                  <span className="font-semibold">
                    $
                    {(
                      parseFloat(monthlyGoal) *
                      12 *
                      parseInt(timeline)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onBack}
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNext}
              disabled={!monthlyGoal}
              className="btn-primary flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
