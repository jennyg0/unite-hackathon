const BASE_URL = 'https://api.1inch.dev';

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  chainId: number;
}

export interface PriceData {
  token: string;
  price: number;
  timestamp: number;
}

export interface WalletBalance {
  token: TokenInfo;
  balance: string;
  balanceUsd: number;
}

export interface GasPrice {
  fast: number;
  standard: number;
  slow: number;
}

export interface QuoteResponse {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromTokenAmount: string;
  toTokenAmount: string;
  protocols: any[];
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas: number;
    gasPrice: string;
  };
}

export interface SwapResponse {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any[];
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
}

export interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface ChartResponse {
  data: ChartDataPoint[];
  metadata: {
    token: string;
    chainId: number;
    interval: string;
    from: number;
    to: number;
  };
}

class OneInchAPI {
  private apiKey: string;
  private chainId: number;

  constructor(apiKey: string, chainId: number = 137) { // Default to Polygon
    this.apiKey = apiKey;
    this.chainId = chainId;
  }

  private async request(endpoint: string, params: Record<string, any> = {}) {
    // Use proxy in browser to avoid CORS issues
    const isBrowser = typeof window !== 'undefined';
    let url: URL;
    
    if (isBrowser) {
      // In browser, use relative URL with current origin
      url = new URL(`/api/1inch${endpoint}`, window.location.origin);
    } else {
      // On server, use direct 1inch API
      url = new URL(`${BASE_URL}${endpoint}`);
    }
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    console.log('1inch API Request:', {
      endpoint,
      url: url.toString(),
      isBrowser,
      params
    });

    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      // Only add Authorization header when not using proxy (server-side)
      if (!isBrowser) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('1inch API error response:', errorText);
        throw new Error(`1inch API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('1inch API Response:', data);
      return data;
    } catch (error) {
      console.error('1inch API request failed:', error);
      throw error;
    }
  }

  // Get supported tokens for the chain
  async getTokens(): Promise<TokenInfo[]> {
    try {
      const response = await this.request(`/swap/v5.2/${this.chainId}/tokens`);
      return Object.values(response.tokens || {});
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      return [];
    }
  }

  // Get token price
  async getTokenPrice(tokenAddress: string): Promise<PriceData | null> {
    try {
      console.log('Getting price for token:', tokenAddress);
      const response = await this.request(`/price/v1.1/${this.chainId}`);
      
      // The response is a map of token addresses to prices in wei
      // Look for the token in the response (case-insensitive)
      const tokenLower = tokenAddress.toLowerCase();
      let priceInWei = response[tokenLower];
      
      // If not found, try with checksum address
      if (!priceInWei) {
        // Find the key that matches case-insensitively
        const matchingKey = Object.keys(response).find(
          key => key.toLowerCase() === tokenLower
        );
        if (matchingKey) {
          priceInWei = response[matchingKey];
        }
      }
      
      console.log('Price response:', { 
        tokenAddress, 
        tokenLower,
        priceInWei, 
        responseKeys: Object.keys(response).slice(0, 5) // Show first 5 keys
      });
      
      if (!priceInWei) {
        console.error('Price not found for token:', tokenAddress);
        return null;
      }
      
      // Convert from wei to decimal (divide by 10^18)
      const price = parseFloat(priceInWei) / 1e18;
      console.log('Converted price:', price);
      
      return {
        token: tokenAddress,
        price,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to fetch token price:', error);
      return null;
    }
  }

  // Get multiple token prices
  async getTokenPrices(tokenAddresses: string[]): Promise<PriceData[]> {
    try {
      const response = await this.request(`/price/v1.1/${this.chainId}`, {
        token_addresses: tokenAddresses.join(','),
      });
      
      return Object.entries(response).map(([token, price]: [string, any]) => ({
        token,
        price: parseFloat(price),
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to fetch token prices:', error);
      return [];
    }
  }

  // Get wallet balances
  async getWalletBalances(walletAddress: string): Promise<WalletBalance[]> {
    try {
      const response = await this.request(`/balance/v1.2/${this.chainId}/balances`, {
        wallet_address: walletAddress,
      });
      
      return Object.entries(response).map(([address, data]: [string, any]) => ({
        token: {
          address,
          symbol: data.symbol || 'Unknown',
          name: data.name || 'Unknown Token',
          decimals: data.decimals || 18,
          logoURI: data.logoURI || '',
          tags: data.tags || [],
          chainId: this.chainId,
        },
        balance: data.balance || '0',
        balanceUsd: parseFloat(data.balanceUsd || '0'),
      }));
    } catch (error) {
      console.error('Failed to fetch wallet balances:', error);
      return [];
    }
  }

  // Get gas price
  async getGasPrice(): Promise<GasPrice | null> {
    try {
      console.log('Getting gas price for chain:', this.chainId);
      const response = await this.request(`/gas-price/v1.4/${this.chainId}`);
      console.log('Gas price response:', response);
      
      // Convert from wei to gwei (divide by 10^9)
      const gasPrice = {
        fast: parseFloat(response.high?.maxFeePerGas || '0') / 1e9,
        standard: parseFloat(response.medium?.maxFeePerGas || '0') / 1e9,
        slow: parseFloat(response.low?.maxFeePerGas || '0') / 1e9,
      };
      console.log('Converted gas prices (gwei):', gasPrice);
      
      return gasPrice;
    } catch (error) {
      console.error('Failed to fetch gas price:', error);
      return null;
    }
  }

  // Get swap quote
  async getQuote(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    walletAddress?: string
  ): Promise<QuoteResponse | null> {
    try {
      const params: Record<string, any> = {
        src: fromTokenAddress,
        dst: toTokenAddress,
        amount,
        from: walletAddress,
        slippage: 1, // 1% slippage
      };

      const response = await this.request(`/swap/v5.2/${this.chainId}/quote`, params);
      
      return {
        fromToken: response.fromToken,
        toToken: response.toToken,
        fromTokenAmount: response.fromTokenAmount,
        toTokenAmount: response.toTokenAmount,
        protocols: response.protocols || [],
        tx: response.tx,
      };
    } catch (error) {
      console.error('Failed to fetch swap quote:', error);
      return null;
    }
  }

  // Get token metadata
  async getTokenMetadata(tokenAddress: string): Promise<TokenInfo | null> {
    try {
      const response = await this.request(`/token/v1.2/${this.chainId}/metadata`, {
        token_address: tokenAddress,
      });
      
      return {
        address: tokenAddress,
        symbol: response.symbol || 'Unknown',
        name: response.name || 'Unknown Token',
        decimals: response.decimals || 18,
        logoURI: response.logoURI || '',
        tags: response.tags || [],
        chainId: this.chainId,
      };
    } catch (error) {
      console.error('Failed to fetch token metadata:', error);
      return null;
    }
  }

  // Get historical prices (for charts)
  async getHistoricalPrices(
    tokenAddress: string,
    fromTimestamp: number,
    toTimestamp: number
  ): Promise<PriceData[]> {
    try {
      const response = await this.request(`/price/v1.1/${this.chainId}/history`, {
        token_address: tokenAddress,
        from_timestamp: fromTimestamp,
        to_timestamp: toTimestamp,
      });
      
      return response.map((item: any) => ({
        token: tokenAddress,
        price: parseFloat(item.price),
        timestamp: item.timestamp,
      }));
    } catch (error) {
      console.error('Failed to fetch historical prices:', error);
      return [];
    }
  }

  // Get historical chart data
  async getChartData(
    tokenAddress: string,
    interval: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M' = '1d',
    fromTimestamp?: number,
    toTimestamp?: number
  ): Promise<ChartResponse | null> {
    try {
      // Charts API is only available for Polygon (137) and Mainnet (1)
      if (this.chainId !== 1 && this.chainId !== 137) {
        console.warn('Charts API only available for Ethereum Mainnet and Polygon');
        return null;
      }

      const params: Record<string, any> = {
        token_address: tokenAddress,
        interval,
      };

      if (fromTimestamp) {
        params.from_timestamp = fromTimestamp;
      }
      if (toTimestamp) {
        params.to_timestamp = toTimestamp;
      }

      const response = await this.request(`/charts/v1.1/${this.chainId}`, params);
      
      return {
        data: response.data || [],
        metadata: {
          token: tokenAddress,
          chainId: this.chainId,
          interval,
          from: fromTimestamp || 0,
          to: toTimestamp || Date.now(),
        },
      };
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      return null;
    }
  }

  // Get price chart for a specific time range
  async getPriceChart(
    tokenAddress: string,
    days: number = 30
  ): Promise<ChartDataPoint[]> {
    try {
      const toTimestamp = Date.now();
      const fromTimestamp = toTimestamp - (days * 24 * 60 * 60 * 1000);
      
      const chartData = await this.getChartData(
        tokenAddress,
        days <= 1 ? '1h' : days <= 7 ? '4h' : '1d',
        fromTimestamp,
        toTimestamp
      );
      
      return chartData?.data || [];
    } catch (error) {
      console.error('Failed to fetch price chart:', error);
      return [];
    }
  }

  // Get swap transaction data
  async getSwap(params: {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromAddress: string;
    slippage?: number;
    disableEstimate?: boolean;
    allowPartialFill?: boolean;
  }): Promise<SwapResponse> {
    try {
      const swapParams = {
        src: params.fromTokenAddress,
        dst: params.toTokenAddress,
        amount: params.amount,
        from: params.fromAddress,
        slippage: params.slippage || 1,
        disableEstimate: params.disableEstimate || false,
        allowPartialFill: params.allowPartialFill || false,
      };

      const response = await this.request(`/swap/v5.2/${this.chainId}/swap`, swapParams);
      return response;
    } catch (error) {
      console.error('Failed to get swap data:', error);
      throw error;
    }
  }

  // Get supported protocols
  async getProtocols(): Promise<any[]> {
    try {
      const response = await this.request(`/swap/v5.2/${this.chainId}/protocols`);
      return response.protocols || [];
    } catch (error) {
      console.error('Failed to fetch protocols:', error);
      return [];
    }
  }
}

// Create singleton instance
let oneInchAPI: OneInchAPI | null = null;

export function getOneInchAPI(chainId: number = 137): OneInchAPI {
  if (!oneInchAPI) {
    const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;
    if (!apiKey) {
      throw new Error('1inch API key not found. Please set NEXT_PUBLIC_1INCH_API_KEY');
    }
    oneInchAPI = new OneInchAPI(apiKey, chainId);
  }
  return oneInchAPI;
}

// Utility functions for common operations
export async function getCommonTokens(chainId: number = 137): Promise<TokenInfo[]> {
  const api = getOneInchAPI(chainId);
  const allTokens = await api.getTokens();
  
  // Filter for common tokens (USDC, USDT, ETH, etc.)
  const commonSymbols = ['USDC', 'USDT', 'ETH', 'WETH', 'DAI', 'WBTC'];
  return allTokens.filter(token => 
    commonSymbols.includes(token.symbol.toUpperCase())
  );
}

export async function getTokenPriceUSD(tokenAddress: string, chainId: number = 137): Promise<number> {
  const api = getOneInchAPI(chainId);
  const priceData = await api.getTokenPrice(tokenAddress);
  
  // The price is already in USD (relative to native token which is pegged to USD)
  // For stablecoins like USDC, this should be close to 1.0
  return priceData?.price || 0;
}

export async function getWalletTotalValue(walletAddress: string, chainId: number = 137): Promise<number> {
  const api = getOneInchAPI(chainId);
  const balances = await api.getWalletBalances(walletAddress);
  return balances.reduce((total, balance) => total + balance.balanceUsd, 0);
} 