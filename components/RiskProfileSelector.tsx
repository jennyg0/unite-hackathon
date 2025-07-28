"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, TrendingUp, Rocket, Check, Info } from "lucide-react";
import { AaveService, type RiskProfile } from "@/lib/aave-service";
import { usePrivy } from "@privy-io/react-auth";

interface RiskProfileSelectorProps {
  onProfileSelect?: (profile: RiskProfile) => void;
  selectedProfile?: RiskProfile | null;
}

export default function RiskProfileSelector({
  onProfileSelect,
  selectedProfile,
}: RiskProfileSelectorProps) {
  const { user } = usePrivy();
  const [profiles, setProfiles] = useState<RiskProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);
  const [chainId, setChainId] = useState(137); // Default to Polygon

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const aaveService = new AaveService(chainId);
        const riskProfiles = await aaveService.getRiskProfiles();
        setProfiles(riskProfiles);
      } catch (error) {
        console.error("Failed to load risk profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [chainId]);

  const getIcon = (profile: RiskProfile) => {
    switch (profile.riskLevel) {
      case "low":
        return <Shield className="w-8 h-8" />;
      case "medium":
        return <TrendingUp className="w-8 h-8" />;
      case "high":
        return <Rocket className="w-8 h-8" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-full bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Risk Profile
        </h2>
        <p className="text-gray-600">
          Select a strategy that matches your financial goals and risk tolerance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {profiles.map((profile) => {
          const isSelected = selectedProfile?.name === profile.name;
          const isHovered = hoveredProfile === profile.name;

          return (
            <motion.div
              key={profile.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setHoveredProfile(profile.name)}
              onHoverEnd={() => setHoveredProfile(null)}
              onClick={() => onProfileSelect?.(profile)}
              className={`card cursor-pointer transition-all ${
                isSelected
                  ? "ring-2 ring-blue-500 shadow-lg"
                  : "hover:shadow-lg"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: `${profile.color}20`,
                    color: profile.color,
                  }}
                >
                  {getIcon(profile)}
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>

              {/* Profile Info */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {profile.icon} {profile.name}
              </h3>
              <p className="text-gray-600 mb-4">{profile.description}</p>

              {/* Target APY */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 mb-1">Target APY</p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: profile.color }}
                >
                  {profile.targetAPY}
                </p>
              </div>

              {/* Strategies */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Strategy Breakdown:
                </p>
                <AnimatePresence>
                  {(isHovered || isSelected) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {profile.strategies.map((strategy, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-700">
                              {strategy.asset} ({strategy.allocation}%)
                            </p>
                            <p className="text-xs text-gray-500">
                              {strategy.protocol} - {strategy.apy} APY
                            </p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {!isHovered && !isSelected && (
                  <p className="text-xs text-gray-500 italic">
                    Hover to see strategy details
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Your funds are automatically allocated across protocols</li>
              <li>Strategies are rebalanced periodically for optimal yields</li>
              <li>You can change your risk profile anytime</li>
              <li>All yields are auto-compounded for maximum growth</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
