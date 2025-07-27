"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  Sparkles,
  Search,
} from "lucide-react";

interface OnboardingENSProps {
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingENS({ onNext, onBack }: OnboardingENSProps) {
  const { user } = usePrivy();
  const [ensName, setEnsName] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);

  // Generate suggested names based on wallet address
  useEffect(() => {
    if (user?.wallet?.address) {
      const shortAddress = user.wallet.address.slice(2, 8).toLowerCase();
      setSuggestedNames([
        `saver${shortAddress}`,
        `defi${shortAddress}`,
        `freedom${shortAddress}`,
        `wealth${shortAddress}`,
        `crypto${shortAddress}`,
      ]);
    }
  }, [user]);

  // Check ENS availability (mock for now)
  const checkAvailability = async (name: string) => {
    if (!name || name.length < 3) {
      setError("ENS name must be at least 3 characters");
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    setError("");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock availability check - in production, this would check ENS registry
    const mockTakenNames = ["vitalik", "ethereum", "defi", "crypto", "money"];
    const isNameAvailable = !mockTakenNames.includes(name.toLowerCase());

    setIsAvailable(isNameAvailable);
    setIsChecking(false);

    if (!isNameAvailable) {
      setError(`${name}.eth is already taken`);
    }
  };

  // Handle name change with debounce
  useEffect(() => {
    if (ensName.length >= 3) {
      const timer = setTimeout(() => {
        checkAvailability(ensName);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsAvailable(null);
      setError("");
    }
  }, [ensName]);

  const handleContinue = () => {
    if (isAvailable && ensName) {
      // In production, this would initiate ENS registration
      // For now, we'll just store it and move forward
      localStorage.setItem("userENSName", ensName);
      onNext();
    }
  };

  const handleSkip = () => {
    // Allow users to skip ENS for now
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Create Your Identity
        </h2>
        <p className="text-lg text-gray-600">
          Choose your ENS name - your unique username on the blockchain
        </p>
      </div>

      <div className="card">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">What is ENS?</h4>
              <p className="text-sm text-blue-700">
                ENS (Ethereum Name Service) is like a username for your wallet.
                Instead of sharing your long wallet address, you can use a
                simple name like "yourname.eth"
              </p>
            </div>
          </div>
        </div>

        {/* ENS Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose your ENS name
          </label>
          <div className="relative">
            <input
              type="text"
              value={ensName}
              onChange={(e) =>
                setEnsName(
                  e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")
                )
              }
              placeholder="yourname"
              className="input-field pr-20 text-lg"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              .eth
            </span>
            {isChecking && (
              <Loader2 className="absolute right-20 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
            )}
            {isAvailable === true && ensName && (
              <CheckCircle className="absolute right-20 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
            {isAvailable === false && ensName && (
              <AlertCircle className="absolute right-20 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
            )}
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {isAvailable === true && ensName && (
            <p className="mt-2 text-sm text-green-600">
              <CheckCircle className="inline w-4 h-4 mr-1" />
              {ensName}.eth is available!
            </p>
          )}
        </div>

        {/* Suggested Names */}
        {suggestedNames.length > 0 && !ensName && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              <Sparkles className="inline w-4 h-4 mr-1" />
              Suggested names based on your wallet:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setEnsName(name)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  {name}.eth
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {ensName && isAvailable && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6"
          >
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Your new identity:
            </h4>
            <p className="text-2xl font-bold text-gray-900">{ensName}.eth</p>
            <p className="text-sm text-gray-600 mt-2">
              People can send you money using this name instead of your wallet
              address
            </p>
          </motion.div>
        )}

        {/* Cost Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Registration Cost
            </span>
            <span className="text-sm font-semibold text-gray-900">
              ~$5-20 USD
            </span>
          </div>
          <p className="text-xs text-gray-600">
            ENS names require a yearly fee. Shorter names cost more.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleContinue}
            disabled={!isAvailable || !ensName || isChecking}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "Continue with ENS"
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showInfo ? "Hide" : "Learn more"} about ENS
          </button>
        </div>

        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 space-y-3 text-sm text-gray-600"
          >
            <p>
              <strong>Benefits of ENS:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Easy to remember and share</li>
              <li>Works across all Ethereum-compatible chains</li>
              <li>Can receive any cryptocurrency or NFT</li>
              <li>Decentralized - you own your name</li>
              <li>Can set up subdomains (like email.yourname.eth)</li>
            </ul>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
