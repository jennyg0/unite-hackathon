"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calculator,
  TrendingUp,
  PiggyBank,
  X,
  DollarSign,
  Target,
} from "lucide-react";
import { useOnboarding } from "./OnboardingProvider";

interface FloatingActionButtonProps {
  onAction: (action: string) => void;
}

export function FloatingActionButton({ onAction }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { state: onboardingState } = useOnboarding();

  const actions = [
    {
      id: "calculator",
      label: "Calculate Freedom",
      icon: Calculator,
      color: "blue",
      description: "Update your financial freedom number",
    },
    {
      id: "swap",
      label: "Swap Tokens",
      icon: TrendingUp,
      color: "green",
      description: "Exchange tokens for better yields",
    },
    {
      id: "deposit",
      label: "Make Deposit",
      icon: DollarSign,
      color: "purple",
      description: "Add funds to your savings",
    },
    {
      id: "goals",
      label: "Update Goals",
      icon: Target,
      color: "orange",
      description: "Adjust your savings targets",
    },
  ];

  const handleAction = (actionId: string) => {
    setIsOpen(false);
    onAction(actionId);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 md:bottom-8 right-4 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAction(action.id)}
                    className="flex items-center space-x-3 bg-white rounded-full shadow-lg border border-gray-200 px-4 py-3 hover:shadow-xl transition-all duration-200 group"
                  >
                    <div
                      className={`w-10 h-10 bg-${action.color}-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-200"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
