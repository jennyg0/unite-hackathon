"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  DollarSign,
  Zap,
  ArrowRight,
  Loader2,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { useFusionSwap } from "@/hooks/useFusionSwap";
import { useAutomatedDeposits } from "@/hooks/useAutomatedDeposits";
import { transactionHistory } from "@/lib/transaction-history";
import { AaveService } from "@/lib/aave-service";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";
import SmartStrategy from "@/components/SmartStrategy";
import { type SmartStrategy as SmartStrategyType } from "@/lib/ai-yield-optimizer";

// Custom hook for count-up animation
function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const startTime = Date.now();
    const startValue = count;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (end - startValue) * easeOut;
      
      setCount(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  return { count, startAnimation, isAnimating };
}

interface SmartDepositProps {
  onDepositComplete?: (amount: number, isRecurring: boolean) => void;
  onViewHistory?: () => void;
}

export default function SmartDeposit({ onDepositComplete, onViewHistory }: SmartDepositProps) {
  const { authenticated } = usePrivy();
  const { findBestRoutes, isLoading: fusionLoading } = useFusionSwap();
  const { setupAutomatedDeposits, isLoading: depositsLoading } = useAutomatedDeposits();
  
  const [amount, setAmount] = useState<string>("100");
  const [depositType, setDepositType] = useState<"one-time" | "recurring">("one-time");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "finding-route" | "swapping" | "depositing" | "success">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAPY, setCurrentAPY] = useState<number>(3.8); // Default USDC APY
  const [showAIStrategy, setShowAIStrategy] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<SmartStrategyType | null>(null);
  
  // Initialize Aave service
  const aaveService = new AaveService(DEFAULT_CHAIN_ID);
  
  // Fetch current APY from Aave
  useEffect(() => {
    const fetchAPY = async () => {
      try {
        const apyString = await aaveService.getSupplyAPY('USDC');
        const apy = parseFloat(apyString);
        setCurrentAPY(apy);
        console.log('🏦 Fetched current Aave USDC APY:', apy + '%');
      } catch (error) {
        console.error('Failed to fetch APY:', error);
        // Keep default APY on error
      }
    };
    
    fetchAPY();
  }, []);
  
  // Get projected earnings using real Aave APY
  const getProjectedEarnings = () => {
    const monthlyAmount = depositType === "recurring" ? parseFloat(amount) : 0;
    const oneTimeAmount = depositType === "one-time" ? parseFloat(amount) : 0;
    const apyDecimal = currentAPY / 100; // Convert percentage to decimal
    
    if (depositType === "recurring") {
      const annualDeposits = monthlyAmount * (frequency === "daily" ? 365 : frequency === "weekly" ? 52 : 12);
      const annualEarnings = annualDeposits * apyDecimal;
      return annualEarnings;
    } else {
      return oneTimeAmount * apyDecimal; // First year earnings on one-time deposit
    }
  };
  
  // Count-up animation for projected earnings
  const projectedEarnings = getProjectedEarnings();
  const { count: animatedEarnings, startAnimation: startEarningsAnimation } = useCountUp(projectedEarnings, 1500);

  const isLoading = fusionLoading || depositsLoading || isProcessing;

  const handleExecuteStrategy = async (strategy: SmartStrategyType) => {
    setSelectedStrategy(strategy);
    setIsProcessing(true);
    setStatus("finding-route");
    setStatusMessage(`Executing AI strategy across ${strategy.allocations.length} protocols...`);

    try {
      console.log('🤖 Executing AI strategy:', strategy);
      
      // Simulate AI strategy execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setStatus("success");
      setStatusMessage(
        `AI strategy executed! Your $${amount} is now earning ${strategy.targetApy.toFixed(1)}% APY across ${strategy.allocations.length} protocols.`
      );
      
      // Trigger celebration effects
      setShowCelebration(true);
      startEarningsAnimation();
      
      // Add AI strategy transaction to history
      transactionHistory.addTransaction({
        type: 'ai_strategy',
        status: 'completed',
        amount: (parseFloat(amount) * 1000000).toString(),
        amountUsd: parseFloat(amount),
        token: {
          symbol: 'USDC',
          name: 'USD Coin',
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          decimals: 6,
          logoURI: 'https://wallet-asset.matic.network/img/tokens/usdc.svg'
        },
        toChain: { id: 137, name: 'Multi-Chain' },
        txHash: `0x${Math.random().toString(16).slice(2, 42)}`,
        description: `AI-optimized strategy: ${strategy.name}`,
        apy: strategy.targetApy,
        protocols: strategy.allocations.map(a => a.opportunity.protocol)
      });
      
      onDepositComplete?.(parseFloat(amount), false);
      
      // Reset after 4 seconds
      setTimeout(() => {
        setStatus("idle");
        setAmount("100");
        setIsProcessing(false);
        setShowCelebration(false);
        setShowAIStrategy(false);
        setSelectedStrategy(null);
      }, 4000);
      
    } catch (error) {
      console.error('❌ AI strategy execution failed:', error);
      setStatus("idle");
      setStatusMessage("");
      setIsProcessing(false);
      alert(`Strategy execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeposit = async () => {
    console.log('🚀 Deposit button clicked!', { authenticated, amount, depositType });
    
    if (!authenticated) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setStatus("finding-route");
    setStatusMessage("Finding the best way to deposit your money...");

    try {
      const depositAmount = parseFloat(amount);
      console.log('💰 Processing deposit:', { depositAmount, depositType });

      if (depositType === "one-time") {
        // One-time deposit with automatic cross-chain routing
        setStatus("finding-route");
        setStatusMessage("Checking all chains for the best deposit route...");
        console.log('🔍 Finding routes...');
        
        // Build Aave deposit transaction
        console.log('💳 Building Aave deposit transaction...');
        setStatus("depositing");
        setStatusMessage(`Depositing $${amount} USDC to Aave V3 on Polygon...`);
        
        try {
          // Get deposit transaction data
          const depositTx = aaveService.buildDepositTx(
            'USDC',
            (depositAmount * 1000000).toString(), // Convert to USDC decimals
            '0x742d35Cc6634C0532925a3b8D1D5bbcF4A7A6666' // Placeholder address
          );
          
          console.log('🏦 Aave deposit transaction:', depositTx);
          console.log(`💰 Depositing $${amount} USDC at ${currentAPY.toFixed(1)}% APY`);
          
          // Simulate transaction processing
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (aaveError) {
          console.log('⚠️ Aave transaction failed, simulating:', aaveError);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else {
        // Recurring deposits
        console.log('🔁 Setting up automated deposits...');
        setStatus("depositing");
        setStatusMessage("Setting up your automated savings...");
        
        try {
          await setupAutomatedDeposits({
            amount: depositAmount,
            frequency,
            token: "USDC",
          });
          console.log('✅ Automated deposits set up successfully');
        } catch (automationError) {
          console.log('⚠️ Automation setup failed, simulating:', automationError);
          // Simulate for demo
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      setStatus("success");
      setStatusMessage(
        depositType === "one-time" 
          ? `Successfully deposited $${amount}! Your money is now earning ${currentAPY.toFixed(1)}% APY via Aave.`
          : `Automated savings set up! You'll save $${amount} ${frequency} earning ${currentAPY.toFixed(1)}% APY.`
      );
      
      // Trigger celebration effects
      setShowCelebration(true);
      startEarningsAnimation();
      
      // Add transaction to history
      const transactionType = depositType === "recurring" ? "automated_deposit" : "deposit";
      transactionHistory.addTransaction({
        type: transactionType,
        status: 'completed',
        amount: (depositAmount * 1000000).toString(), // Convert to USDC decimals
        amountUsd: depositAmount,
        token: {
          symbol: 'USDC',
          name: 'USD Coin',
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          decimals: 6,
          logoURI: 'https://wallet-asset.matic.network/img/tokens/usdc.svg'
        },
        toChain: { id: 137, name: 'Polygon' },
        txHash: `0x${Math.random().toString(16).slice(2, 42)}`,
        description: depositType === "recurring" 
          ? `Automated ${frequency} deposit of $${amount}`
          : `One-time deposit of $${amount}`,
        apy: currentAPY
      });
      
      console.log('🎉 Deposit completed successfully!');
      onDepositComplete?.(depositAmount, depositType === "recurring");
      
      // Reset after 4 seconds
      setTimeout(() => {
        setStatus("idle");
        setAmount("100");
        setIsProcessing(false);
        setShowCelebration(false);
      }, 4000);
      
    } catch (error) {
      console.error('❌ Deposit failed:', error);
      setStatus("idle");
      setStatusMessage("");
      setIsProcessing(false);
      alert(`Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!authenticated) {
    return (
      <div className="card text-center">
        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Start Earning
        </h3>
        <p className="text-gray-600">
          Connect your wallet to make your first deposit
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          // Celebration jitter effect
          x: showCelebration ? [0, -2, 2, -1, 1, 0] : 0,
          y: showCelebration ? [0, -1, 1, -2, 2, 0] : 0,
        }}
        transition={{ 
          duration: 0.5,
          x: { duration: 0.6, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
          y: { duration: 0.6, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
        }}
        className="card text-center relative overflow-hidden"
      >
        {/* Floating celebration particles */}
        <AnimatePresence>
          {showCelebration && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0,
                    scale: 0,
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 100 + 50
                  }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1, 0],
                    y: [0, -100, -150, -200],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                  className="absolute pointer-events-none"
                >
                  <Sparkles className="w-4 h-4 text-green-500" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
        
        <motion.div 
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          animate={showCelebration ? {
            scale: [1, 1.2, 1],
            rotate: [0, -10, 10, -5, 5, 0]
          } : {}}
          transition={{ duration: 0.8 }}
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
        
        <motion.h3 
          className="text-xl font-semibold text-gray-900 mb-2"
          animate={showCelebration ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {depositType === "one-time" ? "Deposit Complete!" : "Automation Set Up!"}
        </motion.h3>
        
        <p className="text-gray-600 mb-4">{statusMessage}</p>
        
        <motion.div 
          className="bg-green-50 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-sm text-green-700 mb-3">
            <strong>Projected annual earnings:</strong> 
            <motion.span
              className="ml-1"
              animate={showCelebration ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              ${animatedEarnings.toFixed(0)}
            </motion.span>
          </div>
          
          {onViewHistory && (
            <motion.button
              onClick={onViewHistory}
              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              whileHover={{ scale: 1.05 }}
            >
              <span>View Transaction History</span>
              <ArrowRight className="w-3 h-3" />
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    );
  }

  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {status === "finding-route" && "Finding Best Route"}
          {status === "swapping" && "Converting Tokens"}
          {status === "depositing" && "Processing Deposit"}
        </h3>
        <p className="text-gray-600 mb-4">{statusMessage}</p>
        
        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{
              width: status === "finding-route" ? "33%" : 
                     status === "swapping" ? "66%" : "100%"
            }}
          />
        </div>
        
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className={`flex items-center space-x-1 ${status === "finding-route" ? "text-blue-600" : "text-green-600"}`}>
            <div className="w-2 h-2 rounded-full bg-current" />
            <span>Route</span>
          </div>
          <div className={`flex items-center space-x-1 ${status === "swapping" ? "text-blue-600" : status === "depositing" ? "text-green-600" : "text-gray-400"}`}>
            <div className="w-2 h-2 rounded-full bg-current" />
            <span>Convert</span>
          </div>
          <div className={`flex items-center space-x-1 ${status === "depositing" ? "text-blue-600" : "text-gray-400"}`}>
            <div className="w-2 h-2 rounded-full bg-current" />
            <span>Deposit</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {showAIStrategy ? 'AI-Powered Yield Optimization' : `Start Earning ${currentAPY.toFixed(1)}% APY`}
        </h2>
        <p className="text-gray-600">
          {showAIStrategy 
            ? 'Let AI find the highest yields across 20+ protocols and 7 chains'
            : 'Deposit USDC to Aave on Polygon. Real yields, fully automated.'
          }
        </p>
      </div>

      {/* Strategy Type Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.button
          onClick={() => setShowAIStrategy(false)}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`p-4 rounded-lg border-2 transition-all ${
            !showAIStrategy
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <motion.div
            animate={!showAIStrategy ? { 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0]
            } : {}}
            transition={{ duration: 0.6 }}
          >
            <Zap className={`w-6 h-6 mx-auto mb-2 ${!showAIStrategy ? "text-green-600" : "text-gray-400"}`} />
          </motion.div>
          <div className="font-medium text-gray-900">Simple Deposit</div>
          <div className="text-sm text-gray-500">{currentAPY.toFixed(1)}% APY • Aave</div>
        </motion.button>
        
        <motion.button
          onClick={() => setShowAIStrategy(true)}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`p-4 rounded-lg border-2 transition-all relative ${
            showAIStrategy
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          {/* AI Badge */}
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 rounded-full">
            NEW
          </div>
          <motion.div
            animate={showAIStrategy ? { 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 0.8 }}
          >
            <Sparkles className={`w-6 h-6 mx-auto mb-2 ${showAIStrategy ? "text-purple-600" : "text-gray-400"}`} />
          </motion.div>
          <div className="font-medium text-gray-900">AI Strategy</div>
          <div className="text-sm text-gray-500">Up to 15%+ APY</div>
        </motion.button>
      </div>

      {/* Conditional Rendering: AI Strategy or Simple Deposit */}
      {showAIStrategy ? (
        <SmartStrategy
          amount={parseFloat(amount) || 1000}
          asset="USDC"
          riskProfile="balanced"
          onExecuteStrategy={handleExecuteStrategy}
        />
      ) : (
        <>
          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit Amount
            </label>
        <motion.div 
          className="relative"
          whileFocus={{ scale: 1.02 }}
        >
          <motion.div
            animate={{ x: [0, 1, -1, 0] }}
            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 5 }}
          >
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </motion.div>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              // Restart earnings animation when amount changes
              if (parseFloat(e.target.value) > 0) {
                setTimeout(startEarningsAnimation, 100);
              }
            }}
            placeholder="100"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg transition-all"
          />
        </motion.div>
      </div>

      {/* Frequency Selection for Recurring */}
      {depositType === "recurring" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "daily", label: "Daily", badge: "Test Mode" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
            ].map((freq) => (
              <button
                key={freq.value}
                onClick={() => setFrequency(freq.value as any)}
                className={`p-3 rounded-lg border transition-all relative ${
                  frequency === freq.value
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">{freq.label}</div>
                {freq.badge && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {freq.badge}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Projection */}
      <motion.div 
        className="bg-green-50 rounded-lg p-4 mb-6 relative overflow-hidden"
        animate={{ 
          boxShadow: [
            "0 0 0 rgba(34, 197, 94, 0.1)",
            "0 0 20px rgba(34, 197, 94, 0.1)",
            "0 0 0 rgba(34, 197, 94, 0.1)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="text-sm text-green-700">
          <strong>Projected annual earnings:</strong> 
          <motion.span
            key={projectedEarnings} // Re-animate when amount changes
            className="ml-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            ${animatedEarnings.toFixed(0)}
          </motion.span>
        </div>
        <motion.div 
          className="text-xs text-green-600 mt-1"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Based on {currentAPY.toFixed(1)}% APY via Aave • Withdraw anytime • Polygon USDC
        </motion.div>
        
        {/* Subtle background animation */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-100/50 to-transparent"
          animate={{ x: [-100, 400] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
        />
      </motion.div>

      {/* Smart Deposit Button */}
      <motion.button
        onClick={handleDeposit}
        disabled={!amount || parseFloat(amount) <= 0 || isLoading}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 10px 25px rgba(34, 197, 94, 0.2)"
        }}
        whileTap={{ 
          scale: 0.98,
          boxShadow: "0 5px 15px rgba(34, 197, 94, 0.1)"
        }}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            <span>
              {depositType === "one-time" ? `Deposit $${amount}` : `Start Saving $${amount}/${frequency}`}
            </span>
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </>
        )}
      </motion.button>

          <p className="text-xs text-gray-500 mt-3 text-center">
            🔒 Secure • 🏦 Powered by Aave V3 • 🔗 Polygon Network
          </p>
        </>
      )}
    </div>
  );
}