/**
 * Application Constants
 * Centralized configuration for contract addresses, chain IDs, and other important variables
 */

import { Address } from 'viem';

// Supported Chain IDs
export const CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  POLYGON_AMOY: 80001,
  BASE: 8453,
  BASE_SEPOLIA: 84532,
} as const;

// Default chain for the app (Polygon mainnet)
export const DEFAULT_CHAIN_ID = CHAIN_IDS.POLYGON;

// Contract Addresses
export const CONTRACTS = {
  // AutomatedDeposits contract (will be deployed)
  AUTOMATED_DEPOSITS: (process.env.NEXT_PUBLIC_AUTOMATED_DEPOSITS_ADDRESS as Address) || 
    '0x0000000000000000000000000000000000000000' as Address,
  
  // USDC addresses by chain
  USDC: {
    [CHAIN_IDS.ETHEREUM]: '0xA0b86a33E6441be9e93ED5B69bb98D36a50Af3E5' as Address,
    [CHAIN_IDS.POLYGON]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as Address,
    [CHAIN_IDS.POLYGON_AMOY]: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582' as Address,
    [CHAIN_IDS.BASE]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
  },

  // Native token wrappers
  WETH: {
    [CHAIN_IDS.ETHEREUM]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
    [CHAIN_IDS.POLYGON]: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' as Address,
    [CHAIN_IDS.BASE]: '0x4200000000000000000000000000000000000006' as Address,
  },
} as const;

// Token Information
export const TOKENS = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    addresses: CONTRACTS.USDC,
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    addresses: CONTRACTS.WETH,
  },
} as const;

// Deposit Frequencies (in seconds)
export const DEPOSIT_FREQUENCIES = {
  daily: 86400n,        // 1 day (perfect for hackathon testing!)
  weekly: 604800n,      // 7 days
  'bi-weekly': 1209600n, // 14 days  
  monthly: 2592000n,    // 30 days (approximate)
} as const;

// Gelato Configuration
export const GELATO = {
  // Gelato Automate contract addresses
  AUTOMATE: {
    [CHAIN_IDS.ETHEREUM]: '0xB3f5503f93d5Ef84b06993a1975B9D21B962892F' as Address,
    [CHAIN_IDS.POLYGON]: '0x527a819db1eb0e34426297b03bae11F2f8B3A19E' as Address,
  },
  
  // Cron expressions for automation
  CRON_EXPRESSIONS: {
    daily: '0 10 * * *',      // Every day at 10 AM UTC
    weekly: '0 10 * * 1',     // Every Monday at 10 AM UTC
    'bi-weekly': '0 10 * * 1', // Every other Monday (handled by frequency logic)
    monthly: '0 10 1 * *',    // First day of month at 10 AM UTC
  },
} as const;

// API Configuration
export const API = {
  ONEINCH_BASE_URL: 'https://api.1inch.dev',
  ONEINCH_RPC_BASE_URL: 'https://api.1inch.dev/web3',
  
  // RPC URLs using 1inch
  RPC_URLS: {
    [CHAIN_IDS.ETHEREUM]: 'https://api.1inch.dev/web3/1',
    [CHAIN_IDS.POLYGON]: 'https://api.1inch.dev/web3/137',
    [CHAIN_IDS.BASE]: 'https://api.1inch.dev/web3/8453',
    [CHAIN_IDS.POLYGON_AMOY]: 'https://rpc-amoy.polygon.technology', // Fallback for testnet
  },
} as const;

// App Configuration
export const APP_CONFIG = {
  // Default APY for projections
  DEFAULT_APY: 0.124, // 12.4%
  
  // Minimum deposit amounts (in USD)
  MIN_DEPOSIT_AMOUNT: 10,
  
  // Maximum slippage for swaps (in basis points)
  MAX_SLIPPAGE_BPS: 100, // 1%
  
  // Protocol fee (in basis points)
  PROTOCOL_FEE_BPS: 10, // 0.1%
  
  // Auto-refresh intervals
  PRICE_REFRESH_INTERVAL: 30000, // 30 seconds
  BALANCE_REFRESH_INTERVAL: 60000, // 1 minute
} as const;

// Contract ABIs (common functions)
export const ABIS = {
  ERC20: [
    {
      name: 'approve',
      type: 'function',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: 'success', type: 'bool' }],
      stateMutability: 'nonpayable'
    },
    {
      name: 'allowance',
      type: 'function',
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' }
      ],
      outputs: [{ name: 'allowance', type: 'uint256' }],
      stateMutability: 'view'
    },
    {
      name: 'balanceOf',
      type: 'function',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: 'balance', type: 'uint256' }],
      stateMutability: 'view'
    }
  ],
  
  AUTOMATED_DEPOSITS: [
    {
      name: 'createSchedule',
      type: 'function',
      inputs: [
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'frequency', type: 'uint256' },
        { name: 'recipient', type: 'address' }
      ],
      outputs: [{ name: 'scheduleId', type: 'uint256' }],
      stateMutability: 'nonpayable'
    },
    {
      name: 'schedules',
      type: 'function',
      inputs: [
        { name: 'user', type: 'address' },
        { name: 'scheduleId', type: 'uint256' }
      ],
      outputs: [
        { name: 'user', type: 'address' },
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'frequency', type: 'uint256' },
        { name: 'nextDeposit', type: 'uint256' },
        { name: 'totalDeposited', type: 'uint256' },
        { name: 'isActive', type: 'bool' },
        { name: 'recipient', type: 'address' }
      ],
      stateMutability: 'view'
    },
    {
      name: 'userScheduleCount',
      type: 'function',
      inputs: [{ name: 'user', type: 'address' }],
      outputs: [{ name: 'count', type: 'uint256' }],
      stateMutability: 'view'
    },
    {
      name: 'updateSchedule',
      type: 'function', 
      inputs: [
        { name: 'scheduleId', type: 'uint256' },
        { name: 'isActive', type: 'bool' }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    }
  ]
} as const;

// Helper functions
export function getUSDCAddress(chainId: number): Address {
  return TOKENS.USDC.addresses[chainId as keyof typeof TOKENS.USDC.addresses] || 
    TOKENS.USDC.addresses[DEFAULT_CHAIN_ID];
}

export function getRPCUrl(chainId: number): string {
  return API.RPC_URLS[chainId as keyof typeof API.RPC_URLS] || 
    API.RPC_URLS[DEFAULT_CHAIN_ID];
}

export function getGelatoAutomateAddress(chainId: number): Address {
  return GELATO.AUTOMATE[chainId as keyof typeof GELATO.AUTOMATE] || 
    GELATO.AUTOMATE[DEFAULT_CHAIN_ID];
}

// Type exports for convenience
export type ChainId = typeof CHAIN_IDS[keyof typeof CHAIN_IDS];
export type DepositFrequency = keyof typeof DEPOSIT_FREQUENCIES;
export type TokenSymbol = keyof typeof TOKENS;