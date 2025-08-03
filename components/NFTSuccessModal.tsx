"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

interface NFTSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  nftName: string;
  transactionHash: string;
  chainId?: number;
}

export function NFTSuccessModal({
  isOpen,
  onClose,
  nftName,
  transactionHash,
  chainId = 100, // Default to Gnosis
}: NFTSuccessModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Trigger confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
      });

      // Secondary burst after delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10B981', '#3B82F6', '#F59E0B'],
        });
      }, 200);

      // Stars effect
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 100,
          origin: { y: 0.5 },
          shapes: ['star'],
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        });
      }, 400);
    }
  }, [isOpen]);

  const getExplorerUrl = (hash: string, chainId: number) => {
    const explorers: Record<number, string> = {
      100: 'https://gnosisscan.io', // Gnosis
      137: 'https://polygonscan.com', // Polygon
      1: 'https://etherscan.io', // Ethereum
    };
    
    const baseUrl = explorers[chainId] || 'https://gnosisscan.io';
    return `${baseUrl}/tx/${hash}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Success content */}
              <div className="text-center">
                {/* Trophy icon with glow effect */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg"
                  style={{
                    boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)',
                  }}
                >
                  <Trophy className="w-10 h-10 text-white" />
                </motion.div>

                {/* Success message */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  🎉 Achievement Unlocked!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-gray-700 mb-1"
                >
                  Your <span className="font-semibold text-blue-600">{nftName}</span> NFT
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-gray-700 mb-6"
                >
                  has been minted successfully! ✨
                </motion.p>

                {/* Transaction hash (collapsed by default) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-6"
                >
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2"
                  >
                    {showDetails ? '▼' : '▶'} Transaction Details
                  </button>
                  
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono break-all text-gray-600">
                          {transactionHash}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <a
                    href={getExplorerUrl(transactionHash, chainId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Explorer
                  </a>
                  
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Continue
                  </button>
                </motion.div>

                {/* Footer note */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-xs text-gray-500 mt-4"
                >
                  Check your wallet or OpenSea to see your new NFT!
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}