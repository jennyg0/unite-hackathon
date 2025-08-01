"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Zap, 
  ArrowRight,
  ChevronRight,
  CheckCircle,
  Lightbulb
} from "lucide-react";

interface OnboardingFinancialFreedomEducationProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function OnboardingFinancialFreedomEducation({
  onNext,
  onBack,
  onSkip
}: OnboardingFinancialFreedomEducationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [completed, setCompleted] = useState(false);

  const slides = [
    {
      icon: Target,
      title: "What is Financial Freedom?",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Financial freedom means having enough saved money to live comfortably without depending on a paycheck. 
            It's when your investments generate enough income to cover your expenses.
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">The 4% Rule</h4>
            <p className="text-blue-800 text-sm">
              You need <strong>25x your yearly expenses</strong> saved up. Then you can safely withdraw 4% per year forever.
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Example</h4>
            <p className="text-green-800 text-sm">
              If you spend $4,000/month ($48,000/year), you need $1.2M saved. Then you can withdraw $48,000/year forever!
            </p>
          </div>
        </div>
      )
    },
    {
      icon: TrendingUp,
      title: "The Power of Compound Interest",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Compound interest is your money making money, which then makes more money. It's the most powerful force in finance!
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-gray-700 mb-1">Traditional Bank</h4>
              <p className="text-2xl font-bold text-gray-600">0.5%</p>
              <p className="text-sm text-gray-500">APY</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-200">
              <h4 className="font-semibold text-green-700 mb-1">DeFi Yields</h4>
              <p className="text-2xl font-bold text-green-600">6.5%+</p>
              <p className="text-sm text-green-500">APY</p>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Pro Tip</h4>
                <p className="text-yellow-800 text-sm">
                  Starting early is more important than the amount. Time is your biggest advantage!
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Clock,
      title: "Time = Money (Literally)",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            The earlier you start, the less you need to save monthly. Let's see the magic of starting early:
          </p>
          
          {/* Comparison Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-700 mb-2">Starting at 35</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-600">Monthly savings:</span>
                  <span className="font-semibold text-red-700">$1,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Years to save:</span>
                  <span className="font-semibold text-red-700">30 years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Total saved:</span>
                  <span className="font-semibold text-red-700">$432,000</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-700 mb-2">Starting at 25</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">Monthly savings:</span>
                  <span className="font-semibold text-green-700">$500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Years to save:</span>
                  <span className="font-semibold text-green-700">40 years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Total saved:</span>
                  <span className="font-semibold text-green-700">$240,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-blue-800 font-semibold">
              Both reach $1M at 65! Starting 10 years earlier saves you $700/month 💰
            </p>
          </div>
        </div>
      )
    },
    {
      icon: Zap,
      title: "DeFi: Your Fast Track to Freedom",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Traditional finance is slow and pays almost nothing. DeFi (Decentralized Finance) gives you access to the same yields that banks use to make profits.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Higher Yields</h4>
                <p className="text-sm text-gray-600">Earn 6-15% APY instead of 0.5% at banks</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Full Control</h4>
                <p className="text-sm text-gray-600">Your money stays in your wallet - withdraw anytime</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Transparent</h4>
                <p className="text-sm text-gray-600">See exactly where your money goes and how yields are generated</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">AI-Optimized</h4>
                <p className="text-sm text-gray-600">Our AI finds the best yields across 20+ protocols automatically</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-4">
            <div className="text-center">
              <h4 className="font-bold mb-2">🚀 The DeFi Advantage</h4>
              <p className="text-sm opacity-90">
                Reach financial freedom <strong>5-10 years faster</strong> with DeFi yields vs traditional banking
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setCompleted(true);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Great! You're Ready to Build Wealth 🎉
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Now you understand the power of compound interest and why DeFi can accelerate your path to financial freedom.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="btn-primary px-8 py-3 flex items-center space-x-2"
          >
            <span>Continue to Emergency Fund</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  const Icon = slides[currentSlide].icon;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Financial Freedom 101
        </h1>
        <p className="text-gray-600">
          Learn the fundamentals that will change your financial future
        </p>
      </div>

      {/* Slide Progress */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide
                  ? "bg-blue-600"
                  : index < currentSlide
                  ? "bg-green-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Slide Content */}
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="card mb-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {slides[currentSlide].title}
          </h2>
        </div>
        
        <div className="min-h-[300px]">
          {slides[currentSlide].content}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Username
          </button>
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip Education
          </button>
        </div>

        <div className="flex space-x-4">
          {currentSlide > 0 && (
            <button
              onClick={prevSlide}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Previous
            </button>
          )}
          <button
            onClick={nextSlide}
            className="btn-primary px-8 py-3 flex items-center space-x-2"
          >
            <span>{currentSlide === slides.length - 1 ? "Finish" : "Next"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}