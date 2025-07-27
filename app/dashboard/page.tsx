"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Shield,
  Target,
  BookOpen,
  ArrowRight,
  Sparkles,
  Calculator,
  PiggyBank,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { FinancialFreedomCalculator } from "@/components/FinancialFreedomCalculator";
import { TokenSwap } from "@/components/TokenSwap";
import { usePrivy } from "@privy-io/react-auth";

type TabType = "overview" | "calculator" | "swap" | "portfolio" | "learn";

export default function DashboardPage() {
  const { authenticated, ready } = usePrivy();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Wait for Privy to be ready before rendering
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600">Initializing your wallet connection</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "calculator", label: "Calculator", icon: Calculator },
    { id: "swap", label: "Swap", icon: TrendingUp },
    { id: "portfolio", label: "Portfolio", icon: PiggyBank },
    { id: "learn", label: "Learn", icon: BookOpen },
  ];

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="relative z-10">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  DeFi Savings
                </span>
              </div>
              <ConnectWallet />
            </div>
          </nav>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect your wallet to access your personalized DeFi savings
            dashboard
          </p>
          <ConnectWallet />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                DeFi Savings
              </span>
            </div>
            <ConnectWallet />
          </div>
        </nav>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "calculator" && <FinancialFreedomCalculator />}
          {activeTab === "swap" && <TokenSwap />}
          {activeTab === "portfolio" && <PortfolioTab />}
          {activeTab === "learn" && <LearnTab />}
        </motion.div>
      </main>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to Your Financial Journey
        </h1>
        <p className="text-blue-100 text-lg">
          Start building your financial freedom with smart DeFi strategies
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Savings</p>
              <p className="text-2xl font-bold text-gray-900">$0.00</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">APY Earned</p>
              <p className="text-2xl font-bold text-gray-900">0.00%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progress to Goal</p>
              <p className="text-2xl font-bold text-gray-900">0%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full btn-primary flex items-center justify-between">
              <span>Calculate Financial Freedom</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full btn-secondary flex items-center justify-between">
              <span>Swap Tokens</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full btn-secondary flex items-center justify-between">
              <span>Set Up Auto-Deposits</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="text-center text-gray-500 py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
            <p className="text-sm">
              Start by calculating your financial freedom number
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortfolioTab() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Portfolio
        </h1>
        <p className="text-gray-600">
          Track your DeFi investments and savings progress
        </p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Portfolio Overview
        </h3>
        <div className="text-center text-gray-500 py-12">
          <PiggyBank className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg mb-2">No investments yet</p>
          <p className="text-sm">
            Start building your portfolio by swapping tokens or setting up
            savings goals
          </p>
        </div>
      </div>
    </div>
  );
}

function LearnTab() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learn & Earn</h1>
        <p className="text-gray-600">
          Educational content to help you understand DeFi and personal finance
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            What is DeFi?
          </h3>
          <p className="text-gray-600 mb-4">
            Learn the basics of decentralized finance and how it can help you
            build wealth.
          </p>
          <button className="btn-primary">Start Learning</button>
        </div>

        <div className="card">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Calculator className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Financial Freedom
          </h3>
          <p className="text-gray-600 mb-4">
            Understand the 4% rule and how to calculate your financial
            independence number.
          </p>
          <button className="btn-primary">Learn More</button>
        </div>

        <div className="card">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Risk Management
          </h3>
          <p className="text-gray-600 mb-4">
            Learn about different risk levels and how to protect your
            investments.
          </p>
          <button className="btn-primary">Explore</button>
        </div>
      </div>
    </div>
  );
}
