"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  DollarSign,
  PiggyBank,
} from "lucide-react";
import { useOnboarding } from "../OnboardingProvider";

interface OnboardingCompleteProps {
  onFinish: () => void;
}

export function OnboardingComplete({ onFinish }: OnboardingCompleteProps) {
  const { state } = useOnboarding();

  const handleComplete = () => {
    onFinish();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring", delay: 0.2 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-4xl font-bold text-gray-900 mb-4"
        >
          Welcome to BYOB!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xl text-gray-600 mb-8"
        >
          Your money is now growing automatically
        </motion.p>
      </div>

      <div className="card">
        {/* Success metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-6 border border-green-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <PiggyBank className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700">Setup Status</p>
              <p className="text-xl font-bold text-green-900">Complete</p>
            </div>
            <div>
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700">Expected APY</p>
              <p className="text-xl font-bold text-green-900">12.4%</p>
            </div>
            <div>
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700">Status</p>
              <p className="text-xl font-bold text-green-900">Earning</p>
            </div>
          </div>
        </motion.div>

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Here's what happens next:
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">1</span>
              </div>
              <p className="text-gray-700">
                Your money starts earning interest immediately
              </p>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">2</span>
              </div>
              <p className="text-gray-700">
                Track your growth on the earnings dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">3</span>
              </div>
              <p className="text-gray-700">
                Watch compound interest work its magic
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <button
            onClick={handleComplete}
            className="btn-primary px-8 py-4 text-lg flex items-center justify-center space-x-3 mx-auto"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-gray-500 mt-3">
            Your setup is saved - you can always change settings later
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
