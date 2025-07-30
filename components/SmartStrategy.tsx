"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  Brain,
  Zap,
  TrendingUp,
  Target,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Activity,
  Layers,
  Globe,
} from "lucide-react";
import { getOptimalStrategy, scanYieldOpportunities, type SmartStrategy, type YieldOpportunity } from "@/lib/ai-yield-optimizer";

interface SmartStrategyProps {
  amount: number;
  asset: string;
  riskProfile: 'conservative' | 'balanced' | 'aggressive';
  onExecuteStrategy: (strategy: SmartStrategy) => void;
}

export default function SmartStrategy({ amount, asset, riskProfile, onExecuteStrategy }: SmartStrategyProps) {
  const { authenticated } = usePrivy();
  const [strategy, setStrategy] = useState<SmartStrategy | null>(null);
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showOpportunities, setShowOpportunities] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Analysis steps for the loading animation
  const analysisSteps = [
    "🔍 Scanning protocols across 7 chains...",
    "🧠 Applying AI ranking algorithms...",
    "📊 Analyzing historical yield data...",
    "⚡ Optimizing cross-chain execution...",
    "🎯 Finalizing optimal strategy..."
  ];

  // Generate AI strategy
  const generateStrategy = async () => {
    if (!authenticated) return;
    
    setIsLoading(true);
    setAnalysisStep(0);
    
    try {
      // Animate through analysis steps
      for (let i = 0; i < analysisSteps.length; i++) {
        setAnalysisStep(i);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      console.log('🤖 Generating AI strategy...');
      const [strategyResult, opportunitiesResult] = await Promise.all([
        getOptimalStrategy(amount, asset, riskProfile),
        scanYieldOpportunities(asset, amount)
      ]);
      
      setStrategy(strategyResult);
      setOpportunities(opportunitiesResult);
      console.log('✅ AI strategy generated:', strategyResult);
    } catch (error) {
      console.error('❌ Failed to generate strategy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate strategy when params change
  useEffect(() => {
    if (authenticated && amount > 0) {
      generateStrategy();
    }
  }, [authenticated, amount, asset, riskProfile]);

  if (!authenticated) {
    return (
      <div className="card text-center">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          AI Yield Optimizer
        </h3>
        <p className="text-gray-600">
          Connect your wallet to unlock AI-powered yield strategies
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="text-center mb-6">
          <motion.div 
            className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="w-8 h-8 text-purple-600" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            AI Analyzing Markets
          </h3>
          <p className="text-gray-600 mb-4">
            Scanning {opportunities.length || '20+'} protocols across 7 chains
          </p>
        </div>

        {/* Analysis Steps */}
        <div className="space-y-3">
          {analysisSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: index <= analysisStep ? 1 : 0.3,
                x: 0 
              }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                index === analysisStep ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
              }`}
            >
              {index < analysisStep ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : index === analysisStep ? (
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
              )}
              <span className={`text-sm ${
                index <= analysisStep ? 'text-gray-900 font-medium' : 'text-gray-400'
              }`}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-sm text-purple-700">
            <Sparkles className="w-4 h-4" />
            <span>AI is finding opportunities human traders miss...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!strategy) {
    return (
      <div className="card text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Strategy Generation Failed
        </h3>
        <p className="text-gray-600 mb-4">
          Unable to generate optimal strategy. Please try again.
        </p>
        <button
          onClick={generateStrategy}
          className="btn-primary"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Strategy Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card relative overflow-hidden"
      >
        {/* AI Badge */}
        <div className="absolute top-4 right-4">
          <motion.div
            className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium"
            animate={{ 
              boxShadow: [
                "0 0 0 rgba(147, 51, 234, 0.4)",
                "0 0 20px rgba(147, 51, 234, 0.4)",
                "0 0 0 rgba(147, 51, 234, 0.4)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="w-3 h-3" />
            <span>AI OPTIMIZED</span>
          </motion.div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{strategy.name}</h3>
              <p className="text-gray-600">{strategy.description}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <motion.div 
                className="text-2xl font-bold text-green-600"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {strategy.targetApy.toFixed(1)}%
              </motion.div>
              <div className="text-sm text-gray-500">Target APY</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(strategy.confidence * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500">AI Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {strategy.allocations.length}
              </div>
              <div className="text-sm text-gray-500">Protocols</div>
            </div>
          </div>

          {/* Risk Score */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Risk Score</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    strategy.riskScore <= 1.5 ? 'bg-green-500' :
                    strategy.riskScore <= 2.5 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(strategy.riskScore / 3) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <span className="text-sm font-medium">
                {strategy.riskScore.toFixed(1)}/3
              </span>
            </div>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span>AI Reasoning</span>
          </h4>
          <div className="space-y-2">
            {strategy.reasoning.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-sm text-gray-700 flex items-start space-x-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                <span>{reason}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Strategy Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center space-x-2 p-3 text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 rounded-lg"
        >
          <span className="text-sm font-medium">
            {showDetails ? 'Hide Strategy Details' : 'View Strategy Breakdown'}
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </motion.div>

      {/* Strategy Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card overflow-hidden"
          >
            <h4 className="font-semibold text-gray-900 mb-4">Strategy Allocations</h4>
            
            <div className="space-y-3">
              {strategy.allocations.map((allocation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Layers className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {allocation.opportunity.protocol}
                        </div>
                        <div className="text-sm text-gray-500">
                          {allocation.opportunity.chainName} • {allocation.opportunity.asset}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {allocation.opportunity.apy.toFixed(1)}% APY
                      </div>
                      <div className="text-sm text-gray-500">
                        {allocation.percentage.toFixed(1)}% allocation
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {allocation.reason}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Confidence: {(allocation.opportunity.confidence * 100).toFixed(0)}%</span>
                    <span>Risk: {allocation.opportunity.risk}</span>
                    <span>TVL: ${(allocation.opportunity.tvl / 1000000).toFixed(0)}M</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Estimated Gas:</span>
                  <span className="ml-2 font-medium">{parseInt(strategy.estimatedGas).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Execution Time:</span>
                  <span className="ml-2 font-medium">{strategy.estimatedTime} min</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Opportunities */}
      {opportunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <button
            onClick={() => setShowOpportunities(!showOpportunities)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h4 className="font-semibold text-gray-900">
              All Opportunities Found ({opportunities.length})
            </h4>
            {showOpportunities ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          <AnimatePresence>
            {showOpportunities && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {opportunities.slice(0, 10).map((opp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium">{opp.protocol}</div>
                        <div className="text-xs text-gray-500">{opp.chainName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">
                        {opp.apy.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {(opp.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Small Amount Warning */}
      {amount < 10 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-center space-x-2 text-yellow-700 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Small amounts (${amount}) may have limited protocol options. 
              Consider $10+ for optimal diversification.
            </span>
          </div>
        </motion.div>
      )}

      {/* Execute Strategy Button */}
      <motion.button
        onClick={() => onExecuteStrategy(strategy)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-shadow"
      >
        <Zap className="w-5 h-5" />
        <span>Execute AI Strategy (${amount})</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      <p className="text-xs text-gray-500 text-center">
        🤖 Powered by AI • 🔄 Auto-rebalances • ⚡ Cross-chain optimized
      </p>
    </div>
  );
}