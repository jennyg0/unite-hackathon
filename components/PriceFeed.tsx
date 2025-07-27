"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { use1inchData } from "@/hooks/use1inchData";
import { TokenInfo } from "@/lib/1inch-api";

interface PriceFeedProps {
  tokens?: TokenInfo[];
  showChanges?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

export function PriceFeed({
  tokens = [],
  showChanges = true,
  autoRefresh = true,
  className = "",
}: PriceFeedProps) {
  const { prices, loading, error, fetchTokenPrices, getTokenPrice } =
    use1inchData({ autoRefresh });

  // Fetch prices for provided tokens
  useEffect(() => {
    if (tokens.length > 0) {
      const tokenAddresses = tokens.map((token) => token.address);
      fetchTokenPrices(tokenAddresses);
    }
  }, [tokens, fetchTokenPrices]);

  // Calculate price change (mock data for now)
  const getPriceChange = (tokenAddress: string) => {
    const price = getTokenPrice(tokenAddress);
    if (!price) return { change: 0, percentage: 0 };

    // Mock price change for demonstration
    const change = (Math.random() - 0.5) * 0.1; // ±5% change
    const percentage = change * 100;

    return { change, percentage };
  };

  const getChangeIcon = (percentage: number) => {
    if (percentage > 0)
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (percentage < 0)
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getChangeColor = (percentage: number) => {
    if (percentage > 0) return "text-green-600";
    if (percentage < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (tokens.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No tokens to display</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Live Prices</h3>
        <button
          onClick={() =>
            tokens.length > 0 && fetchTokenPrices(tokens.map((t) => t.address))
          }
          disabled={loading.prices}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading.prices ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error State */}
      {error.prices && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error.prices}</p>
        </div>
      )}

      {/* Price List */}
      <div className="space-y-3">
        <AnimatePresence>
          {tokens.map((token, index) => {
            const price = getTokenPrice(token.address);
            const { change, percentage } = getPriceChange(token.address);
            const isPositive = percentage > 0;
            const isNegative = percentage < 0;

            return (
              <motion.div
                key={token.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  {/* Token Info */}
                  <div className="flex items-center space-x-3">
                    {token.logoURI ? (
                      <img
                        src={token.logoURI}
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">
                          {token.symbol.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {token.symbol}
                      </h4>
                      <p className="text-sm text-gray-500">{token.name}</p>
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {showChanges && getChangeIcon(percentage)}
                      <div>
                        <p className="font-semibold text-gray-900">
                          ${price ? price.toFixed(4) : "0.0000"}
                        </p>
                        {showChanges && (
                          <p
                            className={`text-sm ${getChangeColor(percentage)}`}
                          >
                            {isPositive ? "+" : ""}
                            {percentage.toFixed(2)}%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Chart Placeholder */}
                {showChanges && (
                  <div className="mt-3 h-8 bg-gray-50 rounded flex items-center justify-center">
                    <div className="text-xs text-gray-500">
                      Chart coming soon
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Loading State */}
      {loading.prices && tokens.length > 0 && (
        <div className="text-center py-8">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Updating prices...</p>
        </div>
      )}
    </div>
  );
}

// Mini price feed for compact display
export function MiniPriceFeed({
  tokens,
  className = "",
}: {
  tokens: TokenInfo[];
  className?: string;
}) {
  const { prices, getTokenPrice } = use1inchData({ autoRefresh: true });

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tokens.slice(0, 5).map((token) => {
        const price = getTokenPrice(token.address);

        return (
          <div
            key={token.address}
            className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{token.symbol}</span>
              <span className="text-gray-600">
                ${price ? price.toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
