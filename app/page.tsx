"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react";
import { ConnectWallet } from "@/components/ConnectWallet";

export default function HomePage() {
  const [lostMoney, setLostMoney] = useState(0);

  // Calculate money lost to inflation in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      // $10,000 savings losing 3.2% annually = $0.01 per second
      setLostMoney((prev) => prev + 0.01);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">BYOB</span>
            </div>
            <ConnectWallet />
          </div>
        </nav>
      </header>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
        Be Your Own Bank
      </h1>
      <p className="text-xl md:text-2xl text-gray-700 mb-4 font-medium">Why?</p>
      {/* BRUTAL TRUTH HERO */}
      <main className="relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-16">
          {/* The Problem - Inflation Hook */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-red-100 border border-red-200 rounded-xl p-6 md:p-8 mb-8"
            >
              <div className="flex items-center justify-center space-x-2 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <h2 className="text-2xl md:text-3xl font-bold text-red-900">
                  Your Bank is Stealing Your Money
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">
                      Bank Interest
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-red-900">0.01%</div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">
                      Inflation Rate
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-red-900">3.2%</div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <DollarSign className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">
                      You've Lost
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-red-900">
                    ${lostMoney.toFixed(2)}
                  </div>
                  <div className="text-xs text-red-600">
                    since visiting this page
                  </div>
                </div>
              </div>

              <p className="text-red-700 mt-4 text-lg font-medium">
                You're losing <span className="font-bold">3.19%</span> of your
                purchasing power every year
              </p>
            </motion.div>

            {/* The Solution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <h3 className="text-4xl md:text-5xl lg:text-4xl font-bold text-gray-900 mb-6">
                BYOB: The Saving Account That
                <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  {" "}
                  Actually Grows
                </span>
              </h3>

              <p className="text-xl md:text-2xl text-gray-700 mb-8 font-medium">
                Earn{" "}
                <span className="text-green-600 font-bold">3.75-15% APY</span>{" "}
                automatically
                <br />
                <span className="text-lg text-gray-600">
                  While you sleep. Withdraw anytime.
                </span>
              </p>
            </motion.div>

            {/* Quick Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              {/* Traditional Bank */}
              <div className="bg-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Traditional Bank
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">$1,000 after 1 year:</span>
                    <span className="font-mono text-red-600">$1,000.10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Real value (inflation):
                    </span>
                    <span className="font-mono text-red-600">$968</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-600">You lose:</span>
                    <span className="font-mono text-red-700">-$32</span>
                  </div>
                </div>
              </div>

              {/* Compound */}
              <div className="bg-green-100 rounded-xl p-6 border-2 border-green-300 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  BYOB
                </div>
                <h3 className="text-lg font-semibold text-green-700 mb-4 mt-2">
                  Smart Savings
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-700">$1,000 after 1 year:</span>
                    <span className="font-mono text-green-600">$1,120</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">
                      Real value (inflation):
                    </span>
                    <span className="font-mono text-green-600">$1,085</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-green-700">You gain:</span>
                    <span className="font-mono text-green-700">+$85</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="space-y-4"
            >
              <a
                href="/dashboard"
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xl px-10 py-4 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <Zap className="w-6 h-6" />
                <span>Get Started in 60 Seconds</span>
                <ArrowRight className="w-6 h-6" />
              </a>

              <p className="text-sm text-gray-500">
                No fees • Withdraw anytime • Start with any amount
              </p>
            </motion.div>
          </div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-center space-x-8 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  $127,000+
                </div>
                <div className="text-sm text-gray-600">
                  Protected from inflation
                </div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div>
                <div className="text-2xl font-bold text-green-600">1,247</div>
                <div className="text-sm text-gray-600">Smart savers</div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Audited & Secure
                  </div>
                  <div className="text-xs text-gray-600">
                    Smart contract verified
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
