export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface OnboardingState {
  isFirstTime: boolean;
  currentStep: string;
  steps: OnboardingStep[];
  userGoals: {
    financialFreedomNumber?: number;
    monthlySavingsGoal?: number;
    riskTolerance?: 'low' | 'medium' | 'high';
    preferredStrategy?: 'savings' | 'yield' | 'mixed';
  };
  completed: boolean;
}

export const ONBOARDING_STEPS: Omit<OnboardingStep, 'completed'>[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Financial Journey',
    description: 'Let\'s get to know you and set up your personalized savings plan',
    required: true,
  },
  {
    id: 'calculator',
    title: 'Calculate Your Financial Freedom',
    description: 'Discover how much you need to save for financial independence',
    required: true,
  },
  {
    id: 'goals',
    title: 'Set Your Savings Goals',
    description: 'Define your monthly savings target and timeline',
    required: true,
  },
  {
    id: 'strategy',
    title: 'Choose Your Strategy',
    description: 'Select your preferred approach to building wealth',
    required: false,
  },
  {
    id: 'education',
    title: 'Learn the Basics',
    description: 'Understand DeFi and how it can accelerate your savings',
    required: false,
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Start your journey to financial freedom',
    required: true,
  },
];

export const getInitialOnboardingState = (): OnboardingState => ({
  isFirstTime: true,
  currentStep: 'welcome',
  steps: ONBOARDING_STEPS.map(step => ({ ...step, completed: false })),
  userGoals: {},
  completed: false,
});

export const getStepIndex = (stepId: string): number => {
  return ONBOARDING_STEPS.findIndex(step => step.id === stepId);
};

export const getNextStep = (currentStepId: string): string | null => {
  const currentIndex = getStepIndex(currentStepId);
  if (currentIndex === -1 || currentIndex === ONBOARDING_STEPS.length - 1) {
    return null;
  }
  return ONBOARDING_STEPS[currentIndex + 1].id;
};

export const getPreviousStep = (currentStepId: string): string | null => {
  const currentIndex = getStepIndex(currentStepId);
  if (currentIndex <= 0) {
    return null;
  }
  return ONBOARDING_STEPS[currentIndex - 1].id;
};

export const calculateProgress = (steps: OnboardingStep[]): number => {
  const completedSteps = steps.filter(step => step.completed).length;
  return Math.round((completedSteps / steps.length) * 100);
}; 