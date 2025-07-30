/**
 * 1inch Fusion+ SDK Integration for Cross-Chain Automated Deposits
 * 
 * Uses the official @1inch/cross-chain-sdk for seamless cross-chain swaps.
 * Perfect for allowing users to deposit any token from any supported chain!
 */

import { DEFAULT_CHAIN_ID, getUSDCAddress } from './constants';

// Dynamically import 1inch SDK to handle potential import issues
let SDK: any = null;
let NetworkEnum: any = null;
let QuoteParams: any = null;

try {
  const oneInchSDK = require("@1inch/cross-chain-sdk");
  SDK = oneInchSDK.SDK;
  NetworkEnum = oneInchSDK.NetworkEnum;
  QuoteParams = oneInchSDK.QuoteParams;
  console.log('✅ 1inch SDK loaded successfully');
} catch (error) {
  console.error('❌ Failed to load 1inch SDK:', error);
}

// Map our chain IDs to 1inch NetworkEnum - will be populated after SDK loads
let CHAIN_ID_TO_NETWORK: Record<number, any> = {};

// Initialize the mapping after SDK loads
const initializeChainMapping = () => {
  if (NetworkEnum) {
    CHAIN_ID_TO_NETWORK = {
      1: NetworkEnum.ETHEREUM,
      137: NetworkEnum.POLYGON,
      8453: NetworkEnum.BASE,
      42161: NetworkEnum.ARBITRUM,
      56: NetworkEnum.BINANCE,
      10: NetworkEnum.OPTIMISM,
      100: NetworkEnum.GNOSIS,
      43114: NetworkEnum.AVALANCHE,
      250: NetworkEnum.FANTOM,
      25: NetworkEnum.CRONOS,
      1313161554: NetworkEnum.AURORA,
      1284: NetworkEnum.MOONBEAM,
      1285: NetworkEnum.MOONRIVER,
      128: NetworkEnum.HECO,
      66: NetworkEnum.OKEX,
    };
    console.log('🗺️ Chain mapping initialized');
  } else {
    console.warn('⚠️ NetworkEnum not available, using fallback');
    // Fallback - just return empty for now
    CHAIN_ID_TO_NETWORK = {};
  }
};

// Initialize mapping when SDK is loaded
initializeChainMapping();

export interface FusionQuoteResult {
  fromToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    chainId: number;
  };
  toToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    chainId: number;
  };
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  fees: Array<{
    type: string;
    amount: string;
    amountUsd: number;
  }>;
  estimatedTimeMinutes: number;
  priceImpact: number;
  quote: any; // The raw quote object needed for creating orders
}

export interface FusionOrderResult {
  orderHash: string;
  order: any;
  quoteId: string;
  estimatedTimeMinutes: number;
}

class OneInchFusionSDK {
  private sdk: any;
  private isAvailable: boolean;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.isAvailable = !!SDK;
    
