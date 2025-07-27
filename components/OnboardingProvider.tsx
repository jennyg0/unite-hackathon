"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  OnboardingState,
  OnboardingStep,
  getInitialOnboardingState,
  getNextStep,
  getPreviousStep,
  calculateProgress,
} from "@/lib/onboarding";

interface OnboardingContextType {
  state: OnboardingState;
  progress: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (stepId: string) => void;
  completeStep: (stepId: string) => void;
  updateUserGoals: (goals: Partial<OnboardingState["userGoals"]>) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    // Check if user has completed onboarding before
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("onboarding-state");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed;
        } catch (e) {
          console.error("Failed to parse saved onboarding state:", e);
        }
      }
    }
    return getInitialOnboardingState();
  });

  const progress = calculateProgress(state.steps);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding-state", JSON.stringify(state));
    }
  }, [state]);

  const goToNextStep = () => {
    const nextStep = getNextStep(state.currentStep);
    if (nextStep) {
      setState((prev) => ({
        ...prev,
        currentStep: nextStep,
      }));
    }
  };

  const goToPreviousStep = () => {
    const prevStep = getPreviousStep(state.currentStep);
    if (prevStep) {
      setState((prev) => ({
        ...prev,
        currentStep: prevStep,
      }));
    }
  };

  const goToStep = (stepId: string) => {
    setState((prev) => ({
      ...prev,
      currentStep: stepId,
    }));
  };

  const completeStep = (stepId: string) => {
    setState((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      ),
    }));
  };

  const updateUserGoals = (goals: Partial<OnboardingState["userGoals"]>) => {
    setState((prev) => ({
      ...prev,
      userGoals: { ...prev.userGoals, ...goals },
    }));
  };

  const skipOnboarding = () => {
    setState((prev) => ({
      ...prev,
      isFirstTime: false,
      completed: true,
      steps: prev.steps.map((step) => ({ ...step, completed: true })),
    }));
  };

  const resetOnboarding = () => {
    setState(getInitialOnboardingState());
  };

  const value: OnboardingContextType = {
    state,
    progress,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    completeStep,
    updateUserGoals,
    skipOnboarding,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
