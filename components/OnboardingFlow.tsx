"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "./OnboardingProvider";
import { OnboardingWelcome } from "./onboarding/OnboardingWelcome";
import OnboardingUsername from "./onboarding/OnboardingUsername";
import OnboardingFinancialFreedomEducation from "./onboarding/OnboardingFinancialFreedomEducation";
import OnboardingEmergencyFundEducation from "./onboarding/OnboardingEmergencyFundEducation";
import OnboardingStartEarning from "./onboarding/OnboardingStartEarning";
import OnboardingRiskProfile from "./onboarding/OnboardingRiskProfile";
import OnboardingTour from "./onboarding/OnboardingTour";
import { OnboardingComplete } from "./onboarding/OnboardingComplete";
import { FinancialFreedomCalculator } from "./FinancialFreedomCalculator";

export function OnboardingFlow() {
  const { state, progress, goToNextStep, goToPreviousStep, skipOnboarding } =
    useOnboarding();
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);

  const renderStep = () => {
    switch (state.currentStep) {
      case "welcome":
        return (
          <OnboardingWelcome 
            onNext={goToNextStep} 
            onSkip={skipOnboarding}
            onShowCalculator={() => setShowCalculatorModal(true)}
          />
        );
      case "username":
        return (
          <OnboardingUsername onNext={goToNextStep} onBack={goToPreviousStep} onSkip={goToNextStep} />
        );
      case "financial-freedom-education":
        return (
          <OnboardingFinancialFreedomEducation 
            onNext={goToNextStep} 
            onBack={goToPreviousStep}
            onSkip={goToNextStep}
          />
        );
      case "emergency-fund-education":
        return (
          <OnboardingEmergencyFundEducation 
            onNext={goToNextStep} 
            onBack={goToPreviousStep}
            onSkip={goToNextStep}
          />
        );
      case "start-earning":
        return (
          <OnboardingStartEarning onNext={goToNextStep} onBack={goToPreviousStep} />
        );
      case "risk-profile":
        return (
          <OnboardingRiskProfile
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={goToNextStep}
            initialData={state.userGoals}
          />
        );
      case "tour":
        return (
          <OnboardingTour
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={goToNextStep}
          />
        );
      case "complete":
        return <OnboardingComplete onFinish={skipOnboarding} />;
      default:
        return (
          <OnboardingWelcome onNext={goToNextStep} onSkip={skipOnboarding} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-green-600 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Skip Button */}
      {state.currentStep !== "complete" && (
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={skipOnboarding}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Step Content */}
      <div className="pt-16 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Calculator Modal */}
      {showCalculatorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Financial Freedom Calculator</h3>
                <button
                  onClick={() => setShowCalculatorModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FinancialFreedomCalculator />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
