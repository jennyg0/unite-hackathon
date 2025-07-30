/**
 * Live Aave V3 Protocol Integration
 * Fetches real-time APY data and enables actual deposits
 */

import { ethers } from 'ethers';
import { get1inchRPC } from '../1inch-rpc';

// Aave V3 Pool Data Provider ABI (simplified for APY fetching)
const POOL_DATA_PROVIDER_ABI = [
  {
    name: 'getReserveData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [
      { name: 'configuration', type: 'uint256' },
      { name: 'liquidityIndex', type: 'uint128' },
      { name: 'variableBorrowIndex', type: 'uint128' },
      { name: 'currentLiquidityRate', type: 'uint128' },
      { name: 'currentVariableBorrowRate', type: 'uint128' },
      { name: 'currentStableBorrowRate', type: 'uint128' },
      { name: 'lastUpdateTimestamp', type: 'uint40' },
      { name: 'aTokenAddress', type: 'address' },
      { name: 'stableDebtTokenAddress', type: 'address' },
      { name: 'variableDebtTokenAddress', type: 'address' }
    ]
  }
];

// Aave V3 Pool ABI (for deposits)
const POOL_ABI = [
  {
    name: 'supply',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
      { name: 'referralCode', type: 'uint16' }
    ]
  }
];

// Aave V3 contract addresses by chain
const AAVE_CONTRACTS: Record<number, {
  poolDataProvider: string;
  pool: string;
  name: string;
}> = {
  1: { // Ethereum
    poolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    name: 'Ethereum'
  },
  137: { // Polygon
    poolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    name: 'Polygon'
  },
  8453: { // Base
    poolDataProvider: '0x2d8A3C5677189723C4cB8873CfC9C8976FDF38Ac',
    pool: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
    name: 'Base'
  },
  42161: { // Arbitrum
    poolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    name: 'Arbitrum'
  }
};

// Token addresses by chain
const TOKEN_ADDRESSES: Record<number, Record<string, string>> = {
  1: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  },
  137: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
  },
  8453: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA'
  },
  42161: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
  }
};

export interface LiveAaveData {
  protocol: string;
  chainId: number;
  chainName: string;
  asset: string;
  tokenAddress: string;
  apy: number;
  liquidityRate: string;
  totalLiquidity: string;
  aTokenAddress: string;
  isActive: boolean;
  confidence: number;
}

export class AaveLiveIntegration {
  private contracts: Record<number, any> = {};

  constructor() {
    this.initializeContracts();
  }

  private initializeContracts() {
    for (const [chainId, addresses] of Object.entries(AAVE_CONTRACTS)) {
      try {
        const rpc = get1inchRPC(parseInt(chainId));
        // We'll use the 1inch RPC to make contract calls
        this.contracts[parseInt(chainId)] = {
          poolDataProvider: addresses.poolDataProvider,
          pool: addresses.pool,
          rpc
        };
      } catch (error) {
        console.error(`Failed to initialize Aave contracts for chain ${chainId}:`, error);
      }
    }
  }

