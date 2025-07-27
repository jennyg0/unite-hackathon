"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 ${className}`}
    >
      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        {icon}
      </div>

      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>

      <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && (
          <button
            onClick={action.onClick}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              action.variant === "secondary" ? "btn-secondary" : "btn-primary"
            }`}
          >
            {action.label}
          </button>
        )}

        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Predefined empty states for common scenarios
export function PortfolioEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        </div>
      }
      title="No investments yet"
      description="Start building your portfolio by making your first deposit or swapping tokens to get better yields."
      action={{
        label: "Make First Deposit",
        onClick: onAction,
        variant: "primary",
      }}
      secondaryAction={{
        label: "Learn about DeFi",
        onClick: () => {},
      }}
    />
  );
}

export function ActivityEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
      }
      title="No recent activity"
      description="Your transaction history will appear here once you start using the app. Begin your journey to financial freedom!"
      action={{
        label: "Calculate Financial Freedom",
        onClick: onAction,
        variant: "primary",
      }}
    />
  );
}

export function CalculatorEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
      }
      title="Ready to calculate?"
      description="Enter your financial information to discover your path to financial freedom using the proven 4% rule."
      action={{
        label: "Start Calculation",
        onClick: onAction,
        variant: "primary",
      }}
    />
  );
}

export function SwapEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </div>
      }
      title="Ready to swap?"
      description="Get the best rates across all DEXs using 1inch aggregation. Start by selecting your tokens and amount."
      action={{
        label: "Start Swapping",
        onClick: onAction,
        variant: "primary",
      }}
      secondaryAction={{
        label: "View supported tokens",
        onClick: () => {},
      }}
    />
  );
}
