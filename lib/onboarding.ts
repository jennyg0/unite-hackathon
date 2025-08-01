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
    monthlyExpenses?: number;
    riskTolerance?: 'low' | 'medium' | 'high';
    preferredStrategy?: 'savings' | 'yield' | 'mixed';
  };
  completed: boolean;
}

export const ONBOARDING_STEPS: Omit<OnboardingStep, 'completed'>[] = [
  {
    id: 'welcome',
    title: 'Welcome to Compound',
    description: 'The savings account that actually beats inflation',
    required: true,
  },
  {
    id: 'username',
    title: 'Choose Your Username',
    description: 'Make your account personal - no more ugly addresses',
    required: true,
  },
  {
    id: 'financial-freedom-education',
    title: 'Financial Freedom 101',
    description: 'Learn the fundamentals that will change your financial future',
    required: false,
  },
  {
    id: 'emergency-fund-education',
    title: 'Emergency Fund Essentials',
    description: 'Build your financial safety net the smart way',
    required: false,
  },
  {
    id: 'start-earning',
    title: 'Start Earning 12% APY',
    description: 'Set up automatic deposits and see projected returns',
    required: true,
  },
  {
    id: 'risk-profile',
    title: 'Optimize Your Returns',
    description: 'Quick question to maximize your earnings (optional)',
    required: false,
  },
  {
    id: 'tour',
    title: 'Quick Tour',
    description: 'See what else you can do (30 seconds)',
    required: false,
  },
  {
    id: 'complete',
    title: 'All Set!',
    description: 'Your money is now growing automatically',
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