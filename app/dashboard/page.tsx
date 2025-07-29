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
  DollarSign,
  History,
} from "lucide-react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { FinancialFreedomCalculator } from "@/components/FinancialFreedomCalculator";
import TokenSwapV2 from "@/components/TokenSwapV2";
import { MobileNavigation } from "@/components/MobileNavigation";
import { StatsCard, ActionCard } from "@/components/MobileCard";
import TransactionHistory from "@/components/TransactionHistory";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import AutomatedDeposits from "@/components/AutomatedDeposits";
import RiskProfileDisplay from "@/components/RiskProfileDisplay";
import { PortfolioEmptyState } from "@/components/EmptyState";
import WalletBalanceV2 from "@/components/WalletBalanceV2";
import SmartDeposit from "@/components/SmartDeposit";
import { PriceFeed } from "@/components/PriceFeed";
import NFTMilestones from "@/components/NFTMilestones";
import { TokenChart } from "@/components/TokenChart";
import { APITest } from "@/components/APITest";
import { usePrivy } from "@privy-io/react-auth";
import { useOnboarding } from "@/components/OnboardingProvider";
import EducationCenter from "@/components/EducationCenter";
import PortfolioCharts from "@/components/PortfolioCharts";
import MiniPortfolioChart from "@/components/MiniPortfolioChart";
import { 
  BalanceCardSkeleton, 
  StatsCardSkeleton, 
  TokenBalanceSkeleton,
  LoadingDots
} from "@/components/ui/LoadingSkeletons";

type TabType = "earnings" | "portfolio" | "history";

export default function DashboardPage() {
  const { authenticated, ready } = usePrivy();
  const { state: onboardingState } = useOnboarding();
  const [activeTab, setActiveTab] = useState<TabType>("earnings");

  // Wait for Privy to be ready before rendering
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <TrendingUp className="w-8 h-8 text-green-600" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center justify-center space-x-2">
            <span>Loading</span>
            <LoadingDots />
          </h2>
          <p className="text-gray-600">Initializing your compound account</p>
        </motion.div>
      </div>
    );
  }

  // Remove the tabs array since it's now in MobileNavigation

  // Show onboarding for first-time users
  if (
    authenticated &&
    onboardingState.isFirstTime &&
    !onboardingState.completed
  ) {
    return <OnboardingFlow />;
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <header className="relative z-10">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  Compound
                </span>
              </div>
              <ConnectWallet />
            </div>
          </nav>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <DollarSign className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Account
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start earning 10x more than traditional banks - automatically
          </p>
          <div className="flex justify-center">
            <ConnectWallet />
          </div>
        </div>
      </div>
    );
  }

  const handleFloatingAction = (action: string) => {
    switch (action) {
      case "earnings":
        setActiveTab("earnings");
        break;
      case "history":
        setActiveTab("history");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                Compound
              </span>
            </div>
            <ConnectWallet />
          </div>
        </nav>
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-24 md:pb-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "earnings" && <EarningsTab />}
          {activeTab === "portfolio" && <PortfolioTab />}
          {activeTab === "history" && <HistoryTab />}
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton onAction={handleFloatingAction} />
    </div>
  );
}

// EARNINGS TAB - Main money dashboard with smart deposits
function EarningsTab() {
  const { authenticated } = usePrivy();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Real Wallet Balance Display */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <WalletBalanceV2 />
      </motion.div>

      {/* Smart Deposit - Invisible cross-chain magic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <SmartDeposit 
          onDepositComplete={(amount, isRecurring) => {
            console.log(`Deposit complete: $${amount}, recurring: ${isRecurring}`);
            // This would update the user's balance and show success
          }}
          onViewHistory={() => setActiveTab("history")}
        />
      </motion.div>

      {/* Recent Activity Preview - Only show if user has transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button 
            onClick={() => setActiveTab("history")}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            View All →
          </button>
        </div>
        <TransactionHistory limit={3} showSummary={false} />
      </motion.div>
    </div>
  );
}

// PORTFOLIO TAB - Advanced portfolio analytics with charts
function PortfolioTab() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Portfolio Analytics
        </h2>
        <p className="text-gray-600">
          Track your assets and performance across all chains
        </p>
      </div>

      {/* Comprehensive Wallet Balance with 1inch APIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <WalletBalanceV2 />
      </motion.div>
      
      {/* Live Portfolio Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PortfolioCharts />
      </motion.div>
    </div>
  );
}


// HISTORY TAB - Transaction history
function HistoryTab() {
  return (
    <motion.div 
      className="max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Transaction History
        </h2>
        <p className="text-gray-600">
          Track your deposits, earnings, and automated payments over time
        </p>
      </div>

      <TransactionHistory limit={50} showSummary={true} />
    </motion.div>
  );
}
