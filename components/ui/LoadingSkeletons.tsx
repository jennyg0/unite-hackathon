"use client";

import { motion } from "framer-motion";

// Shimmer effect for skeleton loading
const shimmerVariants = {
  animate: {
    x: [-100, 100],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear"
    }
  }
};

export function SkeletonBox({ 
  className = "", 
  height = "h-4", 
  width = "w-full" 
}: {
  className?: string;
  height?: string;
  width?: string;
}) {
  return (
    <div className={`${height} ${width} bg-gray-200 rounded relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        variants={shimmerVariants}
        animate="animate"
      />
    </div>
  );
}

export function BalanceCardSkeleton() {
  return (
    <motion.div 
      className="bg-gradient-to-r from-gray-300 to-gray-200 rounded-xl p-6 md:p-8 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/40 to-white/20"
        animate={{ x: [-200, 400] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <div className="text-center relative z-10">
        <SkeletonBox height="h-4" width="w-24" className="mx-auto mb-4" />
        <SkeletonBox height="h-12" width="w-40" className="mx-auto mb-4" />
        <div className="flex items-center justify-center space-x-4">
          <SkeletonBox height="h-3" width="w-20" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <SkeletonBox height="h-3" width="w-16" />
        </div>
      </div>
    </motion.div>
  );
}

export function TokenBalanceSkeleton() {
  return (
    <motion.div 
      className="flex items-center space-x-3 p-4 bg-white rounded-lg border"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Token icon skeleton */}
      <div className="w-10 h-10 bg-gray-200 rounded-full relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          variants={shimmerVariants}
          animate="animate"
        />
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <SkeletonBox height="h-4" width="w-16" />
          <SkeletonBox height="h-4" width="w-20" />
        </div>
        <div className="flex justify-between items-center">
          <SkeletonBox height="h-3" width="w-12" />
          <SkeletonBox height="h-3" width="w-16" />
        </div>
      </div>
    </motion.div>
  );
}

export function StatsCardSkeleton() {
  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-lg relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            variants={shimmerVariants}
            animate="animate"
          />
        </div>
        <div className="flex-1 space-y-2">
          <SkeletonBox height="h-4" width="w-20" />
          <SkeletonBox height="h-6" width="w-16" />
        </div>
      </div>
    </motion.div>
  );
}

export function ChartSkeleton() {
  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-4">
        <SkeletonBox height="h-5" width="w-32" />
        
        {/* Fake chart bars */}
        <div className="flex items-end space-x-2 h-32">
          {[40, 65, 45, 80, 60, 75, 55].map((height, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gray-200 rounded-t relative overflow-hidden"
              style={{ height: `${height}%` }}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: [-20, 20] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-between">
          {Array.from({ length: 7 }, (_, i) => (
            <SkeletonBox key={i} height="h-3" width="w-8" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function TransactionSkeleton() {
  return (
    <motion.div 
      className="flex items-center space-x-3 p-4 border-b border-gray-100"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-8 h-8 bg-gray-200 rounded-full relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          variants={shimmerVariants}
          animate="animate"
        />
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <SkeletonBox height="h-4" width="w-24" />
          <SkeletonBox height="h-4" width="w-16" />
        </div>
        <SkeletonBox height="h-3" width="w-32" />
      </div>
    </motion.div>
  );
}

export function DepositFormSkeleton() {
  return (
    <motion.div 
      className="card space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header skeleton */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            variants={shimmerVariants}
            animate="animate"
          />
        </div>
        <SkeletonBox height="h-6" width="w-48" className="mx-auto" />
        <SkeletonBox height="h-4" width="w-64" className="mx-auto" />
      </div>
      
      {/* Deposit type buttons skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="p-4 border-2 border-gray-200 rounded-lg space-y-2">
            <div className="w-6 h-6 bg-gray-200 rounded mx-auto relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                variants={shimmerVariants}
                animate="animate"
              />
            </div>
            <SkeletonBox height="h-4" width="w-16" className="mx-auto" />
            <SkeletonBox height="h-3" width="w-12" className="mx-auto" />
          </div>
        ))}
      </div>
      
      {/* Amount input skeleton */}
      <div className="space-y-2">
        <SkeletonBox height="h-4" width="w-24" />
        <SkeletonBox height="h-12" width="w-full" />
      </div>
      
      {/* Projection skeleton */}
      <div className="bg-gray-100 rounded-lg p-4 space-y-2">
        <SkeletonBox height="h-4" width="w-40" />
        <SkeletonBox height="h-3" width="w-56" />
      </div>
      
      {/* Button skeleton */}
      <SkeletonBox height="h-12" width="w-full" />
    </motion.div>
  );
}

// Pulse animation for loading states
export function PulsingDot({ className = "w-2 h-2" }: { className?: string }) {
  return (
    <motion.div
      className={`bg-current rounded-full ${className}`}
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

// Three dots loading animation
export function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-current rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}