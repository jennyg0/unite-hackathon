// 1inch API Types

export interface TokenInfo {
  symbol: string
  name: string
  address: string
  decimals: number
  logoURI: string
  tags: string[]
}

export interface QuoteRequest {
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  fromAddress: string
  slippage: number
  disableEstimate?: boolean
  allowPartialFill?: boolean
  protocols?: string
  gasPrice?: string
  complexityLevel?: number
  connectorTokens?: number
  gasLimit?: number
  mainRouteParts?: number
  parts?: number
  virtualParts?: number
}

export interface QuoteResponse {
  fromToken: TokenInfo
  toToken: TokenInfo
  toTokenAmount: string
  fromTokenAmount: string
  protocols: any[][]
  estimatedGas: number
}

export interface SwapRequest {
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  fromAddress: string
  slippage: number
  disableEstimate?: boolean
  allowPartialFill?: boolean
  protocols?: string
  gasPrice?: string
  complexityLevel?: number
  connectorTokens?: number
  gasLimit?: number
  mainRouteParts?: number
  parts?: number
  virtualParts?: number
}

export interface SwapResponse {
  tx: {
    from: string
    to: string
    data: string
    value: string
    gasPrice: string
    gas: number
  }
  fromToken: TokenInfo
  toToken: TokenInfo
  toTokenAmount: string
  fromTokenAmount: string
  protocols: any[][]
  estimatedGas: number
}

export interface TokenListResponse {
  tokens: { [key: string]: TokenInfo }
}

export interface WalletBalanceResponse {
  tokens: {
    symbol: string
    name: string
    address: string
    decimals: number
    logoURI: string
    tags: string[]
    balance: string
    balanceRaw: string
  }[]
}

export interface PriceFeedResponse {
  [tokenAddress: string]: {
    price: number
    timestamp: number
  }
}

export interface LimitOrderRequest {
  makerAsset: string
  takerAsset: string
  makingAmount: string
  takingAmount: string
  maker: string
  salt: string
  receiver: string
  allowedSender: string
  offsets: string
  interactions: string
}

export interface LimitOrderResponse {
  orderHash: string
  order: {
    makerAsset: string
    takerAsset: string
    makingAmount: string
    takingAmount: string
    maker: string
    salt: string
    receiver: string
    allowedSender: string
    offsets: string
    interactions: string
  }
  signature: string
} 