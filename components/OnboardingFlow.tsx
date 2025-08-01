"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "./OnboardingProvider";
import { OnboardingWelcome } from "./onboarding/OnboardingWelcome";
import OnboardingUsername from "./onboarding/OnboardingUsername";
import { OnboardingCalculator } from "./onboarding/OnboardingCalculator";
import OnboardingFinancialFreedomEducation from "./onboarding/OnboardingFinancialFreedomEducation";
import OnboardingEmergencyFundEducation from "./onboarding/OnboardingEmergencyFundEducation";
import OnboardingStartEarning from "./onboarding/OnboardingStartEarning";
import OnboardingRiskProfile from "./onboarding/OnboardingRiskProfile";
import OnboardingTour from "./onboarding/OnboardingTour";
import { OnboardingComplete } from "./onboarding/OnboardingComplete";

export function OnboardingFlow() {
  const { state, progress, goToNextStep, goToPreviousStep, skipOnboarding } =
    useOnboarding();

  const renderStep = () => {
    switch (state.currentStep) {
      case "welcome":
        return (
          <OnboardingWelcome 
            onNext={goToNextStep} 
            onSkip={skipOnboarding}
            onShowCalculator={goToNextStep}
          />
        );
      case "username":
        return (
          <OnboardingUsername onNext={goToNextStep} onBack={goToPreviousStep} onSkip={goToNextStep} />
        );
      case "financial-calculator":
        return (
          <OnboardingCalculator 
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={goToNextStep}
          />
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

    </div>
  );
}
