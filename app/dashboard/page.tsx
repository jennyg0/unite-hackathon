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
import { WalletBalance } from "@/components/WalletBalance";
import { PriceFeed } from "@/components/PriceFeed";
import { MiniWalletBalance } from "@/components/WalletBalance";
import { MiniPriceFeed } from "@/components/PriceFeed";
import NFTMilestones from "@/components/NFTMilestones";
import { TokenChart } from "@/components/TokenChart";
import { APITest } from "@/components/APITest";
import { usePrivy } from "@privy-io/react-auth";
import { useOnboarding } from "@/components/OnboardingProvider";
import EducationCenter from "@/components/EducationCenter";

type TabType = "earnings" | "history";

export default function DashboardPage() {
  const { authenticated, ready } = usePrivy();
  const { state: onboardingState } = useOnboarding();
  const [activeTab, setActiveTab] = useState<TabType>("earnings");

  // Wait for Privy to be ready before rendering
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-green-600 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600">Initializing your compound account</p>
        </div>
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
          {activeTab === "history" && <HistoryTab />}
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton onAction={handleFloatingAction} />
    </div>
  );
}

// EARNINGS TAB - Main money dashboard with integrated setup
function EarningsTab() {
  const [showSetup, setShowSetup] = useState(false);
  const [monthlyAmount, setMonthlyAmount] = useState("");

  const handleStartEarning = () => {
    setShowSetup(true);
  };

  const handleSetupDeposit = () => {
    // This is where we'd integrate with your TokenSwapV2 logic
    // But hidden from the user - just "Setting up your account..."
    alert(`Setting up $${monthlyAmount}/month automatic savings...`);
    setShowSetup(false);
  };

  if (showSetup) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Start Earning 12% APY
            </h2>
            <p className="text-gray-600">
              How much would you like to save each month?
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="100"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700">
                <strong>Projected annual earnings:</strong> $
                {monthlyAmount
                  ? (parseFloat(monthlyAmount) * 12 * 0.124).toFixed(0)
                  : "0"}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Based on 12.4% APY • Withdraw anytime
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSetup(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetupDeposit}
                disabled={!monthlyAmount || parseFloat(monthlyAmount) <= 0}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Start Earning
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Main Balance Display */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-6 md:p-8 text-white">
        <div className="text-center">
          <p className="text-green-100 text-sm md:text-base mb-2">
            Total Balance
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">$0.00</h1>
          <div className="flex items-center justify-center space-x-4 text-sm md:text-base">
            <div className="flex items-center space-x-1">
              <span className="text-green-100">+$0.00 this week</span>
            </div>
            <div className="w-1 h-1 bg-green-300 rounded-full"></div>
            <div className="flex items-center space-x-1">
              <span className="text-green-100">12.4% APY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatsCard
          icon={TrendingUp}
          title="Weekly Earnings"
          value="+$0.00"
          color="green"
        />
        <StatsCard
          icon={Target}
          title="vs Banks (0.01%)"
          value="1,240x better"
          color="green"
        />
        <StatsCard
          icon={Shield}
          title="Inflation Protection"
          value="+$0.00"
          color="green"
        />
      </div>

      {/* Get Started Section */}
      <div className="card">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Your Money Could Be Growing
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            While you're earning 0.01% at the bank, you could be earning 12.4%
            here. Set up automatic deposits and watch your balance grow.
          </p>
          <button
            onClick={handleStartEarning}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
          >
            Start Earning 12% APY
          </button>
          <p className="text-xs text-gray-500 mt-3">
            No fees • Withdraw anytime • FDIC-level security
          </p>
        </div>
      </div>
    </div>
  );
}


// HISTORY TAB - Transaction history
function HistoryTab() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          History
        </h2>
        <p className="text-gray-600">
          Track your deposits and earnings over time
        </p>
      </div>

      {/* Empty State */}
      <div className="card">
        <div className="text-center py-12">
          <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Activity Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Once you start earning, your deposits and earnings will appear here
          </p>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Start Earning Now
          </button>
        </div>
      </div>
    </div>
  );
}
