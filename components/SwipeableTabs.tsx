"use client";

import { useState, useRef, useEffect } from "react";
import { motion, PanInfo } from "framer-motion";
import { ReactNode } from "react";

interface SwipeableTabsProps {
  tabs: {
    id: string;
    label: string;
    content: ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SwipeableTabs({
  tabs,
  activeTab,
  onTabChange,
}: SwipeableTabsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);

    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0 && activeIndex > 0) {
        // Swipe right - go to previous tab
        onTabChange(tabs[activeIndex - 1].id);
      } else if (info.offset.x < 0 && activeIndex < tabs.length - 1) {
        // Swipe left - go to next tab
        onTabChange(tabs[activeIndex + 1].id);
      }
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Prevent scrolling when dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDragging]);

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Tab Indicators */}
      <div className="flex justify-center space-x-2 mb-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              tab.id === activeTab
                ? "bg-blue-600 w-6"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* Swipeable Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="cursor-grab active:cursor-grabbing"
        style={{ touchAction: "pan-y" }}
      >
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px]"
        >
          {tabs.find((tab) => tab.id === activeTab)?.content}
        </motion.div>
      </motion.div>

      {/* Swipe Hint (only on mobile) */}
      <div className="md:hidden text-center mt-4">
        <p className="text-xs text-gray-500">Swipe left or right to navigate</p>
      </div>
    </div>
  );
}
