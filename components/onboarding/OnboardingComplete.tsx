"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useOnboarding } from "../OnboardingProvider";

interface OnboardingCompleteProps {
  onBack: () => void;
}

export function OnboardingComplete({ onBack }: OnboardingCompleteProps) {
  const { state, skipOnboarding } = useOnboarding();

  const handleComplete = () => {
    skipOnboarding();
  };

  return (
    <div className="py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
        >
          You're All Set! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4"
        >
          Your personalized financial journey is ready. Let's start building
          your wealth with smart DeFi strategies.
        </motion.p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="card mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Your Setup Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Financial Freedom
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                $
                {state.userGoals.financialFreedomNumber?.toLocaleString() ||
                  "0"}
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Monthly Goal</h3>
              <p className="text-2xl font-bold text-green-600">
                ${state.userGoals.monthlySavingsGoal?.toLocaleString() || "0"}
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Strategy</h3>
              <p className="text-lg font-semibold text-purple-600 capitalize">
                {state.userGoals.preferredStrategy || "Simple Savings"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            What's Next?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-blue-600">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Start Saving</h3>
                <p className="text-gray-600">
                  Set up your first deposit and watch your wealth grow
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-green-600">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Explore DeFi</h3>
                <p className="text-gray-600">
                  Learn about different strategies and opportunities
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-purple-600">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Track Progress</h3>
                <p className="text-gray-600">
                  Monitor your journey to financial freedom
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={onBack}
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleComplete}
              className="btn-primary flex items-center justify-center space-x-2 py-3"
            >
              <span>Start My Journey</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