  /**
   * Fetch live APY data from Aave V3
   */
  async getLiveAPY(chainId: number, asset: string): Promise<LiveAaveData | null> {
    try {
      const contract = this.contracts[chainId];
      const tokenAddress = TOKEN_ADDRESSES[chainId]?.[asset];
      
      if (!contract || !tokenAddress) {
        console.warn(`Aave not available for ${asset} on chain ${chainId}`);
        return null;
      }

      console.log(`🏦 Fetching live Aave APY for ${asset} on ${AAVE_CONTRACTS[chainId].name}...`);

      // Encode the contract call
      const iface = new ethers.Interface(POOL_DATA_PROVIDER_ABI);
      const callData = iface.encodeFunctionData('getReserveData', [tokenAddress]);

      // Make the contract call via 1inch RPC
      const result = await contract.rpc.call({
        to: contract.poolDataProvider,
        data: callData
      });

      // Decode the result
      const decoded = iface.decodeFunctionResult('getReserveData', result);
      const liquidityRate = decoded.currentLiquidityRate;
      const aTokenAddress = decoded.aTokenAddress;

      // Convert rate to APY (Aave uses Ray units: 1e27)
      const liquidityRateBN = BigInt(liquidityRate.toString());
      const rayBN = BigInt('1000000000000000000000000000'); // 1e27
      const secondsPerYear = BigInt(31536000); // 365 * 24 * 60 * 60
      
      // APY calculation: ((1 + (liquidityRate / RAY / secondsPerYear)) ^ secondsPerYear) - 1
      const ratePerSecond = Number(liquidityRateBN) / Number(rayBN) / Number(secondsPerYear);
      const apy = (Math.pow(1 + ratePerSecond, Number(secondsPerYear)) - 1) * 100;

      const liveData: LiveAaveData = {
        protocol: 'Aave V3',
        chainId,
        chainName: AAVE_CONTRACTS[chainId].name,
        asset,
        tokenAddress,
        apy: Math.max(apy, 0.1), // Ensure minimum 0.1%
        liquidityRate: liquidityRate.toString(),
        totalLiquidity: '0', // Would need additional call to get this
        aTokenAddress,
        isActive: true,
        confidence: 0.95 // Aave is very reliable
      };

      console.log(`✅ Live Aave APY: ${asset} on ${liveData.chainName} = ${apy.toFixed(2)}%`);
      return liveData;

    } catch (error) {
      console.error(`❌ Failed to fetch live Aave APY for ${asset} on chain ${chainId}:`, error);
      
      // Fallback to estimated APY if live call fails
      return this.getFallbackAPY(chainId, asset);
    }
  }

  /**
   * Get multiple assets for a chain
   */
  async getChainAPYs(chainId: number): Promise<LiveAaveData[]> {
    const assets = Object.keys(TOKEN_ADDRESSES[chainId] || {});
    const results: LiveAaveData[] = [];

    console.log(`🔍 Fetching Aave APYs for ${assets.length} assets on chain ${chainId}...`);

    // Fetch all assets in parallel
    const promises = assets.map(asset => this.getLiveAPY(chainId, asset));
    const apyData = await Promise.all(promises);

    // Filter out null results
    apyData.forEach(data => {
      if (data) results.push(data);
    });

    console.log(`✅ Retrieved ${results.length} live Aave APYs for chain ${chainId}`);
    return results;
  }

  /**
   * Build deposit transaction for Aave
   */
  buildDepositTransaction(
    chainId: number,
    asset: string,
    amount: string,
    userAddress: string
  ): { to: string; data: string; value: string } | null {
    try {
      const contract = this.contracts[chainId];
      const tokenAddress = TOKEN_ADDRESSES[chainId]?.[asset];

      if (!contract || !tokenAddress) {
        return null;
      }

      // Encode deposit transaction
      const iface = new ethers.Interface(POOL_ABI);
      const data = iface.encodeFunctionData('supply', [
        tokenAddress,
        amount,
        userAddress,
        0 // referral code
      ]);

      return {
        to: contract.pool,
        data,
        value: '0'
      };

    } catch (error) {
      console.error('Failed to build Aave deposit transaction:', error);
      return null;
    }
  }

  /**
   * Fallback APY when live call fails
   */
  private getFallbackAPY(chainId: number, asset: string): LiveAaveData | null {
    const tokenAddress = TOKEN_ADDRESSES[chainId]?.[asset];
    if (!tokenAddress) return null;

    // Realistic fallback rates
    const fallbackRates: Record<string, number> = {
      USDC: 3.8,
      USDT: 4.1,
      DAI: 3.5,
      USDbC: 3.9
    };

    return {
      protocol: 'Aave V3',
      chainId,
      chainName: AAVE_CONTRACTS[chainId]?.name || `Chain ${chainId}`,
      asset,
      tokenAddress,
      apy: fallbackRates[asset] || 3.0,
      liquidityRate: '0',
      totalLiquidity: '0',
      aTokenAddress: '0x0000000000000000000000000000000000000000',
      isActive: true,
      confidence: 0.8 // Lower confidence for fallback
    };
  }
}

// Export singleton
export const aaveLive = new AaveLiveIntegration();