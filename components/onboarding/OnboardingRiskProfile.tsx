"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Clock,
  BarChart3,
} from "lucide-react";
import { useOnboarding } from "../OnboardingProvider";

interface OnboardingRiskProfileProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  initialData?: {
    financialFreedomNumber?: number;
    monthlySavingsGoal?: number;
    riskTolerance?: 'low' | 'medium' | 'high';
    preferredStrategy?: 'savings' | 'yield' | 'mixed';
  };
}

export default function OnboardingRiskProfile({ 
  onNext, 
  onBack, 
  onSkip,
  initialData 
}: OnboardingRiskProfileProps) {
  const { updateUserGoals } = useOnboarding();
  
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>(
    initialData?.riskTolerance || 'medium'
  );
  const [strategy, setStrategy] = useState<'savings' | 'yield' | 'mixed'>(
    initialData?.preferredStrategy || 'mixed'
  );
  const [timeHorizon, setTimeHorizon] = useState<'short' | 'medium' | 'long'>('medium');

  const riskProfiles = [
    {
      id: 'low' as const,
      title: 'Conservative',
      description: 'Steady growth with minimal risk',
      icon: Shield,
      apy: '8-10%',
      features: ['Stable returns', 'Lower volatility', 'Capital protection'],
      color: 'blue',
    },
    {
      id: 'medium' as const,
      title: 'Balanced',
      description: 'Good returns with moderate risk',
      icon: BarChart3,
      apy: '10-14%',
      features: ['Balanced portfolio', 'Diversified risk', 'Optimal for most'],
      color: 'green',
      popular: true,
    },
    {
      id: 'high' as const,
      title: 'Aggressive',
      description: 'Maximum returns, higher risk',
      icon: Zap,
      apy: '12-18%',
      features: ['Higher yields', 'More volatile', 'Active management'],
      color: 'purple',
    },
  ];

  const strategies = [
    {
      id: 'savings' as const,
      title: 'Stable Savings',
      description: 'Focus on capital preservation',
      icon: Target,
      best: 'Best for emergency funds',
    },
    {
      id: 'yield' as const,
      title: 'Yield Farming',
      description: 'Maximize earning potential',
      icon: TrendingUp,
      best: 'Best for experienced users',
    },
    {
      id: 'mixed' as const,
      title: 'Smart Mix',
      description: 'Automated optimization',
      icon: CheckCircle,
      best: 'Best for most users',
      popular: true,
    },
  ];

  const timeHorizons = [
    { id: 'short' as const, label: '< 1 year', description: 'Short-term goals' },
    { id: 'medium' as const, label: '1-5 years', description: 'Medium-term goals' },
    { id: 'long' as const, label: '5+ years', description: 'Long-term wealth' },
  ];

  const handleContinue = () => {
    // Save the user's preferences
    updateUserGoals({
      riskTolerance,
      preferredStrategy: strategy,
    });
    onNext();
  };

  const getColorClasses = (color: string, selected: boolean) => {
    const colors = {
      blue: selected 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200 hover:border-blue-300',
      green: selected 
        ? 'border-green-500 bg-green-50' 
        : 'border-gray-200 hover:border-green-300',
      purple: selected 
        ? 'border-purple-500 bg-purple-50' 
        : 'border-gray-200 hover:border-purple-300',
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Optimize Your Returns
        </h2>
        <p className="text-lg text-gray-600">
          Quick questions to maximize your earnings (takes 30 seconds)
        </p>
      </div>

      <div className="card">
        {/* Risk Tolerance */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What's your risk tolerance?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskProfiles.map((profile) => {
              const Icon = profile.icon;
              const isSelected = riskTolerance === profile.id;
              
              return (
                <button
                  key={profile.id}
                  onClick={() => setRiskTolerance(profile.id)}
                  className={`relative p-4 rounded-lg border-2 text-left transition-all ${getColorClasses(profile.color, isSelected)}`}
                >
                  {profile.popular && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                  
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon className={`w-6 h-6 ${getIconColor(profile.color)}`} />
                    <div>
                      <h4 className="font-semibold">{profile.title}</h4>
                      <p className="text-sm text-gray-600">{profile.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {profile.apy} APY
                    </span>
                  </div>
                  
                  <ul className="text-xs text-gray-600 space-y-1">
                    {profile.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {isSelected && (
                    <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Strategy Preference */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Preferred investment strategy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strategies.map((strat) => {
              const Icon = strat.icon;
              const isSelected = strategy === strat.id;
              
              return (
                <button
                  key={strat.id}
                  onClick={() => setStrategy(strat.id)}
                  className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {strat.popular && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                  
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold">{strat.title}</h4>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{strat.description}</p>
                  <p className="text-xs text-green-700 font-medium">{strat.best}</p>
                  
                  {isSelected && (
                    <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Horizon */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Investment timeline
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {timeHorizons.map((horizon) => (
              <button
                key={horizon.id}
                onClick={() => setTimeHorizon(horizon.id)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  timeHorizon === horizon.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{horizon.label}</div>
                <div className="text-sm text-gray-600">{horizon.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Optimization Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-6 border border-green-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h4 className="text-lg font-semibold text-green-900">
              Your optimized strategy
            </h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-green-700">Risk Level</p>
              <p className="text-xl font-bold text-green-900 capitalize">
                {riskTolerance}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700">Strategy</p>
              <p className="text-xl font-bold text-green-900">
                {strategies.find(s => s.id === strategy)?.title}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700">Expected APY</p>
              <p className="text-xl font-bold text-green-900">
                {riskProfiles.find(r => r.id === riskTolerance)?.apy}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-sm text-green-700 text-center">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              This strategy is optimized for your risk level and timeline
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onSkip}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Use defaults
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <span>Optimize My Returns</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}