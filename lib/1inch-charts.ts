/**
 * 1inch Charts API Integration
 * 
 * Provides historical price charts and market data for tokens using the 1inch Charts API.
 * Perfect for portfolio tracking and price analysis!
 */

const CHARTS_BASE_URL = 'https://api.1inch.dev/charts/v1.0';

export interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface TokenPairChart {
  data: ChartDataPoint[];
  token0: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  token1: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  period: string;
  chainId: number;
}

class OneInchCharts {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(endpoint: string) {
    // Use proxy in browser to avoid CORS issues
    const isBrowser = typeof window !== 'undefined';
    let url: string;
    
    if (isBrowser) {
      // In browser, use our API proxy
      url = `/api/1inch-charts${endpoint}`;
    } else {
      // On server, use direct 1inch API
      url = `${CHARTS_BASE_URL}${endpoint}`;
    }

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    
    // Only add Authorization header when not using proxy (server-side)
    if (!isBrowser) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('1inch Charts API error:', errorText);
        throw new Error(`Charts API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('1inch Charts API request failed:', error);
      throw error;
    }
  }

  /**
   * Get line chart data for a token pair
   * https://api.1inch.dev/charts/v1.0/chart/line/{token0}/{token1}/{period}/{chainId}
   */
  async getLineChart(
    token0: string,
    token1: string,
    period: '1h' | '4h' | '1d' | '1w' | '1M',
    chainId: number = 137
  ): Promise<TokenPairChart | null> {
    try {
      console.log(`📈 Getting line chart: ${token0}/${token1} ${period} on chain ${chainId}`);
      
      const endpoint = `/chart/line/${token0}/${token1}/${period}/${chainId}`;
      const response = await this.request(endpoint);
      
      return {
        data: response.data || [],
        token0: response.token0 || { address: token0, symbol: 'Unknown', name: 'Unknown Token', decimals: 18 },
        token1: response.token1 || { address: token1, symbol: 'USD', name: 'US Dollar', decimals: 6 },
        period,
        chainId,
      };
    } catch (error) {
      console.error('Failed to get line chart:', error);
      return null;
    }
  }

  /**
   * Get USDC price chart for any token (most common use case)
   */
  async getTokenPriceChart(
    tokenAddress: string,
    period: '1h' | '4h' | '1d' | '1w' | '1M' = '1d',
    chainId: number = 137
  ): Promise<ChartDataPoint[]> {
    try {
      // USDC addresses for different chains
      const usdcAddresses: Record<number, string> = {
        1: '0xA0b86a33E6441be9e93ED5B69bb98D36a50Af3E5', // Ethereum
        137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon
        8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
        42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum (USDT)
      };

      const usdcAddress = usdcAddresses[chainId] || usdcAddresses[137];
      
      const chart = await this.getLineChart(tokenAddress, usdcAddress, period, chainId);
      return chart?.data || [];
    } catch (error) {
      console.error('Failed to get token price chart:', error);
      return [];
    }
  }

  /**
   * Get price history for a portfolio of tokens
   */
  async getPortfolioCharts(
    tokens: Array<{ address: string; symbol: string }>,
    period: '1h' | '4h' | '1d' | '1w' | '1M' = '1d',
    chainId: number = 137
  ): Promise<Array<{
    token: { address: string; symbol: string };
    chart: ChartDataPoint[];
  }>> {
    const charts = [];
    
    for (const token of tokens) {
      try {
        const chart = await this.getTokenPriceChart(token.address, period, chainId);
        charts.push({
          token,
          chart,
        });
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to get chart for ${token.symbol}:`, error);
        charts.push({
          token,
          chart: [],
        });
      }
    }
    
    return charts;
  }

  /**
   * Get performance summary for a time period
   */
  async getTokenPerformance(
    tokenAddress: string,
    period: '1h' | '4h' | '1d' | '1w' | '1M' = '1d',
    chainId: number = 137
  ): Promise<{
    token: string;
    period: string;
    startPrice: number;
    endPrice: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    volume: number;
  } | null> {
    try {
      const chart = await this.getTokenPriceChart(tokenAddress, period, chainId);
      
      if (chart.length === 0) {
        return null;
      }

      const startPrice = chart[0].price;
      const endPrice = chart[chart.length - 1].price;
      const change = endPrice - startPrice;
      const changePercent = (change / startPrice) * 100;
      
      const prices = chart.map(d => d.price);
      const high = Math.max(...prices);
      const low = Math.min(...prices);
      const volume = chart.reduce((sum, d) => sum + (d.volume || 0), 0);

      return {
        token: tokenAddress,
        period,
        startPrice,
        endPrice,
        change,
        changePercent,
        high,
        low,
        volume,
      };
    } catch (error) {
      console.error('Failed to get token performance:', error);
      return null;
    }
  }
}

// Singleton instance
let chartsAPI: OneInchCharts | null = null;

export function getOneInchCharts(): OneInchCharts {
  if (!chartsAPI) {
    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) {
      throw new Error('1inch API key not found. Please set ONEINCH_API_KEY');
    }
    chartsAPI = new OneInchCharts(apiKey);
  }
  return chartsAPI;
}

// Utility functions
export async function getTokenChart(
  tokenAddress: string,
  period: '1h' | '4h' | '1d' | '1w' | '1M' = '1d',
  chainId: number = 137
): Promise<ChartDataPoint[]> {
  const charts = getOneInchCharts();
  return charts.getTokenPriceChart(tokenAddress, period, chainId);
}

export async function getMultiTokenPerformance(
  tokens: Array<{ address: string; symbol: string }>,
  period: '1h' | '4h' | '1d' | '1w' | '1M' = '1d',
  chainId: number = 137
) {
  const charts = getOneInchCharts();
  const performance = [];
  
  for (const token of tokens) {
    const perf = await charts.getTokenPerformance(token.address, period, chainId);
    if (perf) {
      performance.push({
        ...perf,
        symbol: token.symbol,
      });
    }
  }
  
  return performance;
}