"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

export function MobileCard({
  children,
  className = "",
  onClick,
  animate = true,
}: MobileCardProps) {
  const baseClasses = `
    bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6
    transition-all duration-200 hover:shadow-md hover:border-gray-300
    ${onClick ? "cursor-pointer active:scale-95" : ""}
    ${className}
  `;

  const content = (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

// Specialized card components for common use cases
export function StatsCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color = "blue",
}: {
  icon: any;
  title: string;
  value: string;
  subtitle?: string;
  color?: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <MobileCard>
      <div className="flex items-center space-x-3">
        <div
          className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-600 truncate">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </MobileCard>
  );
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  color = "blue",
}: {
  icon: any;
  title: string;
  description: string;
  onClick?: () => void;
  color?: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <MobileCard onClick={onClick} animate={false}>
      <div className="flex items-start space-x-3">
        <div
          className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </MobileCard>
  );
}
