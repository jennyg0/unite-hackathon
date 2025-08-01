"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  Trophy,
  Star,
  Target,
  DollarSign,
  BookOpen,
  Users,
  Rocket,
  Zap,
  Lock,
  Calendar,
} from "lucide-react";
import { MilestoneSDK, MilestoneType, type Milestone, type UserMilestoneData } from "@/lib/milestone-nft";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";

interface MilestoneCardProps {
  milestone: Milestone;
  isEarned: boolean;
  progress?: number;
  onClick?: () => void;
}

function MilestoneCard({ milestone, isEarned, progress = 0, onClick }: MilestoneCardProps) {
  const getIcon = (type: MilestoneType) => {
    switch (type) {
      case MilestoneType.FIRST_DEPOSIT: return DollarSign;
      case MilestoneType.SAVINGS_STREAK: return Target;
      case MilestoneType.AMOUNT_SAVED: return Trophy;
      case MilestoneType.FINANCIAL_FREEDOM: return Star;
      case MilestoneType.EDUCATION_COMPLETE: return BookOpen;
      case MilestoneType.REFERRAL_CHAMPION: return Users;
      case MilestoneType.EARLY_ADOPTER: return Rocket;
      case MilestoneType.WHALE_SAVER: return Zap;
      default: return Trophy;
    }
  };

  const getColor = (type: MilestoneType) => {
    switch (type) {
      case MilestoneType.FIRST_DEPOSIT: return { bg: 'from-green-50 to-green-100', border: 'border-green-200', icon: 'text-green-600' };
      case MilestoneType.SAVINGS_STREAK: return { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', icon: 'text-blue-600' };
      case MilestoneType.AMOUNT_SAVED: return { bg: 'from-yellow-50 to-yellow-100', border: 'border-yellow-200', icon: 'text-yellow-600' };
      case MilestoneType.FINANCIAL_FREEDOM: return { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', icon: 'text-purple-600' };
      case MilestoneType.EDUCATION_COMPLETE: return { bg: 'from-indigo-50 to-indigo-100', border: 'border-indigo-200', icon: 'text-indigo-600' };
      case MilestoneType.REFERRAL_CHAMPION: return { bg: 'from-pink-50 to-pink-100', border: 'border-pink-200', icon: 'text-pink-600' };
      case MilestoneType.EARLY_ADOPTER: return { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', icon: 'text-orange-600' };
      case MilestoneType.WHALE_SAVER: return { bg: 'from-cyan-50 to-cyan-100', border: 'border-cyan-200', icon: 'text-cyan-600' };
      default: return { bg: 'from-gray-50 to-gray-100', border: 'border-gray-200', icon: 'text-gray-600' };
    }
  };

  const Icon = getIcon(milestone.type);
  const colors = getColor(milestone.type);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`card cursor-pointer bg-gradient-to-br ${colors.bg} ${colors.border} ${
        isEarned ? 'shadow-lg' : 'opacity-60'
      } transition-all hover:shadow-xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          isEarned ? `bg-gradient-to-br ${colors.bg.replace('50', '200').replace('100', '300')}` : 'bg-gray-200'
        }`}>
          <Icon className={`w-6 h-6 ${isEarned ? colors.icon : 'text-gray-400'}`} />
        </div>
        
        <div className="flex items-center space-x-1">
          {isEarned ? (
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">✓</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {milestone.title}
      </h3>
      
      <p className="text-gray-600 mb-4 text-sm">
        {milestone.description}
      </p>

      {!isEarned && progress > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Progress</span>
            <span className="text-xs text-gray-500">{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${colors.icon.replace('text-', 'from-').replace('-600', '-400')} to-${colors.icon.replace('text-', '').replace('-600', '-600')}`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {isEarned && milestone.timestamp && (
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>Earned {milestone.timestamp.toLocaleDateString()}</span>
        </div>
      )}

      {milestone.emoji && (
        <div className="absolute top-2 right-2 text-2xl opacity-20">
          {milestone.emoji}
        </div>
      )}
    </motion.div>
  );
}

interface MilestoneNFTDisplayProps {
  onMilestoneClick?: (milestone: Milestone) => void;
}

export function MilestoneNFTDisplay({ onMilestoneClick }: MilestoneNFTDisplayProps) {
  const { user, authenticated } = usePrivy();
  const [milestoneData, setMilestoneData] = useState<UserMilestoneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const milestoneSDK = new MilestoneSDK(DEFAULT_CHAIN_ID);

  useEffect(() => {
    const fetchMilestoneData = async () => {
      if (!authenticated || !user?.wallet?.address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const data = await milestoneSDK.getUserData(user.wallet.address as `0x${string}`);
        setMilestoneData(data);
      } catch (err) {
        console.error('Failed to fetch milestone data, showing available milestones:', err);
        
        // Show available milestones instead of error
        const mockData: UserMilestoneData = {
          totalDeposited: 0,
          firstDepositTime: undefined,
          lastDepositTime: undefined,
          depositStreak: 0,
          longestStreak: 0,
          referralCount: 0,
          educationProgress: 0,
          financialFreedomTarget: 10000,
          milestones: [] // No earned milestones yet
        };
        setMilestoneData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestoneData();
  }, [authenticated, user?.wallet?.address]);

  // Generate all possible milestones with progress
  const generateAllMilestones = (data: UserMilestoneData): Array<{ milestone: Milestone; isEarned: boolean; progress: number }> => {
    const earnedMilestones = data.milestones;
    const earnedTypes = new Set(earnedMilestones.map(m => m.type));

    const allPossibleMilestones: Array<{ type: MilestoneType; title: string; description: string; requiredValue: number; progressCalc: () => number }> = [
      {
        type: MilestoneType.FIRST_DEPOSIT,
        title: "First Deposit",
        description: "Make your first deposit to start earning yield",
        requiredValue: 1,
        progressCalc: () => data.totalDeposited > 0 ? 1 : 0
      },
      {
        type: MilestoneType.SAVINGS_STREAK,
        title: "Auto Saver",
        description: "Set up your first automated deposit",
        requiredValue: 1,
        progressCalc: () => 0 // Will be updated when auto deposit is set up
      },
      {
        type: MilestoneType.EDUCATION_COMPLETE,
        title: "Learning Starter",
        description: "Complete your first education module",
        requiredValue: 1,
        progressCalc: () => data.educationProgress > 0 ? 1 : 0
      },
      {
        type: MilestoneType.AMOUNT_SAVED,
        title: "Milestone Saver",
        description: "Reach $100 in total savings",
        requiredValue: 100,
        progressCalc: () => Math.min(data.totalDeposited / 100, 1)
      },
      {
        type: MilestoneType.EARLY_ADOPTER,
        title: "BYOB Pioneer",
        description: "Join the BYOB community early",
        requiredValue: 1,
        progressCalc: () => 1 // All current users are early adopters
      }
    ];

    return allPossibleMilestones.map(template => {
      const earnedMilestone = earnedMilestones.find(m => m.type === template.type);
      const progress = template.progressCalc();
      const isEarned = earnedTypes.has(template.type) || progress >= 1;

      const milestone: Milestone = earnedMilestone || {
        id: template.type,
        type: template.type,
        value: template.requiredValue,
        title: template.title,
        description: template.description,
        timestamp: new Date(),
        emoji: milestoneSDK.getMilestoneInfo(template.type).emoji
      };

      return {
        milestone,
        isEarned,
        progress: isEarned ? 1 : progress
      };
    });
  };

  if (!authenticated) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Connect your wallet to view your achievements and milestones
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your achievements...</p>
      </div>
    );
  }

  if (!milestoneData) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your achievements...</p>
      </div>
    );
  }

  const allMilestones = generateAllMilestones(milestoneData);
  const earnedCount = allMilestones.filter(m => m.isEarned).length;
  const inProgressCount = allMilestones.filter(m => !m.isEarned && m.progress > 0).length;

  const categories = [
    { id: 'all', label: 'All', count: allMilestones.length },
    { id: 'earned', label: 'Earned', count: earnedCount },
    { id: 'progress', label: 'In Progress', count: inProgressCount },
    { id: 'locked', label: 'Locked', count: allMilestones.length - earnedCount - inProgressCount }
  ];

  const filteredMilestones = allMilestones.filter(({ isEarned, progress }) => {
    switch (selectedCategory) {
      case 'earned': return isEarned;
      case 'progress': return !isEarned && progress > 0;
      case 'locked': return !isEarned && progress === 0;
      default: return true;
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="text-3xl font-bold text-green-600 mb-1">{earnedCount}</div>
          <div className="text-sm text-gray-600">NFTs Earned</div>
        </div>
        <div className="card text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-1">{inProgressCount}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="card text-center bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="text-3xl font-bold text-gray-600 mb-1">{allMilestones.length}</div>
          <div className="text-sm text-gray-600">Total Available</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              selectedCategory === category.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredMilestones.map(({ milestone, isEarned, progress }, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <MilestoneCard
                milestone={milestone}
                isEarned={isEarned}
                progress={progress}
                onClick={() => onMilestoneClick?.(milestone)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMilestones.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No milestones in this category
          </h3>
          <p className="text-gray-600">
            Try selecting a different category to see your achievements
          </p>
        </div>
      )}
    </div>
  );
}

export default MilestoneNFTDisplay;