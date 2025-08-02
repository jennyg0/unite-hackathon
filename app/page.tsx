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

      {/* HERO SECTION */}
      <main className="relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 pb-16">
          {/* Main Headline - Centered */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              Be Your Own Bank
            </motion.h1>

            {/* Enhanced "Why?" Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <div className="inline-flex items-center justify-center mb-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mx-6 relative">
                  Why?
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-red-500 to-green-500 rounded-full"></div>
                </h2>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20"></div>
              </div>

              <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
                Because traditional banks are
                <span className="text-red-600 font-bold"> stealing </span>
                your money through inflation while paying you
                <span className="text-red-600 font-bold"> almost nothing</span>
              </p>
            </motion.div>
          </div>
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
              className="mb-12 text-center"
            >
              {/* Solution Header */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center mb-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20"></div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mx-6">
                    The Solution
                  </h3>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20"></div>
                </div>
              </div>

              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                BYOB: The Savings App That
                <br />
                <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Generates Investment-Like Returns
                </span>
              </h3>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 md:p-8 max-w-2xl mx-auto mb-8">
                <p className="text-xl md:text-2xl text-gray-800 font-semibold mb-2">
                  Earn{" "}
                  <span className="text-green-600 font-bold text-2xl md:text-3xl">
                    3.75-15% APY
                  </span>{" "}
                  automatically
                </p>
                <p className="text-lg text-gray-600">
                  While you sleep. Withdraw anytime. No minimums.
                </p>
              </div>
            </motion.div>

            {/* Quick Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-12"
            >
              {/* Comparison Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center mb-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20"></div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mx-6">
                    The Difference
                  </h3>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20"></div>
                </div>
                <p className="text-lg text-gray-600 max-w-xl mx-auto">
                  See what happens to your $1,000 after just one year
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Traditional Bank */}
                <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200 relative transform hover:scale-105 transition-all duration-200">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    ❌ Traditional Bank
                  </div>
                  <h4 className="text-xl font-bold text-red-800 mb-4 mt-2 text-center">
                    Wealth Destroyer
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-3 flex justify-between items-center">
                      <span className="text-gray-700 font-medium">
                        $1,000 after 1 year:
                      </span>
                      <span className="font-mono text-red-600 font-bold text-lg">
                        $1,000.10
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 flex justify-between items-center">
                      <span className="text-gray-700 font-medium">
                        Real value (inflation):
                      </span>
                      <span className="font-mono text-red-600 font-bold text-lg">
                        $968
                      </span>
                    </div>
                    <div className="bg-red-100 rounded-lg p-3 flex justify-between items-center border-2 border-red-300">
                      <span className="text-red-800 font-bold">You lose:</span>
                      <span className="font-mono text-red-700 font-bold text-xl">
                        -$32
                      </span>
                    </div>
                  </div>
                </div>

                {/* BYOB */}
                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-300 relative transform hover:scale-105 transition-all duration-200">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    ✅ BYOB
                  </div>
                  <h4 className="text-xl font-bold text-green-800 mb-4 mt-2 text-center">
                    Wealth Builder
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-3 flex justify-between items-center">
                      <span className="text-gray-700 font-medium">
                        $1,000 after 1 year:
                      </span>
                      <span className="font-mono text-green-600 font-bold text-lg">
                        $1,120
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 flex justify-between items-center">
                      <span className="text-gray-700 font-medium">
                        Real value (inflation):
                      </span>
                      <span className="font-mono text-green-600 font-bold text-lg">
                        $1,085
                      </span>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3 flex justify-between items-center border-2 border-green-400">
                      <span className="text-green-800 font-bold">
                        You gain:
                      </span>
                      <span className="font-mono text-green-700 font-bold text-xl">
                        +$85
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-center space-y-6"
            >
              {/* CTA Header */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20"></div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mx-6">
                    Ready to Start?
                  </h3>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20"></div>
                </div>
                <p className="text-lg text-gray-600">
                  Join thousands who've already escaped traditional banking
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-green-500 p-1 rounded-2xl inline-block">
                <a
                  href="/dashboard"
                  className="flex items-center space-x-3 bg-white hover:bg-gray-50 text-green-600 font-bold text-xl px-10 py-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Zap className="w-7 h-7" />
                  <span>Start Building Wealth in 60 Seconds</span>
                  <ArrowRight className="w-7 h-7" />
                </a>
              </div>

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No fees</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Withdraw anytime</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Start with any amount</span>
                </div>
              </div>
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
