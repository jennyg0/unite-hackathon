"use client";

import { useState } from "react";
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
} from "lucide-react";

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
}

export default function SmartStrategy({ amount, asset, riskProfile, onExecuteStrategy }: SmartStrategyProps) {
  const { authenticated } = usePrivy();
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Real protocol data - honest about what works vs what's coming
  const protocols: ProtocolOption[] = [
    {
      name: "Aave V3",
      apy: 3.8,
      risk: 'low',
      status: 'ready',
      description: "Battle-tested lending protocol. Your funds earn interest immediately.",
      icon: "🏦",
      chain: "Polygon"
    },
    {
      name: "Yearn Finance", 
      apy: 15.2,
      risk: 'medium',
      status: 'ready',
      description: "Automated yield farming strategies. Higher returns, more complexity.",
      icon: "🌾",
      chain: "Polygon"
    },
    {
      name: "Compound V3",
      apy: 12.1, 
      risk: 'medium',
      status: 'ready',
      description: "Algorithmic money markets. Proven track record.",
      icon: "🔄",
      chain: "Ethereum"
    },
    {
      name: "Lido Staking",
      apy: 8.5,
      risk: 'low',
      status: 'planned', 
      description: "ETH liquid staking. Earn staking rewards while keeping liquidity.",
      icon: "🔒",
      chain: "Ethereum"
    }
  ];

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
        description: `Direct deposit to ${protocol.name}`,
        targetApy: protocol.apy,
        allocations: [{
          opportunity: {
            protocol: protocol.name,
            chainName: protocol.chain,
            apy: protocol.apy,
            risk: protocol.risk
          },
          percentage: 100,
          reason: `User selected ${protocol.name} for ${protocol.apy}% APY`
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

      <div className="space-y-3">
        {protocols.map((protocol, index) => (
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