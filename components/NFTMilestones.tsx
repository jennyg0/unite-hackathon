"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Target, Flame, Diamond, Rocket } from "lucide-react";
import { useMilestones } from "@/hooks/useMilestones";

export default function NFTMilestones() {
  const {
    milestones,
    userData,
    isLoading,
    getNextMilestones,
    getMilestoneProgress,
  } = useMilestones();

  const nextMilestones = getNextMilestones();

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Your Achievements
        </h2>
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-600">
            {milestones.length} Earned
          </span>
        </div>
      </div>

      {/* Earned Milestones */}
      {milestones.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Earned Milestones
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-3xl mb-2">{milestone.emoji}</div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {milestone.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {milestone.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(milestone.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  {milestone.imageUrl && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg p-2">
                      <img
                        src={milestone.imageUrl}
                        alt={milestone.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Next Milestones */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-4">
          Next Milestones
        </h3>
        <div className="space-y-4">
          {nextMilestones.map((milestone, index) => (
            <motion.div
              key={`${milestone.type}-${milestone.target}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <div
                  className="text-2xl p-2 rounded-lg"
                  style={{ backgroundColor: `${milestone.color}20` }}
                >
                  {milestone.emoji}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {milestone.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {milestone.description}
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {Math.round(
                          (milestone.progress / milestone.target) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: milestone.color }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            (milestone.progress / milestone.target) * 100,
                            100
                          )}%`,
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {userData && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <Diamond className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">
              ${userData.totalDeposited.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Total Saved</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">
              {userData.depositStreak} days
            </p>
            <p className="text-xs text-gray-600">Current Streak</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <Target className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">
              {userData.financialFreedomTarget > 0
                ? `${Math.round(
                    (userData.totalDeposited /
                      userData.financialFreedomTarget) *
                      100
                  )}%`
                : "Not Set"}
            </p>
            <p className="text-xs text-gray-600">FF Progress</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <Star className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">
              {milestones.length}
            </p>
            <p className="text-xs text-gray-600">Achievements</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {milestones.length === 0 && nextMilestones.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No achievements yet</p>
          <p className="text-sm text-gray-400">
            Start saving to earn your first milestone!
          </p>
        </div>
      )}
    </div>
  );
}
