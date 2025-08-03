"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Gift, Star } from "lucide-react";

export interface ToastProps {
  id: string;
  type: "success" | "info" | "warning" | "error" | "nft";
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastComponentProps extends ToastProps {
  onClose: (id: string) => void;
}

function ToastComponent({ id, type, title, description, duration = 5000, action, onClose }: ToastComponentProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>;
      case "nft":
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">i</span>
        </div>;
      case "warning":
        return <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">!</span>
        </div>;
      case "error":
        return <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✕</span>
        </div>;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "nft":
        return "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`relative w-full max-w-sm ${getBgColor()} border rounded-lg shadow-lg p-4`}
    >
      {/* NFT sparkle effects for NFT toasts */}
      {type === "nft" && (
        <>
          <div className="absolute -top-1 -left-1">
            <Star className="w-3 h-3 text-yellow-400 animate-pulse" fill="currentColor" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Star className="w-3 h-3 text-orange-400 animate-pulse" fill="currentColor" style={{ animationDelay: "0.5s" }} />
          </div>
        </>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">
            {title}
            {type === "nft" && <Gift className="inline w-4 h-4 ml-1 text-yellow-500" />}
          </h4>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
          
          {/* Action button */}
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-sm font-medium ${
                type === "nft" 
                  ? "text-yellow-600 hover:text-yellow-700" 
                  : "text-blue-600 hover:text-blue-700"
              } transition-colors`}
            >
              {action.label} →
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
}

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[];
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            {...toast}
            onClose={onRemoveToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showNFTToast = (nftName: string, onViewAchievements?: () => void) => {
    addToast({
      type: "nft",
      title: "🎉 Achievement Unlocked!",
      description: `You earned the "${nftName}" NFT! Claim it on your achievements page.`,
      duration: 8000, // Longer duration for NFT toasts
      action: onViewAchievements ? {
        label: "View Achievements",
        onClick: onViewAchievements,
      } : undefined,
    });
  };

  const showSuccessToast = (title: string, description?: string) => {
    addToast({
      type: "success",
      title,
      description,
    });
  };

  const showErrorToast = (title: string, description?: string) => {
    addToast({
      type: "error",
      title,
      description,
    });
  };

  return {
    toasts,
    addToast,
    removeToast,
    showNFTToast,
    showSuccessToast,
    showErrorToast,
  };
}