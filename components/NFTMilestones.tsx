"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Target, TrendingUp, Gift, Sparkles } from "lucide-react";
import { useOnboarding } from "./OnboardingProvider";

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  requirement: {
    type: "savings" | "calculator" | "swap" | "education" | "streak";
    value: number;
  };
  reward: {
    type: "nft" | "badge" | "bonus";
    name: string;
    description: string;
  };
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export function NFTMilestones() {
  const { state: onboardingState } = useOnboarding();
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "first-calculator",
      title: "Financial Freedom Explorer",
      description: "Calculate your financial freedom number for the first time",
      icon: Calculator,
      color: "blue",
      requirement: { type: "calculator", value: 1 },
      reward: {
        type: "badge",
        name: "Freedom Explorer",
        description: "You've taken the first step!",
      },
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: "first-swap",
      title: "DeFi Pioneer",
      description: "Complete your first token swap",
      icon: TrendingUp,
      color: "green",
      requirement: { type: "swap", value: 1 },
      reward: {
        type: "nft",
        name: "DeFi Pioneer NFT",
        description: "Rare NFT for early adopters",
      },
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: "savings-goal",
      title: "Savings Champion",
      description: "Reach your first $1,000 in savings",
      icon: Target,
      color: "purple",
      requirement: { type: "savings", value: 1000 },
      reward: {
        type: "badge",
        name: "Savings Champion",
        description: "You're building wealth!",
      },
      unlocked: false,
      progress: 0,
      maxProgress: 1000,
    },
    {
      id: "education-complete",
      title: "Knowledge Seeker",
      description: "Complete all educational modules",
      icon: BookOpen,
      color: "orange",
      requirement: { type: "education", value: 3 },
      reward: {
        type: "nft",
        name: "Knowledge Seeker NFT",
        description: "Exclusive NFT for learners",
      },
      unlocked: false,
      progress: 0,
      maxProgress: 3,
    },
    {
      id: "streak-7",
      title: "Consistency Master",
      description: "Use the app for 7 consecutive days",
      icon: Star,
      color: "yellow",
      requirement: { type: "streak", value: 7 },
      reward: {
        type: "bonus",
        name: "7-Day Streak Bonus",
        description: "10% bonus on next deposit",
      },
      unlocked: false,
      progress: 0,
      maxProgress: 7,
    },
    {
      id: "freedom-50",
      title: "Halfway There",
      description: "Reach 50% of your financial freedom goal",
      icon: Trophy,
      color: "red",
      requirement: { type: "savings", value: 625000 }, // Assuming $1.25M goal
      reward: {
        type: "nft",
        name: "Halfway Hero NFT",
        description: "Legendary NFT for serious savers",
      },
      unlocked: false,
      progress: 0,
      maxProgress: 625000,
    },
  ]);

  // Check milestone progress
  useEffect(() => {
    const updatedMilestones = milestones.map((milestone) => {
      let progress = 0;
      let unlocked = false;

      switch (milestone.requirement.type) {
        case "calculator":
          progress = onboardingState.steps.find((s) => s.id === "calculator")
            ?.completed
            ? 1
            : 0;
          break;
        case "savings":
          // Mock savings progress - in real app, this would come from user data
          progress = Math.min(12500, milestone.requirement.value); // $12,500 saved
          break;
        case "swap":
          // Mock swap progress
          progress = 0; // No swaps completed yet
          break;
        case "education":
          progress = onboardingState.steps.find((s) => s.id === "education")
            ?.completed
            ? 1
            : 0;
          break;
        case "streak":
          // Mock streak - in real app, this would track daily usage
          progress = 3; // 3 days streak
          break;
      }

      unlocked = progress >= milestone.requirement.value;

      return {
        ...milestone,
        progress: Math.min(progress, milestone.maxProgress),
        unlocked,
      };
    });

    setMilestones(updatedMilestones);
  }, [onboardingState]);

  const unlockedCount = milestones.filter((m) => m.unlocked).length;
  const totalMilestones = milestones.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Achievement Milestones
        </h2>
        <p className="text-gray-600 mb-4">
          Unlock NFTs and rewards as you progress on your financial journey
        </p>

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-gray-900">
              {unlockedCount} of {totalMilestones} unlocked
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(unlockedCount / totalMilestones) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon;
            const progressPercentage =
              (milestone.progress / milestone.maxProgress) * 100;

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                  milestone.unlocked
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {/* Unlocked Badge */}
                {milestone.unlocked && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 bg-${milestone.color}-100 rounded-lg flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-6 h-6 text-${milestone.color}-600`} />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {milestone.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {milestone.progress} / {milestone.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          milestone.unlocked
                            ? "bg-green-500"
                            : `bg-${milestone.color}-500`
                        }`}
                        style={{
                          width: `${Math.min(progressPercentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Reward */}
                  <div
                    className={`p-3 rounded-lg ${
                      milestone.unlocked
                        ? "bg-green-100 border border-green-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Gift
                        className={`w-4 h-4 ${
                          milestone.unlocked
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            milestone.unlocked
                              ? "text-green-800"
                              : "text-gray-600"
                          }`}
                        >
                          {milestone.reward.name}
                        </p>
                        <p
                          className={`text-xs ${
                            milestone.unlocked
                              ? "text-green-700"
                              : "text-gray-500"
                          }`}
                        >
                          {milestone.reward.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-4 text-center">
                    {milestone.unlocked ? (
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Unlocked!</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        {progressPercentage.toFixed(0)}% complete
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* NFT Gallery Preview */}
      {unlockedCount > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your NFT Collection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones
              .filter((m) => m.unlocked && m.reward.type === "nft")
              .map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-center font-semibold text-gray-900 mb-1">
                    {milestone.reward.name}
                  </h4>
                  <p className="text-center text-xs text-gray-600">
                    {milestone.reward.description}
                  </p>
                </motion.div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Import missing icons
import { Calculator, BookOpen, CheckCircle } from "lucide-react";
