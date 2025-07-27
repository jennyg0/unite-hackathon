"use client";

import { motion } from "framer-motion";
import { BookOpen, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useOnboarding } from "../OnboardingProvider";

interface OnboardingEducationProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingEducation({
  onNext,
  onBack,
}: OnboardingEducationProps) {
  const { completeStep } = useOnboarding();

  const topics = [
    {
      title: "What is DeFi?",
      description: "Decentralized Finance explained in simple terms",
      duration: "2 min read",
      completed: false,
    },
    {
      title: "The 4% Rule",
      description: "Understanding the financial freedom calculation",
      duration: "3 min read",
      completed: false,
    },
    {
      title: "Risk Management",
      description: "How to protect your investments",
      duration: "4 min read",
      completed: false,
    },
  ];

  const handleNext = () => {
    completeStep("education");
    onNext();
  };

  return (
    <div className="py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-orange-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Learn the Basics
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          Take a few minutes to understand DeFi and how it can accelerate your
          path to financial freedom.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-600">{topic.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {topic.duration}
                  </span>
                  <CheckCircle className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-blue-700">
              You can always access these educational resources later in the
              "Learn" section. Take your time to understand the concepts that
              matter most to you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={onBack}
              className="btn-secondary flex items-center justify-center space-x-2 py-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNext}
              className="btn-primary flex items-center justify-center space-x-2 py-3"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
