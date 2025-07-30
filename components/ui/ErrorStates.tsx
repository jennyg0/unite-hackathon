"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  AlertCircle,
  XCircle,
  CheckCircle,
  Info,
  X
} from "lucide-react";
import { useState } from "react";

interface ErrorStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: "error" | "warning" | "info";
  icon?: React.ReactNode;
  showRetry?: boolean;
}

export function ErrorState({ 
  title, 
  message, 
  actionLabel = "Try Again", 
  onAction,
  type = "error",
  icon,
  showRetry = true
}: ErrorStateProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onAction && !isRetrying) {
      setIsRetrying(true);
      try {
        await onAction();
      } finally {
        setTimeout(() => setIsRetrying(false), 1000);
      }
    }
  };

  const getColors = () => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          icon: "text-yellow-600",
          button: "bg-yellow-600 hover:bg-yellow-700"
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200", 
          icon: "text-blue-600",
          button: "bg-blue-600 hover:bg-blue-700"
        };
      default:
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "text-red-600", 
          button: "bg-red-600 hover:bg-red-700"
        };
    }
  };

  const colors = getColors();
  const defaultIcon = type === "warning" ? AlertTriangle : type === "info" ? Info : XCircle;

  return (
    <motion.div 
      className={`card ${colors.bg} ${colors.border} text-center`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4`}
        animate={type === "error" ? {
          x: [0, -2, 2, -1, 1, 0],
          rotate: [0, -2, 2, -1, 1, 0]
        } : {}}
        transition={{ duration: 0.6 }}
      >
        {icon || React.createElement(defaultIcon, { 
          className: `w-8 h-8 ${colors.icon}` 
        })}
      </motion.div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-4">
        {message}
      </p>
      
      {showRetry && (
        <motion.button
          onClick={handleRetry}
          disabled={isRetrying}
          className={`${colors.button} text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying...' : actionLabel}</span>
        </motion.button>
      )}
    </motion.div>
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Connection Lost"
      message="Unable to connect to the network. Please check your internet connection and try again."
      actionLabel="Reconnect"
      onAction={onRetry}
      type="warning"
      icon={<WifiOff className="w-8 h-8 text-yellow-600" />}
    />
  );
}

export function APIError({ 
  onRetry, 
  service = "service" 
}: { 
  onRetry?: () => void;
  service?: string;
}) {
  return (
    <ErrorState
      title="Service Unavailable"
      message={`The ${service} is temporarily unavailable. This might be due to maintenance or high traffic.`}
      actionLabel="Retry"
      onAction={onRetry}
      type="error"
    />
  );
}

export function InlineError({ 
  message, 
  onDismiss 
}: { 
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <motion.div
      className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
      <span className="text-red-700 flex-1">{message}</span>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

export function SuccessMessage({ 
  message, 
  onDismiss,
  autoClose = true 
}: { 
  message: string;
  onDismiss?: () => void;
  autoClose?: boolean;
}) {
  useState(() => {
    if (autoClose && onDismiss) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  });

  return (
    <motion.div
      className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
      <span className="text-green-700 flex-1">{message}</span>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="text-green-600 hover:text-green-800"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

// Toast notification system
interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

export function ToastNotification({ 
  toast, 
  onDismiss 
}: { 
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const getToastColors = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-red-50 border-red-200 text-red-800";
    }
  };

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <motion.div
      className={`p-4 rounded-lg border shadow-lg ${getToastColors(toast.type)} max-w-sm`}
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon(toast.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm opacity-90 mt-1">{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Empty state component
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-16 h-16 mx-auto mb-4 text-gray-300"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {message}
      </p>
      {actionLabel && onAction && (
        <motion.button
          onClick={onAction}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}