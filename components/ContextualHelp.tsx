"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
} from "lucide-react";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  children,
  content,
  position = "top",
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${
              position === "top"
                ? "bottom-full left-1/2 transform -translate-x-1/2 mb-2"
                : position === "bottom"
                ? "top-full left-1/2 transform -translate-x-1/2 mt-2"
                : position === "left"
                ? "right-full top-1/2 transform -translate-y-1/2 mr-2"
                : "left-full top-1/2 transform -translate-y-1/2 ml-2"
            }`}
          >
            {content}
            <div
              className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                position === "top"
                  ? "top-full left-1/2 -translate-x-1/2 -mt-1"
                  : position === "bottom"
                  ? "bottom-full left-1/2 -translate-x-1/2 -mb-1"
                  : position === "left"
                  ? "left-full top-1/2 -translate-y-1/2 -ml-1"
                  : "right-full top-1/2 -translate-y-1/2 -mr-1"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GuidedTourProps {
  steps: {
    id: string;
    title: string;
    content: string;
    target?: string;
  }[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function GuidedTour({
  steps,
  isOpen,
  onClose,
  onComplete,
}: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Quick Tour</h3>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h4>
          <p className="text-gray-600 leading-relaxed">
            {steps[currentStep].content}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button onClick={handleNext} className="btn-primary px-6 py-2">
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Hook for managing help state
export function useHelp() {
  const [showTour, setShowTour] = useState(false);
  const [showTooltips, setShowTooltips] = useState(false);

  const startTour = () => setShowTour(true);
  const stopTour = () => setShowTour(false);
  const toggleTooltips = () => setShowTooltips(!showTooltips);

  return {
    showTour,
    showTooltips,
    startTour,
    stopTour,
    toggleTooltips,
  };
}
