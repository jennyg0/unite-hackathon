"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  ArrowRight,
  Sparkles,
  CreditCard,
  PiggyBank,
} from "lucide-react";
import { useAutomatedDeposits } from "@/hooks/useAutomatedDeposits";

interface OnboardingStartEarningProps {
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingStartEarning({ onNext, onBack }: OnboardingStartEarningProps) {
  const { user } = usePrivy();
  const { 
    isEnabled, 
    setupAutomatedDeposits, 
    getProjectedEarnings,
    isLoading 
  } = useAutomatedDeposits();

  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "bi-weekly" | "monthly">("weekly");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const presetAmounts = [
    { label: "$50/month", value: "50", popular: false },
    { label: "$100/month", value: "100", popular: false },
    { label: "$250/month", value: "250", popular: true },
    { label: "$500/month", value: "500", popular: false },
  ];

  const frequencyOptions = [
    { value: "daily" as const, label: "Daily", multiplier: 30, badge: "Test Mode" },
    { value: "weekly" as const, label: "Weekly", multiplier: 4.33 },
    { value: "bi-weekly" as const, label: "Bi-weekly", multiplier: 2.17 },
    { value: "monthly" as const, label: "Monthly", multiplier: 1 },
  ];

  // Calculate projected earnings
  const monthlyAmountNumber = parseFloat(monthlyAmount) || 0;
  const annualAmount = monthlyAmountNumber * 12;
  const projectedEarnings = annualAmount * 0.124; // 12.4% APY
  const totalAfterYear = annualAmount + projectedEarnings;

  // Skip if already set up
  useEffect(() => {
    if (isEnabled) {
      setSetupComplete(true);
      setTimeout(onNext, 1500);
    }
  }, [isEnabled, onNext]);

  const handlePresetSelect = (value: string) => {
    setMonthlyAmount(value);
    setSelectedPreset(value);
  };

  const handleSetupDeposits = async () => {
    if (!monthlyAmountNumber || monthlyAmountNumber < 10) return;

    setIsSettingUp(true);

    try {
      // Convert monthly to the selected frequency
      const frequencyMultiplier = frequencyOptions.find(f => f.value === frequency)?.multiplier || 1;
      const depositAmount = monthlyAmountNumber / frequencyMultiplier;

      await setupAutomatedDeposits({
        amount: depositAmount,
        frequency,
        token: 'USDC'
      });

      setSetupComplete(true);
      setTimeout(onNext, 2000);
    } catch (error) {
      console.error('Failed to setup automated deposits:', error);
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip this step and set up later
    onNext();
  };

  // Show success state if already enabled
  if (isEnabled || setupComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="card">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Automatic deposits are active!
          </h3>
          <p className="text-gray-600">
            Your money will start growing automatically.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Continuing to next step...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Start Earning 12% APY
        </h2>
        <p className="text-lg text-gray-600">
          Set up automatic deposits and watch your savings grow
        </p>
      </div>

      <div className="card">
        {/* Value Proposition */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <PiggyBank className="w-6 h-6 text-green-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-2">
                Why automatic deposits work
              </h4>
              <div className="space-y-2 text-sm text-green-700">
                <p>• <strong>Dollar-cost averaging:</strong> Reduces risk by investing consistently</p>
                <p>• <strong>Compound growth:</strong> Your earnings start earning too</p>
                <p>• <strong>No thinking required:</strong> Set it once, earn forever</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How much would you like to save monthly?
          </label>
          
          {/* Preset Amounts */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {presetAmounts.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset.value)}
                className={`relative px-4 py-3 rounded-lg border-2 text-left transition-all ${
                  selectedPreset === preset.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">{preset.label}</div>
                <div className="text-sm text-gray-500">
                  ${(parseFloat(preset.value) * 12 * 0.124).toFixed(0)} earned/year
                </div>
                {preset.popular && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Popular
                  </span>
                )}
                {selectedPreset === preset.value && (
                  <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-500" />
                )}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="number"
              value={monthlyAmount}
              onChange={(e) => {
                setMonthlyAmount(e.target.value);
                setSelectedPreset(null);
              }}
              placeholder="Enter custom amount"
              className="input-field pl-8"
              min="10"
              step="10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              /month
            </span>
          </div>
          
          {monthlyAmountNumber > 0 && monthlyAmountNumber < 10 && (
            <p className="mt-2 text-sm text-red-600">
              Minimum amount is $10/month
            </p>
          )}
        </div>

        {/* Frequency Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Deposit frequency
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {frequencyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFrequency(option.value)}
                className={`relative px-4 py-3 rounded-lg border-2 text-center transition-all ${
                  frequency === option.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {option.badge && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {option.badge}
                  </span>
                )}
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500">
                  ${monthlyAmountNumber ? (monthlyAmountNumber / option.multiplier).toFixed(0) : "0"}
                </div>
              </button>
            ))}
          </div>
          {frequency === "daily" && (
            <p className="mt-2 text-sm text-blue-600 flex items-center">
              <span className="mr-1">ℹ️</span>
              Daily mode for hackathon testing - see results in 24 hours!
            </p>
          )}
        </div>

        {/* Earnings Projection */}
        {monthlyAmountNumber >= 10 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-6 border border-green-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
              <h4 className="text-lg font-semibold text-green-900">
                Your projected earnings
              </h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-green-700">You save</p>
                <p className="text-2xl font-bold text-green-900">
                  ${annualAmount.toFixed(0)}
                </p>
                <p className="text-xs text-green-600">per year</p>
              </div>
              <div>
                <p className="text-sm text-green-700">You earn</p>
                <p className="text-2xl font-bold text-green-900">
                  ${projectedEarnings.toFixed(0)}
                </p>
                <p className="text-xs text-green-600">in interest</p>
              </div>
              <div>
                <p className="text-sm text-green-700">Total after 1 year</p>
                <p className="text-2xl font-bold text-green-900">
                  ${totalAfterYear.toFixed(0)}
                </p>
                <p className="text-xs text-green-600">12.4% APY</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm text-green-700 text-center">
                <TrendingUp className="inline w-4 h-4 mr-1" />
                That's <strong>${(projectedEarnings / 12).toFixed(0)} extra per month</strong> doing nothing
              </p>
            </div>
          </motion.div>
        )}

        {/* Payment Method Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Payment method</h4>
          </div>
          <p className="text-sm text-gray-600">
            Deposits will be automatically converted from your connected account
            to USDC and invested in high-yield DeFi protocols.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Set up later
          </button>
          <button
            onClick={handleSetupDeposits}
            disabled={monthlyAmountNumber < 10 || isSettingUp}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSettingUp ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <span>Start Earning</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}