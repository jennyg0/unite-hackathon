"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Calendar, RefreshCw } from "lucide-react";
import { use1inchData } from "@/hooks/use1inchData";
import { TokenInfo, ChartDataPoint } from "@/lib/1inch-api";

interface TokenChartProps {
  token: TokenInfo;
  days?: number;
  className?: string;
}

export function TokenChart({
  token,
  days = 30,
  className = "",
}: TokenChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(days);

  const { getPriceChart } = use1inchData({ autoRefresh: false });

  const periods = [
    { label: "1D", days: 1 },
    { label: "7D", days: 7 },
    { label: "30D", days: 30 },
    { label: "90D", days: 90 },
  ];

  const fetchChartData = async (periodDays: number) => {
    setLoading(true);
    setError("");

    try {
      const data = await getPriceChart(token.address, periodDays);
      setChartData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch chart data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData(selectedPeriod);
  }, [token.address, selectedPeriod]);

  // Calculate price change
  const calculatePriceChange = () => {
    if (chartData.length < 2) return { change: 0, percentage: 0 };

    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    const change = lastPrice - firstPrice;
    const percentage = (change / firstPrice) * 100;

    return { change, percentage };
  };

  const { change, percentage } = calculatePriceChange();
  const isPositive = change >= 0;

  // Simple line chart using SVG
  const renderChart = () => {
    if (chartData.length === 0) return null;

    const width = 300;
    const height = 150;
    const padding = 20;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const prices = chartData.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    const points = chartData
      .map((point, index) => {
        const x = padding + (index / (chartData.length - 1)) * chartWidth;
        const y =
          padding +
          chartHeight -
          ((point.price - minPrice) / priceRange) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg width={width} height={height} className="w-full">
        {/* Grid lines */}
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Price line */}
        <polyline
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          points={points}
        />

        {/* Gradient fill */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={isPositive ? "#10b981" : "#ef4444"}
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={isPositive ? "#10b981" : "#ef4444"}
              stopOpacity="0.1"
            />
          </linearGradient>
        </defs>
        <polyline
          fill="url(#chartGradient)"
          stroke="none"
          points={`${points.split(" ")[0]} ${points} ${
            points.split(" ").slice(-1)[0].split(",")[0]
          },${height - padding}`}
        />
      </svg>
    );
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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
              <span className="text-sm font-semibold text-gray-600">
                {token.symbol.charAt(0)}
              </span>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900">{token.symbol}</h3>
            <p className="text-sm text-gray-500">{token.name}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center space-x-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? "+" : ""}
              {percentage.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {change >= 0 ? "+" : ""}${change.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-1">
          {periods.map((period) => (
            <button
              key={period.days}
              onClick={() => setSelectedPeriod(period.days)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selectedPeriod === period.days
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => fetchChartData(selectedPeriod)}
          disabled={loading}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Chart */}
      <div className="relative">
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="h-32 flex items-center justify-center text-red-500 text-sm">
            {error}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {renderChart()}
          </motion.div>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        <Calendar className="w-3 h-3 inline mr-1" />
        {selectedPeriod === 1 ? "24 hours" : `${selectedPeriod} days`} price
        history
      </div>
    </div>
  );
}

// Mini chart for compact display
export function MiniTokenChart({
  token,
  className = "",
}: {
  token: TokenInfo;
  className?: string;
}) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const { getPriceChart } = use1inchData({ autoRefresh: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPriceChart(token.address, 7); // 7 days
        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch mini chart data:", error);
      }
    };
    fetchData();
  }, [token.address, getPriceChart]);

  const calculateChange = () => {
    if (chartData.length < 2) return 0;
    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };

  const change = calculateChange();
  const isPositive = change >= 0;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-3 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">
          {token.symbol}
        </span>
        <span
          className={`text-xs ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {change.toFixed(1)}%
        </span>
      </div>

      {/* Simple sparkline */}
      <div className="h-8 bg-gray-50 rounded flex items-center justify-center">
        <span className="text-xs text-gray-500">Chart</span>
      </div>
    </div>
  );
}
