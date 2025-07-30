"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  History,
  BarChart3,
  Shield,
  Zap,
  Clock,
  Target,
  CheckCircle,
  Sparkles,
  PiggyBank,
} from "lucide-react";

interface OnboardingTourProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const tourSteps = [
  {
    id: 'earnings',
    title: 'Real-time Earnings Dashboard',
    description: 'Watch your money grow in real-time with live APY tracking',
    icon: TrendingUp,
    features: [
      'Live balance updates',
      'Current APY display',
      'Projected earnings',
      'Easy deposit setup',
    ],
    color: 'green',
    mockData: {
      balance: '$2,847.92',
      apy: '12.4%',
      earned: '$347.92',
      projection: '$420 this month',
    },
  },
  {
    id: 'history',
    title: 'Complete Transaction History',
    description: 'Track every deposit, withdrawal, and earning with detailed history',
    icon: History,
    features: [
      'Detailed transaction logs',
      'Earnings breakdowns',
      'Export capabilities',
      'Filter and search',
    ],
    color: 'blue',
    mockData: {
      recentTransactions: [
        { type: 'Deposit', amount: '+$250', date: 'Today' },
        { type: 'Interest', amount: '+$8.42', date: 'Yesterday' },
        { type: 'Deposit', amount: '+$250', date: '3 days ago' },
      ],
    },
  },
  {
    id: 'automation',
    title: 'Smart Automation',
    description: 'Set it and forget it - automated deposits and optimization',
    icon: Zap,
    features: [
      'Automated deposits',
      'Dollar-cost averaging',
      'Risk optimization',
      'Rebalancing alerts',
    ],
    color: 'purple',
    mockData: {
      nextDeposit: 'Tomorrow',
      frequency: 'Weekly',
      amount: '$250',
      strategy: 'Balanced',
    },
  },
  {
    id: 'security',
    title: 'Bank-level Security',
    description: 'Your funds are protected with institutional-grade security',
    icon: Shield,
    features: [
      'Multi-sig wallets',
      'Insurance coverage',
      'Audit reports',
      'Emergency controls',
    ],
    color: 'red',
    mockData: {
      insurance: '$2M covered',
      audits: '3 completed',
      uptime: '99.9%',
      protocols: '5+ integrated',
    },
  },
];

export default function OnboardingTour({ onNext, onBack, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tourSteps[currentStep];

  const handleNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onNext();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  const getBorderColor = (color: string) => {
    const colors = {
      green: 'border-green-200',
      blue: 'border-blue-200',
      purple: 'border-purple-200',
      red: 'border-red-200',
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  const renderMockContent = () => {
    switch (step.id) {
      case 'earnings':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900">{step.mockData.balance}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Current APY</p>
                <p className="text-2xl font-bold text-green-600">{step.mockData.apy}</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700">
                <TrendingUp className="inline w-4 h-4 mr-1" />
                You've earned <strong>{step.mockData.earned}</strong> so far
              </p>
              <p className="text-sm text-green-600 mt-1">
                Projected: {step.mockData.projection}
              </p>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold mb-4">Recent Activity</h4>
            <div className="space-y-3">
              {step.mockData.recentTransactions?.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <p className="font-medium">{tx.type}</p>
                    <p className="text-sm text-gray-600">{tx.date}</p>
                  </div>
                  <p className={`font-semibold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount}
                  </p>
                </div>
              )) || <p className="text-gray-500">No recent transactions</p>}
            </div>
          </div>
        );

      case 'automation':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Next Deposit</p>
                <p className="font-semibold">{step.mockData.nextDeposit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Frequency</p>
                <p className="font-semibold">{step.mockData.frequency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-semibold">{step.mockData.amount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Strategy</p>
                <p className="font-semibold">{step.mockData.strategy}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
              <p className="text-sm text-purple-700">
                <Zap className="inline w-4 h-4 mr-1" />
                Automation active - earning 24/7
              </p>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Insurance</p>
                <p className="font-semibold">{step.mockData.insurance}</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="font-semibold">{step.mockData.uptime}</p>
              </div>
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Audits</p>
                <p className="font-semibold">{step.mockData.audits}</p>
              </div>
              <div className="text-center">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Protocols</p>
                <p className="font-semibold">{step.mockData.protocols}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Quick Tour
        </h2>
        <p className="text-lg text-gray-600">
          See what makes Compound special (30 seconds)
        </p>
      </div>

      {/* Progress indicators */}
      <div className="flex justify-center space-x-2 mb-8">
        {tourSteps.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentStep
                ? 'bg-green-500 scale-125'
                : index < currentStep
                ? 'bg-green-300'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="card">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step header */}
            <div className="flex items-start space-x-4 mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getColorClasses(step.color)}`}>
                <step.icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-lg text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  {step.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Preview:</h4>
                {renderMockContent()}
              </div>
            </div>

            {/* Highlight box */}
            <div className={`rounded-lg p-4 border ${getBorderColor(step.color)} bg-gradient-to-r from-gray-50 to-white`}>
              <div className="flex items-center space-x-3">
                <step.icon className={`w-6 h-6 ${step.color === 'green' ? 'text-green-600' : 
                  step.color === 'blue' ? 'text-blue-600' : 
                  step.color === 'purple' ? 'text-purple-600' : 'text-red-600'}`} />
                <div>
                  <p className="font-medium text-gray-900">
                    {step.id === 'earnings' && 'Your money works 24/7 - even while you sleep'}
                    {step.id === 'history' && 'Full transparency - track every penny'}
                    {step.id === 'automation' && 'Hands-off investing - maximum convenience'}
                    {step.id === 'security' && 'Enterprise security - your funds are protected'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {step.id === 'earnings' && 'Compound interest means your earnings start earning too'}
                    {step.id === 'history' && 'Download statements and export data anytime'}
                    {step.id === 'automation' && 'Dollar-cost averaging reduces risk automatically'}
                    {step.id === 'security' && 'Multi-layer protection with insurance coverage'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Setup
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onSkip}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Skip tour
            </button>

            {currentStep > 0 && (
              <button
                onClick={handlePrevStep}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            <button
              onClick={handleNextStep}
              className="btn-primary px-6 py-3 flex items-center space-x-2"
            >
              <span>
                {currentStep === tourSteps.length - 1 ? 'Finish Tour' : 'Next Feature'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step counter */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Step {currentStep + 1} of {tourSteps.length}
          </p>
        </div>
      </div>
    </motion.div>
  );
}