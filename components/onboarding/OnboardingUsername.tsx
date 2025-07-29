"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useENS } from "@/hooks/useENS";
import { useENSRegistration } from "@/hooks/useENSRegistration";

interface OnboardingUsernameProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function OnboardingUsername({
  onNext,
  onBack,
  onSkip,
}: OnboardingUsernameProps) {
  const { user } = usePrivy();
  const { hasENS, ensName: existingENS, setUserENS } = useENS();
  const {
    state: registrationState,
    price,
    checkNameAndPrice,
    startRegistration,
    completeRegistration,
    timeRemaining,
  } = useENSRegistration();

  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);

  // Generate suggested usernames based on wallet address
  useEffect(() => {
    if (user?.wallet?.address) {
      const shortAddress = user.wallet.address.slice(2, 8).toLowerCase();
      setSuggestedNames([
        `saver${shortAddress}`,
        `compound${shortAddress}`,
        `wealth${shortAddress}`,
        `investor${shortAddress}`,
      ]);
    }
  }, [user]);

  // Check username availability
  const checkAvailability = async (name: string) => {
    if (!name || name.length < 3) {
      setError("Username must be at least 3 characters");
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      const available = await checkNameAndPrice(name);
      setIsAvailable(available);

      if (!available) {
        const suggestions = [
          `${name}2024`,
          `${name}_saves`,
          `crypto${name}`,
          `${name}investor`,
        ];
        setError(`@${name} is already taken. Try: ${suggestions.map(s => `@${s}`).join(', ')}`);
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setError("Unable to check username availability. Please try again.");
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Handle username change with debounce
  useEffect(() => {
    if (username.length >= 3) {
      // Clear previous errors while checking
      setError("");
      const timer = setTimeout(() => {
        checkAvailability(username);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsAvailable(null);
      setError("");
    }
  }, [username]);

  // Skip this step if user already has ENS
  useEffect(() => {
    if (hasENS && existingENS) {
      setUserENS(existingENS);
      onNext();
    }
  }, [hasENS, existingENS, onNext]);

  const handleContinue = async () => {
    if (isAvailable && username) {
      await startRegistration(username);
    }
  };

  // Handle registration state changes
  useEffect(() => {
    if (registrationState.step === "complete") {
      setUserENS(username);
      onNext();
    }
  }, [registrationState.step, username, setUserENS, onNext]);

  // Show existing username if they have one
  if (hasENS && existingENS) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="card">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Welcome back, @{existingENS}!
          </h3>
          <p className="text-gray-600">We found your existing username.</p>
          <p className="text-sm text-gray-500 mt-2">Continuing to setup...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Username
        </h2>
        <p className="text-lg text-gray-600">
          Make your account personal - no more ugly addresses
        </p>
      </div>

      <div className="card">
        {/* Benefits */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-900 mb-1">
                Why choose a username?
              </h4>
              <p className="text-sm text-green-700">
                Instead of sharing your long account address, friends can send
                you money using a simple name like @sarah or @investor2024
              </p>
            </div>
          </div>
        </div>

        {/* Username Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Username
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")
                )
              }
              placeholder="yourname"
              className="input-field pl-8 pr-16 text-lg"
            />
            {isChecking && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
            )}
            {isAvailable === true && username && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
            {isAvailable === false && username && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </p>
            </div>
          )}
          
          {/* Success Message */}
          {isAvailable === true && username && !error && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <strong>@{username} is available!</strong> Perfect choice.
              </p>
            </div>
          )}
        </div>

        {/* Suggested Names */}
        {suggestedNames.length > 0 && !username && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              <Sparkles className="inline w-4 h-4 mr-1" />
              Suggested usernames:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setUsername(name)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  @{name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {username && isAvailable && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-50 to-green-50 rounded-lg p-6 mb-6 border border-green-200"
          >
            <h4 className="text-sm font-medium text-green-700 mb-2">
              Your new username:
            </h4>
            <p className="text-2xl font-bold text-green-900">@{username}</p>
            <p className="text-sm text-green-700 mt-2">
              People will be able to send you money using this simple name
            </p>
          </motion.div>
        )}

        {/* Registration Status */}
        {registrationState.step !== "idle" &&
          registrationState.step !== "checking" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              {registrationState.step === "committing" && (
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <div>
                    <p className="font-medium text-blue-900">
                      Setting up your username...
                    </p>
                    <p className="text-sm text-blue-700">
                      Please confirm in your account
                    </p>
                  </div>
                </div>
              )}

              {registrationState.step === "waiting" && (
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <div>
                    <p className="font-medium text-blue-900">Processing...</p>
                    <p className="text-sm text-blue-700">
                      {Math.ceil(timeRemaining / 1000)}s remaining
                    </p>
                  </div>
                </div>
              )}

              {registrationState.step === "complete" && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">
                      Username created!
                    </p>
                    <p className="text-sm text-green-700">
                      You're now @{username}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onSkip}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleContinue}
            disabled={
              !isAvailable ||
              !username ||
              isChecking ||
              registrationState.step === "committing" ||
              registrationState.step === "registering"
            }
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking...</span>
              </>
            ) : registrationState.step === "committing" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
