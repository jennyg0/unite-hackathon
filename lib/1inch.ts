import axios from 'axios'
import {
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
  TokenListResponse,
  WalletBalanceResponse,
  PriceFeedResponse,
  LimitOrderRequest,
  LimitOrderResponse
} from '@/types/1inch'

const API_BASE_URL = 'https://api.1inch.dev'
const API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY

if (!API_KEY) {
  console.warn('1inch API key not found. Please set NEXT_PUBLIC_1INCH_API_KEY in your environment variables.')
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Accept': 'application/json',
  },
})

export class OneInchAPI {
  private chainId: number

  constructor(chainId: number = 1) {
    this.chainId = chainId
  }

  // Get quote for token swap
  async getQuote(params: QuoteRequest): Promise<QuoteResponse> {
    try {
      const response = await apiClient.get(`/swap/v6.0/${this.chainId}/quote`, {
        params: {
          src: params.fromTokenAddress,
          dst: params.toTokenAddress,
          amount: params.amount,
          from: params.fromAddress,
          slippage: params.slippage,
          disableEstimate: params.disableEstimate,
          allowPartialFill: params.allowPartialFill,
          protocols: params.protocols,
          gasPrice: params.gasPrice,
          complexityLevel: params.complexityLevel,
          connectorTokens: params.connectorTokens,
          gasLimit: params.gasLimit,
          mainRouteParts: params.mainRouteParts,
          parts: params.parts,
          virtualParts: params.virtualParts,
        }
      })
      return response.data
    } catch (error) {
      console.error('Error getting quote:', error)
      throw error
    }
  }

  // Get swap transaction data
  async getSwap(params: SwapRequest): Promise<SwapResponse> {
    try {
      const response = await apiClient.get(`/swap/v6.0/${this.chainId}/swap`, {
        params: {
          src: params.fromTokenAddress,
          dst: params.toTokenAddress,
          amount: params.amount,
          from: params.fromAddress,
          slippage: params.slippage,
          disableEstimate: params.disableEstimate,
          allowPartialFill: params.allowPartialFill,
          protocols: params.protocols,
          gasPrice: params.gasPrice,
          complexityLevel: params.complexityLevel,
          connectorTokens: params.connectorTokens,
          gasLimit: params.gasLimit,
          mainRouteParts: params.mainRouteParts,
          parts: params.parts,
          virtualParts: params.virtualParts,
        }
      })
      return response.data
    } catch (error) {
      console.error('Error getting swap:', error)
      throw error
    }
  }

  // Get token list
  async getTokenList(): Promise<TokenListResponse> {
    try {
      const response = await apiClient.get(`/swap/v6.0/${this.chainId}/tokens`)
      return response.data
    } catch (error) {
      console.error('Error getting token list:', error)
      throw error
    }
  }

  // Get wallet balances
  async getWalletBalances(address: string): Promise<WalletBalanceResponse> {
    try {
      const response = await apiClient.get(`/balance/v1.2/${this.chainId}/balances/${address}`)
      return response.data
    } catch (error) {
      console.error('Error getting wallet balances:', error)
      throw error
    }
  }

  // Get price feeds
  async getPriceFeeds(tokenAddresses: string[]): Promise<PriceFeedResponse> {
    try {
      const response = await apiClient.get(`/price/v1.1/${this.chainId}/prices`, {
        params: {
          tokens: tokenAddresses.join(','),
        }
      })
      return response.data
    } catch (error) {
      console.error('Error getting price feeds:', error)
      throw error
    }
  }

  // Get token price
  async getTokenPrice(tokenAddress: string): Promise<number> {
    try {
      const response = await apiClient.get(`/price/v1.1/${this.chainId}/prices`, {
        params: {
          tokens: tokenAddress,
        }
      })
      return response.data[tokenAddress]?.price || 0
    } catch (error) {
      console.error('Error getting token price:', error)
      return 0
    }
  }

  // Create limit order
  async createLimitOrder(order: LimitOrderRequest): Promise<LimitOrderResponse> {
    try {
      const response = await apiClient.post(`/limit-order/v3.0/${this.chainId}/order`, order)
      return response.data
    } catch (error) {
      console.error('Error creating limit order:', error)
      throw error
    }
  }

  // Get limit orders
  async getLimitOrders(maker: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/limit-order/v3.0/${this.chainId}/orders`, {
        params: { maker }
      })
      return response.data
    } catch (error) {
      console.error('Error getting limit orders:', error)
      throw error
    }
  }

  // Get protocols
  async getProtocols(): Promise<any[]> {
    try {
      const response = await apiClient.get(`/swap/v6.0/${this.chainId}/protocols`)
      return response.data
    } catch (error) {
      console.error('Error getting protocols:', error)
      throw error
    }
  }

  // Get gas price
  async getGasPrice(): Promise<string> {
    try {
      const response = await apiClient.get(`/gas/v1.1/${this.chainId}/gas-price`)
      return response.data.fast
    } catch (error) {
      console.error('Error getting gas price:', error)
      return '0'
    }
  }

  // Set chain ID
  setChainId(chainId: number) {
    this.chainId = chainId
  }

  // Get current chain ID
  getChainId(): number {
    return this.chainId
  }
}

// Export default instance for Ethereum mainnet
export const oneInchAPI = new OneInchAPI(1)

// Export instances for different networks
export const oneInchAPIBase = new OneInchAPI(8453) // Base mainnet (primary)
export const oneInchAPIMainnet = new OneInchAPI(1) // Ethereum mainnet (secondary) 