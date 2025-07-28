"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Rocket, Edit2, Check } from "lucide-react";
import RiskProfileSelector from "./RiskProfileSelector";
import { type RiskProfile } from "@/lib/aave-service";

export default function RiskProfileDisplay() {
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<RiskProfile | null>(
    null
  );

  // Load saved profile from localStorage
  useState(() => {
    const saved = localStorage.getItem("selectedRiskProfile");
    if (saved) {
      setCurrentProfile(JSON.parse(saved));
    }
  });

  const handleProfileSelect = (profile: RiskProfile) => {
    setCurrentProfile(profile);
    localStorage.setItem("selectedRiskProfile", JSON.stringify(profile));
    setIsEditing(false);
  };

  const getIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <Shield className="w-5 h-5" />;
      case "medium":
        return <TrendingUp className="w-5 h-5" />;
      case "high":
        return <Rocket className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Change Risk Profile
          </h3>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
        <RiskProfileSelector
          selectedProfile={currentProfile}
          onProfileSelect={handleProfileSelect}
        />
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Risk Profile
        </h3>
        <p className="text-gray-600 mb-4">
          You haven't selected a risk profile yet. Choose one to start earning
          yields on your savings.
        </p>
        <button onClick={() => setIsEditing(true)} className="btn-primary">
          Select Risk Profile
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Current Strategy
        </h3>
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm"
        >
          <Edit2 className="w-4 h-4" />
          <span>Change</span>
        </button>
      </div>

      <div className="flex items-center space-x-3 mb-4">
        <div
          className="p-2 rounded-lg"
          style={{
            backgroundColor: `${currentProfile.color}20`,
            color: currentProfile.color,
          }}
        >
          {getIcon(currentProfile.riskLevel)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">
            {currentProfile.icon} {currentProfile.name}
          </h4>
          <p className="text-sm text-gray-600">{currentProfile.description}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Target APY</span>
          <span
            className="font-semibold"
            style={{ color: currentProfile.color }}
          >
            {currentProfile.targetAPY}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Current Allocation:</p>
        {currentProfile.strategies.map((strategy, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-sm bg-white rounded-lg p-2 border border-gray-100"
          >
            <div>
              <span className="font-medium text-gray-700">
                {strategy.asset}
              </span>
              <span className="text-gray-500 ml-2">({strategy.protocol})</span>
            </div>
            <div className="text-right">
              <span className="font-medium text-gray-900">
                {strategy.allocation}%
              </span>
              <span className="text-xs text-gray-500 ml-1">
                • {strategy.apy} APY
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Check className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-900">
            <p className="font-medium mb-1">Auto-Rebalancing Active</p>
            <p>
              Your portfolio is automatically rebalanced to maintain optimal
              yields while respecting your risk tolerance.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
