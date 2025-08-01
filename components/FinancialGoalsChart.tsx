"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  DollarSign,
  ArrowUpRight,
  Info
} from "lucide-react";

interface GoalProjection {
  current: number;
  target: number;
  monthlyContribution: number;
  currentAPY: number;
  traditionalAPY: number;
  monthsToGoalDeFi: number;
  monthsToGoalTraditional: number;
  title: string;
  color: string;
}

interface FinancialGoalsChartProps {
  emergencyGoal?: GoalProjection;
  freedomGoal?: GoalProjection;
}

export function FinancialGoalsChart({ emergencyGoal, freedomGoal }: FinancialGoalsChartProps) {
  const [selectedGoal, setSelectedGoal] = useState<'emergency' | 'freedom'>('emergency');
  const [showComparison, setShowComparison] = useState(true);

  const currentGoal = selectedGoal === 'emergency' ? emergencyGoal : freedomGoal;

  if (!currentGoal) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Goal Timeline</h3>
          <p className="text-gray-600">Set up your financial goals to see progress charts</p>
        </div>
      </div>
    );
  }

  // Generate timeline data points (monthly projections)
  const generateTimelineData = (apy: number, months: number) => {
    const data = [];
    let balance = currentGoal.current;
    const monthlyRate = apy / 12 / 100;
    
    for (let month = 0; month <= Math.min(months, 120); month++) { // Cap at 10 years for display
      data.push({
        month,
        balance: Math.round(balance),
        year: Math.floor(month / 12),
        isTarget: balance >= currentGoal.target
      });
      
      if (balance < currentGoal.target) {
        balance = balance * (1 + monthlyRate) + currentGoal.monthlyContribution;
      }
    }
    
    return data;
  };

  const defiData = generateTimelineData(currentGoal.currentAPY, currentGoal.monthsToGoalDeFi);
  const traditionalData = generateTimelineData(currentGoal.traditionalAPY, currentGoal.monthsToGoalTraditional);

  // Calculate savings from using DeFi
  const yearsSaved = Math.max(0, (currentGoal.monthsToGoalTraditional - currentGoal.monthsToGoalDeFi) / 12);
  const percentageFaster = currentGoal.monthsToGoalTraditional > 0 
    ? ((currentGoal.monthsToGoalTraditional - currentGoal.monthsToGoalDeFi) / currentGoal.monthsToGoalTraditional) * 100 
    : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Goal Timeline</h3>
          <p className="text-sm text-gray-600">Your path to financial freedom</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-3 py-1 text-xs rounded-full ${
              showComparison 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Compare Banks
          </button>
        </div>
      </div>

      {/* Goal Selector */}
      {emergencyGoal && freedomGoal && (
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setSelectedGoal('emergency')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedGoal === 'emergency'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Emergency Fund
          </button>
          <button
            onClick={() => setSelectedGoal('freedom')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedGoal === 'freedom'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Financial Freedom
          </button>
        </div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">DeFi APY</span>
          </div>
          <p className="text-lg font-bold text-green-900">
            {currentGoal.currentAPY.toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Time to Goal</span>
          </div>
          <p className="text-lg font-bold text-blue-900">
            {Math.round(currentGoal.monthsToGoalDeFi / 12 * 10) / 10} years
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Years Saved</span>
          </div>
          <p className="text-lg font-bold text-purple-900">
            {yearsSaved.toFixed(1)} years
          </p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">Target</span>
          </div>
          <p className="text-lg font-bold text-yellow-900">
            ${currentGoal.target.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="relative h-64 bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Growth Projection</h4>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">DeFi ({currentGoal.currentAPY}%)</span>
            </div>
            {showComparison && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Banks ({currentGoal.traditionalAPY}%)</span>
              </div>
            )}
          </div>
        </div>

        {/* Simple Line Chart Visualization */}
        <div className="relative h-40">
          {/* Target Line */}
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-yellow-400"
            style={{ top: '20%' }}
          >
            <span className="absolute -top-6 right-0 text-xs text-yellow-600 font-medium">
              Target: ${currentGoal.target.toLocaleString()}
            </span>
          </div>

          {/* DeFi Growth Line */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="defiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* DeFi curve */}
            <path
              d={`M 0 ${160 - (currentGoal.current / currentGoal.target) * 120} 
                  Q 100 ${160 - (currentGoal.current / currentGoal.target) * 120 - 20} 
                  200 ${Math.max(40, 160 - 120)}
                  Q 250 ${Math.max(30, 160 - 130)}
                  300 ${Math.max(20, 160 - 140)}`}
              stroke="#10B981"
              strokeWidth="3"
              fill="none"
              className="drop-shadow-sm"
            />
            
            {/* DeFi area fill */}
            <path
              d={`M 0 ${160 - (currentGoal.current / currentGoal.target) * 120}
                  Q 100 ${160 - (currentGoal.current / currentGoal.target) * 120 - 20} 
                  200 ${Math.max(40, 160 - 120)}
                  Q 250 ${Math.max(30, 160 - 130)}
                  300 ${Math.max(20, 160 - 140)}
                  L 300 160 L 0 160 Z`}
              fill="url(#defiGradient)"
            />

            {/* Traditional bank line (if showing comparison) */}
            {showComparison && (
              <path
                d={`M 0 ${160 - (currentGoal.current / currentGoal.target) * 120}
                    L 300 ${Math.max(80, 160 - 80)}`}
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
                opacity="0.8"
              />
            )}
          </svg>

          {/* Timeline markers */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
            <span>Now</span>
            <span>2 years</span>
            <span>5 years</span>
            <span>10 years</span>
          </div>
        </div>
      </div>

      {/* DeFi vs Traditional Comparison */}
      {showComparison && percentageFaster > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200"
        >
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                🚀 DeFi Advantage
              </h4>
              <p className="text-sm text-gray-700">
                By using DeFi protocols instead of traditional savings accounts, you'll reach your{' '}
                <strong>{currentGoal.title.toLowerCase()}</strong> goal{' '}
                <strong className="text-green-600">{yearsSaved.toFixed(1)} years faster</strong>{' '}
                ({percentageFaster.toFixed(0)}% faster) thanks to higher yields!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}