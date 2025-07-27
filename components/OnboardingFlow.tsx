"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "./OnboardingProvider";
import { OnboardingWelcome } from "./onboarding/OnboardingWelcome";
import { OnboardingCalculator } from "./onboarding/OnboardingCalculator";
import { OnboardingGoals } from "./onboarding/OnboardingGoals";
import { OnboardingStrategy } from "./onboarding/OnboardingStrategy";
import { OnboardingEducation } from "./onboarding/OnboardingEducation";
import { OnboardingComplete } from "./onboarding/OnboardingComplete";

export function OnboardingFlow() {
  const { state, progress, goToNextStep, goToPreviousStep, skipOnboarding } =
    useOnboarding();

  const renderStep = () => {
    switch (state.currentStep) {
      case "welcome":
        return (
          <OnboardingWelcome onNext={goToNextStep} onSkip={skipOnboarding} />
        );
      case "calculator":
        return (
          <OnboardingCalculator
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case "goals":
        return (
          <OnboardingGoals onNext={goToNextStep} onBack={goToPreviousStep} />
        );
      case "strategy":
        return (
          <OnboardingStrategy onNext={goToNextStep} onBack={goToPreviousStep} />
        );
      case "education":
        return (
          <OnboardingEducation
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case "complete":
        return <OnboardingComplete onBack={goToPreviousStep} />;
      default:
        return (
          <OnboardingWelcome onNext={goToNextStep} onSkip={skipOnboarding} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
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
