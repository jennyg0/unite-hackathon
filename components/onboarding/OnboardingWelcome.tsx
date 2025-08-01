"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Calculator,
  TrendingUp,
  Shield,
  Target,
  Zap,
} from "lucide-react";

interface OnboardingWelcomeProps {
  onNext: () => void;
  onSkip: () => void;
  onShowCalculator?: () => void;
}

export function OnboardingWelcome({ onNext, onSkip, onShowCalculator }: OnboardingWelcomeProps) {
  return (
    <div className="text-center py-8 md:py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 md:mb-12"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Welcome to Your
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {" "}
            Financial Journey
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Let's build your path to financial freedom together. We'll help you
          calculate your goals, set up smart savings strategies, and learn about
          DeFi along the way.
        </p>
      </motion.div>

      {/* Prominent Smart Calculator Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 md:mb-12"
      >
        <div className="max-w-4xl mx-auto">
          {/* Featured Calculator Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                🎯 Financial Freedom Calculator
              </h2>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                Discover exactly how much faster you can reach financial freedom with DeFi vs traditional banking. 
                See the <span className="font-semibold text-blue-600">years you'll save</span> and 
                <span className="font-semibold text-purple-600"> extra compound interest you'll earn!</span>
              </p>
              
              {/* Calculator Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/70 rounded-lg p-4">
                  <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Auto-Calculate Years</h4>
                  <p className="text-sm text-gray-600">No guessing - see exactly when you'll be free</p>
                </div>
                <div className="bg-white/70 rounded-lg p-4">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">DeFi vs Bank</h4>
                  <p className="text-sm text-gray-600">Compare 6.5% DeFi yields vs 0.5% bank rates</p>
                </div>
                <div className="bg-white/70 rounded-lg p-4">
                  <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Compound Magic</h4>
                  <p className="text-sm text-gray-600">See how your money compounds over time</p>
                </div>
              </div>

              {onShowCalculator && (
                <button
                  onClick={onShowCalculator}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-4"
                >
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-5 h-5" />
                    <span>Try Financial Freedom Calculator</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Supporting Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                DeFi Strategies
              </h3>
              <p className="text-gray-600 text-sm">
                Access 6-15% yields through battle-tested DeFi protocols like Aave, Compound, and Yearn
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Simple
              </h3>
              <p className="text-gray-600 text-sm">
                AI-powered optimization with full custody control. Your keys, your crypto.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col gap-4 justify-center items-center"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onNext}
            className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            <span>Start Guided Setup</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            I'll explore on my own
          </button>
        </div>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-gray-500 mb-2">
          Trusted by thousands of users
        </p>
        <div className="flex justify-center items-center space-x-6 text-xs text-gray-400">
          <span>🔒 Secure</span>
          <span>⚡ Fast</span>
          <span>💰 Better Yields</span>
        </div>
      </motion.div>
    </div>
  );
}
