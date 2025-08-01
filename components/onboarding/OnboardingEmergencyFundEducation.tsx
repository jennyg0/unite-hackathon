"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Home,
  Car,
  Heart,
  Briefcase
} from "lucide-react";

interface OnboardingEmergencyFundEducationProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function OnboardingEmergencyFundEducation({
  onNext,
  onBack,
  onSkip
}: OnboardingEmergencyFundEducationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [completed, setCompleted] = useState(false);

  const slides = [
    {
      icon: Shield,
      title: "What is an Emergency Fund?",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            An emergency fund is money set aside to cover unexpected expenses or financial emergencies. 
            It's your financial safety net that protects you from going into debt when life happens.
          </p>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-2">Why You Need One</h4>
                <p className="text-red-800 text-sm">
                  78% of Americans live paycheck to paycheck. Without an emergency fund, 
                  unexpected expenses force people into debt, derailing their financial goals.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-2">Peace of Mind</h4>
                <p className="text-green-800 text-sm">
                  With an emergency fund, you can handle life's surprises without stress, 
                  protect your investments, and stay on track toward financial freedom.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: DollarSign,
      title: "How Much Do You Need?",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            The standard rule is <strong>3-6 months of living expenses</strong>, but the right amount depends on your situation.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">3 Months (Minimum)</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Stable job with good benefits</li>
                <li>• Dual-income household</li>
                <li>• Low monthly expenses</li>
                <li>• Good health insurance</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">6+ Months (Recommended)</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Freelancer or contractor</li>
                <li>• Single income household</li>
                <li>• High monthly expenses</li>
                <li>• Health concerns or dependents</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">Quick Calculation</h4>
            <p className="text-purple-800 text-sm mb-2">
              Monthly expenses: Rent + Food + Utilities + Insurance + Debt payments + Other essentials
            </p>
            <div className="bg-white rounded p-3 text-center">
              <p className="text-lg font-semibold text-purple-900">
                $4,000/month × 6 = <span className="text-2xl">$24,000</span> emergency fund
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: AlertTriangle,
      title: "Common Emergency Scenarios",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Emergencies come in many forms. Here are the most common situations where you'll need your fund:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <Briefcase className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Job Loss</h4>
              </div>
              <p className="text-red-800 text-sm">
                Average job search takes 3-6 months. Your emergency fund covers expenses while you find new work.
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-orange-900">Medical Emergency</h4>
              </div>
              <p className="text-orange-800 text-sm">
                Hospital bills, surgery, or extended treatment can cost thousands even with insurance.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Home className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Home Repairs</h4>
              </div>
              <p className="text-blue-800 text-sm">
                Water damage, roof repairs, HVAC failure - home emergencies can be expensive and urgent.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Car className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Car Breakdown</h4>
              </div>
              <p className="text-green-800 text-sm">
                Major car repairs or replacement can cost $3,000-$10,000+ and you need transportation for work.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 text-center font-medium">
              💡 Pro Tip: These scenarios often happen together - like losing your job during a recession when your car also breaks down!
            </p>
          </div>
        </div>
      )
    },
    {
      icon: TrendingUp,
      title: "Emergency Fund Strategy",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Your emergency fund should be easily accessible but still growing. Here's the optimal strategy:
          </p>
          
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">🏆 Best: High-Yield DeFi (Recommended)</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-800 font-medium">Benefits:</p>
                  <ul className="text-blue-700 mt-1 space-y-1">
                    <li>• 4-6% APY (vs 0.5% banks)</li>
                    <li>• Withdraw anytime</li>
                    <li>• Funds keep growing</li>
                    <li>• Full control</li>
                  </ul>
                </div>
                <div>
                  <p className="text-blue-800 font-medium">Best for:</p>
                  <ul className="text-blue-700 mt-1 space-y-1">
                    <li>• Stable stablecoins (USDC)</li>
                    <li>• Battle-tested protocols (Aave)</li>
                    <li>• Conservative strategies</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">✅ Good: High-Yield Savings Account</h4>
              <div className="text-sm text-yellow-800">
                <p>Traditional but safe option earning 4-5% APY. FDIC insured but lower returns than DeFi.</p>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2">❌ Avoid: Regular Savings Account</h4>
              <div className="text-sm text-red-800">
                <p>Only 0.5% APY - inflation eats your purchasing power over time. Emergency fund should grow, not shrink.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-4">
            <div className="text-center">
              <h4 className="font-bold mb-2">💰 The Math</h4>
              <p className="text-sm opacity-90 mb-2">
                $24,000 emergency fund growing at different rates:
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="font-semibold">Bank (0.5%)</p>
                  <p>$120/year</p>
                </div>
                <div>
                  <p className="font-semibold">HYSA (4%)</p>
                  <p>$960/year</p>
                </div>
                <div>
                  <p className="font-semibold">DeFi (6%)</p>
                  <p>$1,440/year</p>
                </div>
              </div>
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
          You're Ready to Build Your Safety Net! 🛡️
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Now you understand why an emergency fund is crucial and how to make it work harder with DeFi yields.
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
            <span>Continue to Goal Setting</span>
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
          Emergency Fund Essentials
        </h1>
        <p className="text-gray-600">
          Build your financial safety net the smart way
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
            ← Back to Financial Freedom
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