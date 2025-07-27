"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, ArrowLeft, Shield, Zap } from "lucide-react";
import { useOnboarding } from "../OnboardingProvider";

interface OnboardingStrategyProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStrategy({
  onNext,
  onBack,
}: OnboardingStrategyProps) {
  const { completeStep, updateUserGoals } = useOnboarding();
  const [selectedStrategy, setSelectedStrategy] = useState<
    "savings" | "yield" | "mixed"
  >("savings");

  const strategies = [
    {
      id: "savings" as const,
      title: "Simple Savings",
      description:
        "Focus on building your savings with traditional DeFi stablecoins",
      icon: Shield,
      color: "blue",
      features: ["Lower risk", "Stable returns", "Easy to understand"],
      apy: "3-5%",
    },
    {
      id: "yield" as const,
      title: "Yield Farming",
      description: "Maximize returns with advanced DeFi yield strategies",
      icon: TrendingUp,
      color: "green",
      features: [
        "Higher potential returns",
        "Active management",
        "More complex",
      ],
      apy: "8-15%",
    },
    {
      id: "mixed" as const,
      title: "Balanced Approach",
      description: "Combine both strategies for optimal risk-reward balance",
      icon: Zap,
      color: "purple",
      features: [
        "Diversified portfolio",
        "Moderate risk",
        "Best of both worlds",
      ],
      apy: "5-10%",
    },
  ];

  const handleNext = () => {
    updateUserGoals({ preferredStrategy: selectedStrategy });
    completeStep("strategy");
    onNext();
  };

  return (
    <div className="py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Choose Your Strategy
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          Select the approach that best fits your risk tolerance and goals.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {strategies.map((strategy) => {
            const Icon = strategy.icon;
            const isSelected = selectedStrategy === strategy.id;

            return (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`card cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "ring-2 ring-purple-500 bg-purple-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedStrategy(strategy.id)}
              >
                <div
                  className={`w-12 h-12 bg-${strategy.color}-100 rounded-lg flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 text-${strategy.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {strategy.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {strategy.description}
                </p>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {strategy.apy}
                  </p>
                  <p className="text-sm text-gray-500">Expected APY</p>
                </div>
                <ul className="space-y-1">
                  {strategy.features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-center"
                    >
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onBack}
            className="btn-secondary flex items-center justify-center space-x-2 py-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            onClick={handleNext}
            className="btn-primary flex items-center justify-center space-x-2 py-3"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
