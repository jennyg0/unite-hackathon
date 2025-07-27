"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Calculator,
  TrendingUp,
  Shield,
} from "lucide-react";

interface OnboardingWelcomeProps {
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingWelcome({ onNext, onSkip }: OnboardingWelcomeProps) {
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

      {/* Features Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-12"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Smart Calculator
          </h3>
          <p className="text-gray-600 text-sm">
            Calculate your financial freedom number using the proven 4% rule
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            DeFi Strategies
          </h3>
          <p className="text-gray-600 text-sm">
            Access higher yields than traditional savings accounts
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
            We handle the complexity while you focus on your goals
          </p>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        <button
          onClick={onNext}
          className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          I'll explore on my own
        </button>
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
