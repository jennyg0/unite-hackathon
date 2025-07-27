"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { oneInchAPIBase, oneInchAPIMainnet } from "@/lib/1inch";
import { TokenInfo, QuoteResponse } from "@/types/1inch";

// Common token addresses for mainnets
const COMMON_TOKENS = {
  // Base mainnet
  8453: {
    ETH: {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      logoURI: "",
      tags: [],
    },
    USDC: {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logoURI: "",
      tags: [],
    },
    WETH: {
      address: "0x4200000000000000000000000000000000000006",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      logoURI: "",
      tags: [],
    },
  },
  // Ethereum mainnet
  1: {
    ETH: {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      logoURI: "",
      tags: [],
    },
    USDC: {
      address: "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logoURI: "",
      tags: [],
    },
    WETH: {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      logoURI: "",
      tags: [],
    },
  },
};

export function TokenSwap() {
  const { user, authenticated, ready } = usePrivy();
  const address = user?.wallet?.address;
  const chain = { id: 8453 }; // Default to Base for now

  // Wait for Privy to be ready
  if (!ready) {
    return (
      <div className="card text-center py-12">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowDownUp className="w-6 h-6 text-blue-600 animate-pulse" />
        </div>
        <p className="text-gray-600">Loading swap interface...</p>
      </div>
    );
  }

  const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
  const [toToken, setToToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get the appropriate API instance based on chain
  const getAPIInstance = () => {
    if (!chain) return oneInchAPIBase;
    switch (chain.id) {
      case 8453: // Base mainnet
        return oneInchAPIBase;
      case 1: // Ethereum mainnet
        return oneInchAPIMainnet;
      default:
        return oneInchAPIBase;
    }
  };

  // Get available tokens for current chain
  const getAvailableTokens = () => {
    if (!chain) return COMMON_TOKENS[8453];
    return (
      COMMON_TOKENS[chain.id as keyof typeof COMMON_TOKENS] ||
      COMMON_TOKENS[8453]
    );
  };

  // Get quote for swap
  const getQuote = async () => {
    if (!fromToken || !toToken || !amount || !address) return;

    setLoading(true);
    setError("");
    setQuote(null);

    try {
      const api = getAPIInstance();
      const response = await api.getQuote({
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: (
          parseFloat(amount) * Math.pow(10, fromToken.decimals)
        ).toString(),
        fromAddress: address,
        slippage: 1, // 1% slippage
      });
      setQuote(response);
    } catch (err: any) {
      setError(err.response?.data?.description || "Failed to get quote");
    } finally {
      setLoading(false);
    }
  };

  // Execute swap
  const executeSwap = async () => {
    if (!quote || !address) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const api = getAPIInstance();
      const swapData = await api.getSwap({
        fromTokenAddress: quote.fromToken.address,
        toTokenAddress: quote.toToken.address,
        amount: quote.fromTokenAmount,
        fromAddress: address,
        slippage: 1,
      });

      // Here you would typically send the transaction using wagmi
      // For now, we'll just show success
      setSuccess("Swap transaction prepared successfully!");
      setQuote(null);
      setAmount("");
    } catch (err: any) {
      setError(err.response?.data?.description || "Failed to execute swap");
    } finally {
      setLoading(false);
    }
  };

  // Auto-get quote when inputs change
  useEffect(() => {
    if (fromToken && toToken && amount && address) {
      const timeoutId = setTimeout(getQuote, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [fromToken, toToken, amount, address]);

  if (!authenticated) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Please connect your wallet to start swapping tokens
        </p>
      </div>
    );
  }

  const availableTokens = getAvailableTokens();
  const tokenList = Object.values(availableTokens);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="text-center mb-6 md:mb-8">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
          <ArrowDownUp className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Token Swap
        </h2>
        <p className="text-sm md:text-base text-gray-600 px-4">
          Swap tokens using 1inch aggregation for the best rates
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {/* Network Warning */}
        {chain && ![8453, 1].includes(chain.id) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                Unsupported Network
              </span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Please switch to Base or Ethereum mainnet for swapping
            </p>
            <button className="btn-primary mt-2">Switch to Base</button>
          </div>
        )}

        {/* From Token */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="space-y-3 md:space-y-0 md:flex md:space-x-2">
            <select
              value={fromToken?.address || ""}
              onChange={(e) => {
                const token = tokenList.find(
                  (t) => t.address === e.target.value
                );
                setFromToken(token || null);
              }}
              className="input-field flex-1 h-12 md:h-10 text-base"
            >
              <option value="">Select token</option>
              {tokenList.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="input-field w-full md:w-32 h-12 md:h-10 text-base"
            />
          </div>
        </div>

        {/* Swap Direction */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => {
              const temp = fromToken;
              setFromToken(toToken);
              setToToken(temp);
            }}
            className="w-12 h-12 md:w-10 md:h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowDownUp className="w-6 h-6 md:w-5 md:h-5 text-gray-600" />
          </button>
        </div>

        {/* To Token */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <select
            value={toToken?.address || ""}
            onChange={(e) => {
              const token = tokenList.find((t) => t.address === e.target.value);
              setToToken(token || null);
            }}
            className="input-field h-12 md:h-10 text-base"
          >
            <option value="">Select token</option>
            {tokenList.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quote Display */}
        {quote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-blue-50 rounded-lg p-4 mb-6"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-700">You'll receive:</span>
              <span className="font-semibold text-blue-900">
                {parseFloat(quote.toTokenAmount) /
                  Math.pow(10, quote.toToken.decimals)}{" "}
                {quote.toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-blue-600">
              <span>Rate:</span>
              <span>
                1 {quote.fromToken.symbol} ={" "}
                {(
                  (parseFloat(quote.toTokenAmount) /
                    parseFloat(quote.fromTokenAmount)) *
                  Math.pow(
                    10,
                    quote.fromToken.decimals - quote.toToken.decimals
                  )
                ).toFixed(6)}{" "}
                {quote.toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-blue-600">
              <span>Estimated gas:</span>
              <span>{quote.estimatedGas} gas</span>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={executeSwap}
          disabled={!quote || loading}
          className="btn-primary w-full py-3 md:py-4 text-base md:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Processing..."
            : quote
            ? "Execute Swap"
            : "Enter amount to get quote"}
        </button>

        {/* Info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Powered by 1inch API • Best rates across all DEXs
        </div>
      </motion.div>
    </div>
  );
}
