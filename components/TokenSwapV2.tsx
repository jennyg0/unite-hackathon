"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownUp,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { getOneInchAPI } from "@/lib/1inch-api";
import type { TokenInfo, QuoteResponse } from "@/lib/1inch-api";
import { parseUnits, formatUnits } from "viem";

export default function TokenSwapV2() {
  const { authenticated, user, sendTransaction } = usePrivy();
  const address = user?.wallet?.address;

  // State
  const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
  const [toToken, setToToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slippage, setSlippage] = useState(1); // 1% default
  const [showSettings, setShowSettings] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [chainId, setChainId] = useState(137); // Default to Polygon

  // Load available tokens
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const api = getOneInchAPI(chainId);
        const tokens = await api.getTokens();
        setAvailableTokens(tokens);

        // Set default tokens
        const matic = tokens.find((t) => t.symbol === "MATIC");
        const usdc = tokens.find((t) => t.symbol === "USDC");
        if (matic) setFromToken(matic);
        if (usdc) setToToken(usdc);
      } catch (err) {
        console.error("Failed to load tokens:", err);
      }
    };

    if (authenticated) {
      loadTokens();
    }
  }, [authenticated, chainId]);

  // Get quote
  const getQuote = async () => {
    if (!fromToken || !toToken || !amount || !address) return;

    setLoading(true);
    setError("");
    setQuote(null);

    try {
      const api = getOneInchAPI(chainId);
      const amountInWei = parseUnits(amount, fromToken.decimals).toString();

      const quoteData = await api.getQuote(
        fromToken.address,
        toToken.address,
        amountInWei,
        address
      );

      setQuote(quoteData);
    } catch (err: any) {
      setError(err.message || "Failed to get quote");
    } finally {
      setLoading(false);
    }
  };

  // Execute swap
  const executeSwap = async () => {
    if (!quote || !address || !fromToken || !toToken) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const api = getOneInchAPI(chainId);
      const swapData = await api.getSwap({
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: quote.fromTokenAmount,
        fromAddress: address,
        slippage,
      });

      // Send transaction using Privy
      const txHash = await sendTransaction({
        to: swapData.tx.to,
        data: swapData.tx.data,
        value: BigInt(swapData.tx.value),
        chainId,
      });

      setSuccess(`Swap successful! Transaction: ${txHash}`);
      setQuote(null);
      setAmount("");
    } catch (err: any) {
      setError(err.message || "Failed to execute swap");
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
        {/* Settings Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-gray-50 rounded-lg p-4 mb-6"
          >
            <h4 className="font-medium text-gray-900 mb-3">Swap Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-700 mb-1 block">
                  Slippage Tolerance
                </label>
                <div className="flex space-x-2">
                  {[0.5, 1, 2, 3].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        slippage === value
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) =>
                      setSlippage(parseFloat(e.target.value) || 1)
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                    placeholder="Custom"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-1 block">
                  Network
                </label>
                <select
                  value={chainId}
                  onChange={(e) => setChainId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={137}>Polygon</option>
                  <option value={1}>Ethereum</option>
                  <option value={8453}>Base</option>
                </select>
              </div>
            </div>
          </motion.div>
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
                const token = availableTokens.find(
                  (t) => t.address === e.target.value
                );
                setFromToken(token || null);
              }}
              className="input-field flex-1 h-12 md:h-10 text-base"
            >
              <option value="">Select token</option>
              {availableTokens.map((token) => (
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
              const token = availableTokens.find(
                (t) => t.address === e.target.value
              );
              setToToken(token || null);
            }}
            className="input-field h-12 md:h-10 text-base"
          >
            <option value="">Select token</option>
            {availableTokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quote Display */}
        {quote && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">
                You will receive
              </span>
              <span className="text-lg font-semibold text-blue-900">
                {formatUnits(
                  BigInt(quote.toTokenAmount),
                  quote.toToken.decimals
                )}{" "}
                {quote.toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-blue-600">
              <span>Rate:</span>
              <span>
                1 {quote.fromToken.symbol} ={" "}
                {(
                  parseFloat(
                    formatUnits(
                      BigInt(quote.toTokenAmount),
                      quote.toToken.decimals
                    )
                  ) /
                  parseFloat(
                    formatUnits(
                      BigInt(quote.fromTokenAmount),
                      quote.fromToken.decimals
                    )
                  )
                ).toFixed(6)}{" "}
                {quote.toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-blue-600">
              <span>Slippage:</span>
              <span>{slippage}%</span>
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
            ? `Swap ${fromToken?.symbol} for ${toToken?.symbol}`
            : "Enter amount to get quote"}
        </button>

        {/* Info */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Info className="w-4 h-4" />
            <span>Powered by 1inch API • Best rates across all DEXs</span>
          </div>
          {quote && (
            <div className="text-center text-xs text-gray-400">
              Route: {quote.protocols.map((p) => p[0].name).join(" → ")}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