    if (this.isAvailable) {
      // Check if we're in browser environment
      const isBrowser = typeof window !== 'undefined';
      
      if (isBrowser) {
        // In browser, we'll use our proxy instead of direct SDK calls
        console.log('✅ OneInchFusionSDK initialized with proxy mode for browser');
        this.sdk = null; // We'll use proxy instead
      } else {
        // On server, use SDK directly
        this.sdk = new SDK({
          url: "https://api.1inch.dev/fusion-plus",
          authKey: apiKey,
        });
        console.log('✅ OneInchFusionSDK initialized with direct SDK for server');
      }
    } else {
      console.warn('⚠️ 1inch SDK not available, operating in fallback mode');
      this.sdk = null;
    }
  }

  /**
   * Make API request using proxy in browser or direct in server
   */
  private async makeApiRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) {
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
      // Use proxy in browser to avoid CORS
      const url = `/api/1inch-fusion${endpoint}`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(body && { body: JSON.stringify(body) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API request failed: ${errorData.error || response.statusText}`);
      }

      return await response.json();
    } else {
      // Direct API call on server
      const url = `https://api.1inch.dev/fusion-plus${endpoint}`;
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        ...(body && { body: JSON.stringify(body) }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    }
  }

  /**
   * Get cross-chain swap quote using the official SDK or direct API
   */
  async getQuote(params: {
    fromChainId: number;
    toChainId: number;
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    walletAddress: string;
    slippage?: number;
  }): Promise<FusionQuoteResult | null> {
    try {
      console.log('Getting Fusion+ quote:', params);

      // Try SDK first if available (server-side)
      if (this.sdk && typeof window === 'undefined') {
        // Convert chain IDs to NetworkEnum
        const srcChainId = CHAIN_ID_TO_NETWORK[params.fromChainId];
        const dstChainId = CHAIN_ID_TO_NETWORK[params.toChainId];

        if (!srcChainId || !dstChainId) {
          throw new Error(`Unsupported chain IDs: ${params.fromChainId} -> ${params.toChainId}`);
        }

        const quoteParams: QuoteParams = {
          srcChainId,
          dstChainId,
          srcTokenAddress: params.fromTokenAddress,
          dstTokenAddress: params.toTokenAddress,
          amount: params.amount,
          walletAddress: params.walletAddress,
          // Add slippage if provided
          ...(params.slippage && { slippage: params.slippage }),
        };

        const quote = await this.sdk.getQuote(quoteParams);
        
        if (!quote) {
          console.warn('No quote received from Fusion+ SDK');
          return null;
        }

        // Extract quote data (structure depends on SDK response)
        const result: FusionQuoteResult = {
          fromToken: {
            address: params.fromTokenAddress,
            symbol: quote.srcToken?.symbol || 'Unknown',
            name: quote.srcToken?.name || 'Unknown Token',
            decimals: quote.srcToken?.decimals || 18,
            chainId: params.fromChainId,
          },
          toToken: {
            address: params.toTokenAddress,
            symbol: quote.dstToken?.symbol || 'USDC',
            name: quote.dstToken?.name || 'USD Coin',
            decimals: quote.dstToken?.decimals || 6,
            chainId: params.toChainId,
          },
          fromAmount: quote.srcAmount || params.amount,
          toAmount: quote.dstAmount || '0',
          estimatedGas: quote.gas || '0',
          fees: quote.fees || [],
          estimatedTimeMinutes: quote.estimatedTime || 5,
          priceImpact: parseFloat(quote.priceImpact || '0'),
          quote, // Keep the raw quote for order creation
        };

        console.log('Fusion+ quote received via SDK:', result);
        return result;
      }

      // Fallback to direct API calls (works in browser via proxy)
      console.log('Using direct API call for quote (browser mode)');
      
      // Build query parameters for the quote endpoint using correct Fusion+ API structure
      const queryParams = new URLSearchParams({
        src: params.fromChainId.toString(),
        dst: params.toChainId.toString(),
        srcTokenAddress: params.fromTokenAddress,
        dstTokenAddress: params.toTokenAddress,
        amount: params.amount,
        from: params.walletAddress,
      });

      if (params.slippage) {
        queryParams.append('slippage', params.slippage.toString());
      }

      // Use the correct Fusion+ endpoint structure
      const endpoint = `/quoter/v1.0/quote?${queryParams.toString()}`;
      const apiResponse = await this.makeApiRequest(endpoint);
      
      if (!apiResponse) {
        console.warn('No quote received from Fusion+ API');
        return null;
      }

      // Transform API response to our standard format
      const result: FusionQuoteResult = {
        fromToken: {
          address: params.fromTokenAddress,
          symbol: apiResponse.srcToken?.symbol || 'Unknown',
          name: apiResponse.srcToken?.name || 'Unknown Token',
          decimals: apiResponse.srcToken?.decimals || 18,
          chainId: params.fromChainId,
        },
        toToken: {
          address: params.toTokenAddress,
          symbol: apiResponse.dstToken?.symbol || 'USDC',
          name: apiResponse.dstToken?.name || 'USD Coin',
          decimals: apiResponse.dstToken?.decimals || 6,
          chainId: params.toChainId,
        },
        fromAmount: apiResponse.srcAmount || params.amount,
        toAmount: apiResponse.dstAmount || '0',
        estimatedGas: apiResponse.gas || '0',
        fees: apiResponse.fees || [],
        estimatedTimeMinutes: apiResponse.estimatedTime || 5,
        priceImpact: parseFloat(apiResponse.priceImpact || '0'),
        quote: apiResponse, // Keep the raw API response
      };

      console.log('Fusion+ quote received via API:', result);
      return result;
    } catch (error) {
      console.error('Failed to get Fusion+ quote:', error);
      return null;
    }
  }

  /**
   * Get supported chains from the SDK
   */
  getSupportedChains(): Array<{ chainId: number; name: string; networkEnum: NetworkEnum }> {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      8453: 'Base',
      42161: 'Arbitrum',
      10: 'Optimism',
      56: 'BNB Chain',
      43114: 'Avalanche',
      250: 'Fantom',
      25: 'Cronos',
      1313161554: 'Aurora',
      1284: 'Moonbeam',
      1285: 'Moonriver',
      128: 'Heco',
      66: 'OKEx',
      100: 'Gnosis',
    };

    return Object.entries(CHAIN_ID_TO_NETWORK).map(([chainId, networkEnum]) => ({
      chainId: parseInt(chainId),
      name: chainNames[parseInt(chainId)] || `Chain ${chainId}`,
      networkEnum,
    }));
  }

  /**
   * Check if a cross-chain route is supported
   */
  isRouteSupported(fromChainId: number, toChainId: number): boolean {
    return !!(CHAIN_ID_TO_NETWORK[fromChainId] && CHAIN_ID_TO_NETWORK[toChainId]);
  }

  /**
   * Get active orders (for tracking)
   */
  async getActiveOrders(page: number = 1, limit: number = 10) {
    try {
      if (this.sdk && typeof window === 'undefined') {
        return await this.sdk.getActiveOrders({ page, limit });
      }
      
      // Use API proxy for browser
      const endpoint = `/orders/v1.0/active?page=${page}&limit=${limit}`;
      return await this.makeApiRequest(endpoint);
    } catch (error) {
      console.error('Failed to get active orders:', error);
      return [];
    }
  }

  /**
   * Get orders by maker address
   */
  async getOrdersByMaker(address: string, page: number = 1, limit: number = 10) {
    try {
      if (this.sdk && typeof window === 'undefined') {
        return await this.sdk.getOrdersByMaker({ address, page, limit });
      }
      
      // Use API proxy for browser
      const endpoint = `/orders/v1.0/by-maker/${address}?page=${page}&limit=${limit}`;
      return await this.makeApiRequest(endpoint);
    } catch (error) {
      console.error('Failed to get orders by maker:', error);
      return [];
    }
  }

  /**
   * Find the best deposit route across supported chains
   */
  async findBestDepositRoute(
    userAddress: string,
    targetAmountUsd: number,
    targetChainId: number = DEFAULT_CHAIN_ID
  ): Promise<{
    bestOption: {
      fromChainId: number;
      fromTokenAddress: string;
      fromTokenSymbol: string;
      quote: FusionQuoteResult;
    } | null;
    allOptions: Array<{
      fromChainId: number;
      fromTokenAddress: string;
      fromTokenSymbol: string;
      quote: FusionQuoteResult | null;
      error?: string;
    }>;
  }> {
    try {
      const supportedChains = this.getSupportedChains();
      console.log('🔗 Supported chains:', supportedChains);
    
    // Common stablecoins on different chains (only Fusion+ supported chains)
    const testTokens = [
      { chainId: 1, address: '0xA0b86a33E6441be9e93ED5B69bb98D36a50Af3E5', symbol: 'USDC' }, // Ethereum
      { chainId: 137, address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC' }, // Polygon
      { chainId: 8453, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC' }, // Base
      { chainId:42161, address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC' }, // Arbitrum
    ];

    const allOptions: Array<{
      fromChainId: number;
      fromTokenAddress: string;
      fromTokenSymbol: string;
      quote: FusionQuoteResult | null;
      error?: string;
    }> = [];

    // Test each potential route
    for (const token of testTokens) {
      if (token.chainId === targetChainId) continue; // Skip same chain

      if (!this.isRouteSupported(token.chainId, targetChainId)) {
        allOptions.push({
          fromChainId: token.chainId,
          fromTokenAddress: token.address,
          fromTokenSymbol: token.symbol,
          quote: null,
          error: 'Route not supported',
        });
        continue;
      }

      try {
        // Calculate amount in token decimals (USDC = 6, USDT = 6, most others = 18)
        const decimals = token.symbol === 'USDC' || token.symbol === 'USDT' ? 6 : 18;
        const amount = (targetAmountUsd * Math.pow(10, decimals)).toString();
        
        const quote = await this.getQuote({
          fromChainId: token.chainId,
          toChainId: targetChainId,
          fromTokenAddress: token.address,
          toTokenAddress: getUSDCAddress(targetChainId),
          amount,
          walletAddress: userAddress,
        });

        allOptions.push({
          fromChainId: token.chainId,
          fromTokenAddress: token.address,
          fromTokenSymbol: token.symbol,
          quote,
        });
      } catch (error) {
        allOptions.push({
          fromChainId: token.chainId,
          fromTokenAddress: token.address,
          fromTokenSymbol: token.symbol,
          quote: null,
          error: error instanceof Error ? error.message : 'Failed to get quote',
        });
      }
    }

    // Find the best option (lowest total fees)
    const validOptions = allOptions.filter(opt => opt.quote && !opt.error);
    const bestOption = validOptions.reduce((best, current) => {
      if (!best || !current.quote) return current;
      if (!best.quote) return current;
      
      const currentFeesUsd = current.quote.fees.reduce((sum, fee) => sum + fee.amountUsd, 0);
      const bestFeesUsd = best.quote.fees.reduce((sum, fee) => sum + fee.amountUsd, 0);
      
      return currentFeesUsd < bestFeesUsd ? current : best;
    }, null as any);

      return {
        bestOption,
        allOptions,
      };
    } catch (error) {
      console.error('🚨 findBestDepositRoute failed:', error);
      return {
        bestOption: null,
        allOptions: [],
      };
    }
  }
}

// Singleton instance
let fusionSDK: OneInchFusionSDK | null = null;

export function getOneInchFusionSDK(): OneInchFusionSDK {
  if (!fusionSDK) {
    const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;
    if (!apiKey) {
      throw new Error('1inch API key not found. Please set NEXT_PUBLIC_1INCH_API_KEY');
    }
    fusionSDK = new OneInchFusionSDK(apiKey);
  }
  return fusionSDK;
}

// Utility functions for easy integration
export async function getCrossChainQuote(
  userAddress: string,
  fromChainId: number,
  fromTokenAddress: string,
  amount: string,
  targetChainId: number = DEFAULT_CHAIN_ID
): Promise<FusionQuoteResult | null> {
  const sdk = getOneInchFusionSDK();
  return sdk.getQuote({
    fromChainId,
    toChainId: targetChainId,
    fromTokenAddress,
    toTokenAddress: getUSDCAddress(targetChainId),
    amount,
    walletAddress: userAddress,
  });
}

export async function findOptimalDepositRoute(
  userAddress: string,
  targetAmountUsd: number,
  targetChainId: number = DEFAULT_CHAIN_ID
) {
  const sdk = getOneInchFusionSDK();
  return sdk.findBestDepositRoute(userAddress, targetAmountUsd, targetChainId);
}

export function getSupportedCrossChainRoutes() {
  const sdk = getOneInchFusionSDK();
  return sdk.getSupportedChains();
}