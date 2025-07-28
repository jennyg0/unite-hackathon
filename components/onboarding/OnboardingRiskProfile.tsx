"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import RiskProfileSelector from "@/components/RiskProfileSelector";
import { type RiskProfile } from "@/lib/aave-service";

interface OnboardingRiskProfileProps {
  onComplete: (data: any) => void;
  initialData?: any;
}

export default function OnboardingRiskProfile({
  onComplete,
  initialData,
}: OnboardingRiskProfileProps) {
  const [selectedProfile, setSelectedProfile] = useState<RiskProfile | null>(
    initialData?.riskProfile || null
  );

  const handleProfileSelect = (profile: RiskProfile) => {
    setSelectedProfile(profile);
  };

  const handleContinue = () => {
    if (selectedProfile) {
      onComplete({ riskProfile: selectedProfile });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          How much risk are you comfortable with?
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your risk profile determines how we'll allocate your savings across
          different DeFi protocols. Higher risk means higher potential returns,
          but also more volatility.
        </p>
      </div>

      <RiskProfileSelector
        selectedProfile={selectedProfile}
        onProfileSelect={handleProfileSelect}
      />

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedProfile}
          className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue with {selectedProfile?.name || "Selected"} Profile
        </button>
      </div>
    </motion.div>
  );
}
