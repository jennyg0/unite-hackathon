// Use our API proxy instead of direct 1inch API calls
const BASE_URL = '/api/1inch';

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
  private chainId: number;

  constructor(chainId: number = 137) { // Default to Polygon - no API key needed client-side
    this.chainId = chainId;
  }

  private async requestPost(endpoint: string, body: Record<string, any> = {}) {
    // Always use our API proxy to keep API key secure
    const url = new URL(`/api/1inch${endpoint}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    console.log('1inch API POST Request:', {
      endpoint,
      url: url.toString(),
      body
    });

    try {
      const response = await fetch(url.toString(), { 
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

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

  private async request(endpoint: string, params: Record<string, any> = {}) {
    // Always use our API proxy to keep API key secure
    const url = new URL(`/api/1inch${endpoint}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    console.log('1inch API Request:', {
      endpoint,
      url: url.toString(),
      params
    });

    try {
      const response = await fetch(url.toString(), { 
        headers: {
          'Accept': 'application/json',
        }
      });

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

  // Get multiple token prices using the bulk POST endpoint
  async getTokenPrices(tokenAddresses: string[]): Promise<PriceData[]> {
    try {
      if (tokenAddresses.length === 0) {
        return [];
      }
      
      console.log('💵 Getting prices for tokens:', tokenAddresses);
      
      const response = await this.requestPost(`/price/v1.1/${this.chainId}`, {
        tokens: tokenAddresses,
        currency: 'USD'
      });
      
      console.log('💵 Bulk price API response:', response);
      
      if (!response || typeof response !== 'object') {
        console.error('❌ Invalid bulk price response');
        return [];
      }
      
      const prices: PriceData[] = [];
      
      for (const [tokenAddr, priceStr] of Object.entries(response)) {
        const price = parseFloat(priceStr as string);
        if (price > 0) {
          console.log(`💰 Price for ${tokenAddr}: $${price}`);
          prices.push({
            token: tokenAddr,
            price,
            timestamp: Date.now(),
          });
        }
      }
      
      console.log('✅ Processed prices:', prices);
      return prices;
    } catch (error) {
      console.error('❌ Failed to fetch token prices:', error);
      return [];
    }
  }

  // Get wallet balances using Balance API
  async getWalletBalances(walletAddress: string): Promise<WalletBalance[]> {
    try {
      console.log('🔍 Fetching balances for wallet:', walletAddress);
      console.log('🌐 Using chain ID:', this.chainId);
      
      const response = await this.request(`/balance/v1.2/${this.chainId}/balances/${walletAddress}`);
      
      console.log('📊 Raw balance API response:', response);
      
      if (!response || typeof response !== 'object') {
        console.warn('❌ Invalid balance response format:', response);
        return [];
      }

      const balances: WalletBalance[] = [];
      
      // Get all supported tokens to get metadata
      const allTokens = await this.getTokens();
      const tokenMap = new Map();
      allTokens.forEach(token => {
        tokenMap.set(token.address.toLowerCase(), token);
      });
      
      // Handle the actual API response format: { "tokenAddress": "balance" }
      for (const [tokenAddress, balanceStr] of Object.entries(response)) {
        const balance = balanceStr as string;
        console.log(`🪙 Processing token ${tokenAddress}: balance=${balance}`);
        
        // Skip tokens with zero balance
        if (!balance || balance === '0') {
          continue;
        }
        
        // Get token metadata
        let tokenInfo = tokenMap.get(tokenAddress.toLowerCase());
        
        // Handle native token (POL/MATIC)
        if (tokenAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
          tokenInfo = {
            address: tokenAddress,
            symbol: this.chainId === 137 ? 'POL' : 'ETH',
            name: this.chainId === 137 ? 'Polygon' : 'Ethereum',
            decimals: 18,
            logoURI: this.chainId === 137 
              ? 'https://wallet-asset.matic.network/img/tokens/pol.svg'
              : 'https://wallet-asset.matic.network/img/tokens/eth.svg',
            tags: ['native'],
            chainId: this.chainId,
          };
        }
        
        if (!tokenInfo) {
          // If we don't have token metadata, create a basic one
          tokenInfo = {
            address: tokenAddress,
            symbol: 'Unknown',
            name: `Token ${tokenAddress.slice(0, 8)}...`,
            decimals: 18,
            logoURI: '',
            tags: [],
            chainId: this.chainId,
          };
        }
        
        const walletBalance: WalletBalance = {
          token: tokenInfo,
          balance,
          balanceUsd: 0, // Will be calculated with prices
        };
        
        console.log(`💰 Processed balance:`, walletBalance);
        balances.push(walletBalance);
      }

      console.log('✅ Final balances:', balances);
      
      return balances;
    } catch (error) {
      console.error('❌ Failed to fetch wallet balances:', error);
      return []; // Return empty array if API fails - no fake data
    }
  }

  // Get portfolio overview using Portfolio API
  async getPortfolioOverview(walletAddress: string): Promise<{
    totalValue: number;
    totalPnl: number;
    totalPnlPercentage: number;
    assets: Array<{
      token: TokenInfo;
      balance: string;
      balanceUsd: number;
      price: number;
      pnl: number;
      pnlPercentage: number;
    }>;
  } | null> {
    try {
      const response = await this.request(`/portfolio/v4/${this.chainId}/overview/erc20/${walletAddress}`);
      
      return {
        totalValue: parseFloat(response.totalValue || '0'),
        totalPnl: parseFloat(response.totalPnl || '0'),
        totalPnlPercentage: parseFloat(response.totalPnlPercentage || '0'),
        assets: (response.assets || []).map((asset: any) => ({
          token: {
            address: asset.token?.address || '',
            symbol: asset.token?.symbol || 'Unknown',
            name: asset.token?.name || 'Unknown Token',
            decimals: asset.token?.decimals || 18,
            logoURI: asset.token?.logoURI || '',
            tags: asset.token?.tags || [],
            chainId: this.chainId,
          },
          balance: asset.balance || '0',
          balanceUsd: parseFloat(asset.balanceUsd || '0'),
          price: parseFloat(asset.price || '0'),
          pnl: parseFloat(asset.pnl || '0'),
          pnlPercentage: parseFloat(asset.pnlPercentage || '0'),
        })),
      };
    } catch (error) {
      console.error('Failed to fetch portfolio overview:', error);
      return null; // Return null if API fails - no fake data
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

  // Get token metadata using Token API
  async getTokenMetadata(tokenAddress: string): Promise<TokenInfo | null> {
    try {
      const response = await this.request(`/token/v1.2/${this.chainId}/custom/${tokenAddress}`);
      
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

  // Get detailed token information using Token Details API  
  async getTokenDetails(tokenAddress: string): Promise<{
    token: TokenInfo;
    price: number;
    priceChange24h: number;
    marketCap: number;
    volume24h: number;
    circulatingSupply: string;
    totalSupply: string;
  } | null> {
    try {
      const response = await this.request(`/token/v1.2/${this.chainId}/custom/${tokenAddress}`);
      
      return {
        token: {
          address: tokenAddress,
          symbol: response.symbol || 'Unknown',
          name: response.name || 'Unknown Token',
          decimals: response.decimals || 18,
          logoURI: response.logoURI || '',
          tags: response.tags || [],
          chainId: this.chainId,
        },
        price: parseFloat(response.price || '0'),
        priceChange24h: parseFloat(response.priceChange24h || '0'),
        marketCap: parseFloat(response.marketCap || '0'),
        volume24h: parseFloat(response.volume24h || '0'),
        circulatingSupply: response.circulatingSupply || '0',
        totalSupply: response.totalSupply || '0',
      };
    } catch (error) {
      console.error('Failed to fetch token details:', error);
      return null;
    }
  }

  // Get wallet's transaction history using History API
  async getTransactionHistory(walletAddress: string, limit: number = 100): Promise<Array<{
    hash: string;
    blockNumber: number;
    timestamp: number;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    gasPrice: string;
    status: string;
    tokenTransfers: Array<{
      token: TokenInfo;
      from: string;
      to: string;
      amount: string;
      amountUsd: number;
    }>;
  }>> {
    try {
      const response = await this.request(`/history/v2.0/${this.chainId}/history/${walletAddress}`, {
        limit: limit.toString(),
      });
      
      return (response.transactions || []).map((tx: any) => ({
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        timestamp: tx.timestamp,
        from: tx.from,
        to: tx.to,
        value: tx.value || '0',
        gasUsed: tx.gasUsed || '0', 
        gasPrice: tx.gasPrice || '0',
        status: tx.status || 'unknown',
        tokenTransfers: (tx.tokenTransfers || []).map((transfer: any) => ({
          token: {
            address: transfer.token?.address || '',
            symbol: transfer.token?.symbol || 'Unknown',
            name: transfer.token?.name || 'Unknown Token',
            decimals: transfer.token?.decimals || 18,
            logoURI: transfer.token?.logoURI || '',
            tags: transfer.token?.tags || [],
            chainId: this.chainId,
          },
          from: transfer.from,
          to: transfer.to,
          amount: transfer.amount || '0',
          amountUsd: parseFloat(transfer.amountUsd || '0'),
        })),
      }));
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
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

  // Get Classic Swap (same-chain) transaction data
  async getClassicSwap(params: {
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

      const response = await this.request(`/swap/v6.0/${this.chainId}/swap`, swapParams);
      return response;
    } catch (error) {
      console.error('Failed to get classic swap data:', error);
      throw error;
    }
  }

  // Get Classic Swap quote
  async getClassicSwapQuote(
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

      const response = await this.request(`/swap/v6.0/${this.chainId}/quote`, params);
      
      return {
        fromToken: response.fromToken,
        toToken: response.toToken,
        fromTokenAmount: response.fromTokenAmount,
        toTokenAmount: response.toTokenAmount,
        protocols: response.protocols || [],
        tx: response.tx,
      };
    } catch (error) {
      console.error('Failed to fetch classic swap quote:', error);
      return null;
    }
  }

  // Get Fusion+ cross-chain swap quote
  async getFusionQuote(params: {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromChainId: number;
    toChainId: number;
    fromAddress: string;
    slippage?: number;
  }): Promise<{
    fromToken: TokenInfo;
    toToken: TokenInfo;
    fromAmount: string;
    toAmount: string;
    estimatedGas: string;
    fees: Array<{
      type: 'network' | 'protocol' | 'bridge';
      amount: string;
      amountUsd: number;
    }>;
    estimatedTimeMinutes: number;
    route: Array<{
      chainId: number;
      protocol: string;
      action: 'swap' | 'bridge';
      estimatedGas: string;
    }>;
  } | null> {
    try {
      const response = await this.request('/fusion/v1.0/quote', {
        srcChainId: params.fromChainId,
        dstChainId: params.toChainId,
        srcTokenAddress: params.fromTokenAddress,
        dstTokenAddress: params.toTokenAddress,
        amount: params.amount,
        walletAddress: params.fromAddress,
        slippage: params.slippage || 1,
      });

      return {
        fromToken: response.srcToken,
        toToken: response.dstToken,
        fromAmount: response.srcAmount,
        toAmount: response.dstAmount,
        estimatedGas: response.estimatedGas || '0',
        fees: response.fees || [],
        estimatedTimeMinutes: response.estimatedTime || 5,
        route: response.route || [],
      };
    } catch (error) {
      console.error('Failed to get Fusion+ quote:', error);
      return null;
    }
  }

  // Execute Fusion+ cross-chain swap
  async getFusionSwap(params: {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromChainId: number;
    toChainId: number;
    fromAddress: string;
    slippage?: number;
  }): Promise<{
    transactions: Array<{
      chainId: number;
      to: string;
      data: string;
      value: string;
      gasLimit: string;
      gasPrice: string;
    }>;
    orderHash?: string;
    estimatedTimeMinutes: number;
  }> {
    try {
      const response = await this.request('/fusion/v1.0/swap', {
        srcChainId: params.fromChainId,
        dstChainId: params.toChainId,
        srcTokenAddress: params.fromTokenAddress,
        dstTokenAddress: params.toTokenAddress,
        amount: params.amount,
        walletAddress: params.fromAddress,
        slippage: params.slippage || 1,
      });

      return {
        transactions: response.transactions || [],
        orderHash: response.orderHash,
        estimatedTimeMinutes: response.estimatedTime || 5,
      };
    } catch (error) {
      console.error('Failed to execute Fusion+ swap:', error);
      throw error;
    }
  }

  // Legacy getSwap method (redirects to Classic Swap)
  async getSwap(params: {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromAddress: string;
    slippage?: number;
    disableEstimate?: boolean;
    allowPartialFill?: boolean;
  }): Promise<SwapResponse> {
    return this.getClassicSwap(params);
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
  // No API key needed client-side - using secure proxy
  if (!oneInchAPI || oneInchAPI['chainId'] !== chainId) {
    oneInchAPI = new OneInchAPI(chainId);
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