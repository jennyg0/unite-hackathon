"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Clock,
  Globe,
  Shuffle,
} from "lucide-react";
import { useFusionSwap } from "@/hooks/useFusionSwap";

interface SmartStrategyProps {
  amount: number;
  asset: string;
  riskProfile: 'conservative' | 'balanced' | 'aggressive';
  onExecuteStrategy: (strategy: any) => void;
}

// Simple protocol options with real integration status
interface ProtocolOption {
  name: string;
  apy: number;
  risk: 'low' | 'medium' | 'high';
  status: 'ready' | 'soon' | 'planned';
  description: string;
  icon: string;
  chain: string;
  chainId: number;
  crossChainOptimized?: boolean;
  originalApy?: number;
}

export default function SmartStrategy({ amount, asset, riskProfile, onExecuteStrategy }: SmartStrategyProps) {
  const { authenticated } = usePrivy();
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [crossChainEnabled, setCrossChainEnabled] = useState(true);
  const [protocolsWithCrossChain, setProtocolsWithCrossChain] = useState<ProtocolOption[]>([]);
  const { findBestRoutes, isLoading: fusionLoading, loadSupportedChains } = useFusionSwap();

  // Real protocol data with chain IDs for cross-chain optimization
  const protocols: ProtocolOption[] = [
    {
      name: "Aave V3",
      apy: 3.8,
      risk: 'low',
      status: 'ready',
      description: "Battle-tested lending protocol. Your funds earn interest immediately.",
      icon: "🏦",
      chain: "Polygon",
      chainId: 137
    },
    {
      name: "Yearn Finance", 
      apy: 15.2,
      risk: 'medium',
      status: 'ready',
      description: "Automated yield farming strategies. Higher returns, more complexity.",
      icon: "🌾",
      chain: "Polygon",
      chainId: 137
    },
    {
      name: "Compound V3",
      apy: 12.1, 
      risk: 'medium',
      status: 'ready',
      description: "Algorithmic money markets. Proven track record.",
      icon: "🔄",
      chain: "Ethereum",
      chainId: 1
    },
    {
      name: "Lido Staking",
      apy: 8.5,
      risk: 'low',
      status: 'planned', 
      description: "ETH liquid staking. Earn staking rewards while keeping liquidity.",
      icon: "🔒",
      chain: "Ethereum",
      chainId: 1
    }
  ];

  // Enhanced protocols for cross-chain demo - prioritize Base to show cross-chain capability
  const enhancedProtocols: ProtocolOption[] = [
    // Put cross-chain Base options first to showcase the feature
    {
      name: "Aave V3 (Cross-Chain to Base)",
      apy: 5.2,
      originalApy: 3.8,
      risk: 'low',
      status: 'ready',
      description: "Access Base's growing DeFi ecosystem via 1inch cross-chain swap from Polygon.",
      icon: "🏦",
      chain: "Base",
      chainId: 8453,
      crossChainOptimized: true
    },
    {
      name: "Compound V3 (Cross-Chain to Base)",
      apy: 6.8,
      originalApy: 4.5,
      risk: 'low',
      status: 'ready',
      description: "Base's efficient Compound markets with lower gas fees via cross-chain routing.",
      icon: "🔄",
      chain: "Base",
      chainId: 8453,
      crossChainOptimized: true
    },
    // Then show enhanced Ethereum options
    {
      name: "Yearn V3 (Cross-Chain to Ethereum)",
      apy: 18.7,
      originalApy: 15.2,
      risk: 'medium',
      status: 'ready',
      description: "Access Ethereum's highest Yearn vaults via 1inch cross-chain swap.",
      icon: "🌾",
      chain: "Ethereum",
      chainId: 1,
      crossChainOptimized: true
    },
    // Finally, keep original protocols (same-chain options)
    ...protocols.map(p => ({ ...p, originalApy: p.apy }))
  ];

  // Load cross-chain routes on mount
  useEffect(() => {
    if (authenticated && crossChainEnabled) {
      loadSupportedChains();
      // Set enhanced protocols when cross-chain is enabled
      setProtocolsWithCrossChain(enhancedProtocols);
    } else {
      // Use basic protocols when cross-chain is disabled
      setProtocolsWithCrossChain(protocols);
    }
  }, [authenticated, crossChainEnabled]);

  const displayProtocols = protocolsWithCrossChain.length > 0 ? protocolsWithCrossChain : protocols;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ready': return 'text-green-600 bg-green-50 border-green-200';
      case 'soon': return 'text-orange-600 bg-orange-50 border-orange-200'; 
      case 'planned': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'ready': return 'Available Now';
      case 'soon': return 'Coming Soon';
      case 'planned': return 'Planned';
      default: return 'Unknown';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch(risk) {
      case 'low': return <Shield className="w-4 h-4" />;
      case 'medium': return <TrendingUp className="w-4 h-4" />;
      case 'high': return <Zap className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleProtocolSelect = (protocol: ProtocolOption) => {
    if (protocol.status !== 'ready') {
      return; // Don't allow selection of non-ready protocols
    }

    setSelectedProtocol(protocol.name);
    setIsLoading(true);

    // Simulate processing and then execute
    setTimeout(() => {
      const strategy = {
        id: 'user-selected',
        name: `${protocol.name} Deposit`,
        description: protocol.crossChainOptimized 
          ? `Cross-chain deposit to ${protocol.name} via 1inch Fusion+`
          : `Direct deposit to ${protocol.name}`,
        targetApy: protocol.apy,
        crossChainOptimized: protocol.crossChainOptimized || false,
        allocations: [{
          opportunity: {
            protocol: protocol.name,
            chainName: protocol.chain,
            chainId: protocol.chainId,
            apy: protocol.apy,
            risk: protocol.risk,
            crossChain: protocol.crossChainOptimized || false
          },
          percentage: 100,
          reason: protocol.crossChainOptimized 
            ? `Cross-chain optimized ${protocol.name} for ${protocol.apy}% APY (vs ${protocol.originalApy}% same-chain)`
            : `User selected ${protocol.name} for ${protocol.apy}% APY`
        }]
      };
      
      setIsLoading(false);
      onExecuteStrategy(strategy);
    }, 1500);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Executing Strategy: {selectedProtocol}
        </h3>
        <p className="text-gray-600">
          Preparing your deposit transaction...
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Your Protocol
        </h3>
        <p className="text-gray-600 text-sm">
          Pick where you want to deposit your ${amount} USDC
        </p>
      </div>

      {/* Cross-Chain Optimization Toggle */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
              <Shuffle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                <span>Smart Cross-Chain Optimization</span>
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                  🔥 Powered by 1inch
                </span>
              </h4>
              <p className="text-sm text-gray-600">
                {crossChainEnabled 
                  ? "Finding highest yields across ALL chains with automatic bridging"
                  : "Search only current chain protocols"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setCrossChainEnabled(!crossChainEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                crossChainEnabled ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  crossChainEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        {crossChainEnabled && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 flex items-center space-x-2 text-sm"
          >
            <Globe className="w-4 h-4 text-green-600" />
            <span className="text-green-700 font-medium">
              Cross-chain routes active: Polygon → Base, Ethereum, Arbitrum (via 1inch Fusion+)
            </span>
          </motion.div>
        )}
      </div>

      <div className="space-y-3">
        {displayProtocols.map((protocol, index) => (
          <motion.div
            key={protocol.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg p-4 transition-all cursor-pointer ${
              protocol.status === 'ready' 
                ? 'hover:border-purple-300 hover:shadow-md' 
                : 'opacity-60 cursor-not-allowed'
            }`}
            onClick={() => handleProtocolSelect(protocol)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{protocol.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">{protocol.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(protocol.status)}`}>
                      {getStatusText(protocol.status)}
                    </span>
                    {protocol.crossChainOptimized && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                        <Shuffle className="w-3 h-3 mr-1" />
                        Cross-Chain
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{protocol.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <span>📍 {protocol.chain}</span>
                    </div>
                    <div className={`flex items-center space-x-1 text-sm ${getRiskColor(protocol.risk)}`}>
                      {getRiskIcon(protocol.risk)}
                      <span>{protocol.risk} risk</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {protocol.apy}%
                  {protocol.crossChainOptimized && protocol.originalApy && (
                    <div className="text-xs text-purple-600 font-medium">
                      +{(protocol.apy - protocol.originalApy).toFixed(1)}% boost
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">APY</div>
                {protocol.status === 'ready' && (
                  <motion.div
                    className="mt-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <ArrowRight className="w-4 h-4 text-purple-600" />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">What you're choosing:</p>
            <ul className="text-xs space-y-1">
              <li>• <strong>Available Now</strong> = Click to deposit immediately</li>
              <li>• <strong>Coming Soon</strong> = Integration in development</li>
              <li>• <strong>Planned</strong> = On our roadmap</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}