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
    id: 'ens',
    title: 'Create Your Identity',
    description: 'Choose your ENS name - your unique username on the blockchain',
    required: true,
  },
  {
    id: 'calculator',
    title: 'Calculate Your Financial Freedom',
    description: 'Discover how much you need to save for financial independence',
    required: true,
  },
  {
    id: 'risk-profile',
    title: 'Choose Your Risk Profile',
    description: 'Select a savings strategy that matches your goals and risk tolerance',
    required: true,
  },
  {
    id: 'setup-savings',
    title: 'Set Up Your Savings',
    description: 'Configure your automated savings plan',
    required: false,
  },
  {
    id: 'first-deposit',
    title: 'Make Your First Deposit',
    description: 'Start your journey with your first contribution',
    required: false,
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