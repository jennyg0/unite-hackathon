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
import { MobileNavigation } from "@/components/MobileNavigation";
import TransactionHistory from "@/components/TransactionHistory";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import WalletBalanceV2 from "@/components/WalletBalanceV2";
import SmartDeposit from "@/components/SmartDeposit";
import { usePrivy } from "@privy-io/react-auth";
import { useOnboarding } from "@/components/OnboardingProvider";
import PortfolioCharts from "@/components/PortfolioCharts";
import { FinancialGoals } from "@/components/FinancialGoals";
import { LoadingDots } from "@/components/ui/LoadingSkeletons";

type TabType = "portfolio" | "history";

export default function DashboardPage() {
  const { authenticated, ready } = usePrivy();
  const { state: onboardingState } = useOnboarding();
  const [activeTab, setActiveTab] = useState<TabType>("portfolio");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositModalMode, setDepositModalMode] = useState<
    "general" | "recurring"
  >("general");
  const [showHistoryExpanded, setShowHistoryExpanded] = useState(false);

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
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
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
    // onboardingState.isFirstTime &&
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
      case "deposit":
        setDepositModalMode("general");
        setShowDepositModal(true);
        break;
      case "history":
        setShowHistoryExpanded(true);
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
          {activeTab === "portfolio" && (
            <MainPortfolioView
              onShowDeposit={() => {
                setDepositModalMode("general");
                setShowDepositModal(true);
              }}
              onShowAutomateDeposit={() => {
                setDepositModalMode("recurring");
                setShowDepositModal(true);
              }}
              showHistoryExpanded={showHistoryExpanded}
              onToggleHistory={() =>
                setShowHistoryExpanded(!showHistoryExpanded)
              }
            />
          )}
          {activeTab === "history" && <HistoryTab />}
        </motion.div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {depositModalMode === "recurring"
                      ? "Set Up Automated Savings"
                      : "Make a Deposit"}
                  </h3>
                  <button
                    onClick={() => setShowDepositModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <SmartDeposit
                  mode={depositModalMode}
                  onDepositComplete={(amount, isRecurring) => {
                    console.log(
                      `Deposit complete: $${amount}, recurring: ${isRecurring}`
                    );
                    setShowDepositModal(false);
                  }}
                  onViewHistory={() => {
                    setShowDepositModal(false);
                    setShowHistoryExpanded(true);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton onAction={handleFloatingAction} />
    </div>
  );
}

// MAIN PORTFOLIO VIEW - Single focused view with goals, balance, and actions
function MainPortfolioView({
  onShowDeposit,
  onShowAutomateDeposit,
  showHistoryExpanded,
  onToggleHistory,
}: {
  onShowDeposit: () => void;
  onShowAutomateDeposit: () => void;
  showHistoryExpanded: boolean;
  onToggleHistory: () => void;
}) {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Financial Goals - Most important, shown first */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FinancialGoals onShowDeposit={onShowAutomateDeposit} />
      </motion.div>

      {/* Current Portfolio Balance - Clean, single section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <WalletBalanceV2 />
      </motion.div>

      {/* Primary Action - Big Deposit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <button
          onClick={onShowDeposit}
          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6" />
            <span>Start Earning to Reach Goals Faster</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Start earning 8-15% APY with smart DeFi strategies
        </p>
      </motion.div>

      {/* Portfolio Performance Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PortfolioCharts />
      </motion.div>

      {/* Transaction History - Collapsible Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border-t border-gray-200 pt-6"
      >
        <button
          onClick={onToggleHistory}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">
              Transaction History
            </span>
          </div>
          <motion.div
            animate={{ rotate: showHistoryExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </button>

        {showHistoryExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <TransactionHistory limit={10} showSummary={true} />
          </motion.div>
        )}
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
