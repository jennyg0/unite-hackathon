import { getOneInchAPI } from './1inch-api';

export interface AaveMarket {
  symbol: string;
  address: string;
  aTokenAddress: string;
  stableBorrowRateEnabled: boolean;
  borrowingEnabled: boolean;
  isActive: boolean;
  isFrozen: boolean;
  decimals: number;
  ltv: number; // Loan to value
  liquidationThreshold: number;
  liquidationBonus: number;
  reserveFactor: number;
  usageAsCollateralEnabled: boolean;
  borrowRate: string;
  supplyRate: string;
  totalLiquidity: string;
  availableLiquidity: string;
  totalBorrows: string;
  priceInUsd?: number;
}

export interface RiskProfile {
  name: string;
  description: string;
  targetAPY: string;
  riskLevel: 'low' | 'medium' | 'high';
  color: string;
  icon: string;
  strategies: Strategy[];
}

export interface Strategy {
  protocol: string;
  asset: string;
  apy: string;
  allocation: number; // percentage
  description: string;
}

// Aave V3 addresses on different chains
const AAVE_ADDRESSES: Record<number, {
  poolAddressProvider: string;
  pool: string;
  poolDataProvider: string;
  aaveOracle: string;
}> = {
  // Polygon
  137: {
    poolAddressProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
    pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    poolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    aaveOracle: '0xb023e699F5a33916Ea823A16485e259257cA8Bd1',
  },
  // Base
  8453: {
    poolAddressProvider: '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D',
    pool: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
    poolDataProvider: '0x2d8A3C5677189723C4cB8873CfC9C8976FDF38Ac',
    aaveOracle: '0x2Cc0Fc26eD4563A5ce5e8bdcfe1A2878676Ae156',
  },
  // Ethereum
  1: {
    poolAddressProvider: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
    pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    poolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    aaveOracle: '0x54586bE62E3c3580375aE3723C145253060Ca0C2',
  }
};

// Common stablecoins and their Aave market data
const STABLECOIN_MARKETS: Record<number, Record<string, {
  address: string;
  aTokenAddress: string;
  decimals: number;
}>> = {
  137: { // Polygon
    USDC: {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      aTokenAddress: '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
      decimals: 6,
    },
    USDT: {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      aTokenAddress: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620',
      decimals: 6,
    },
    DAI: {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      aTokenAddress: '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE',
      decimals: 18,
    },
  },
  8453: { // Base
    USDC: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      aTokenAddress: '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB',
      decimals: 6,
    },
    USDbC: { // Bridged USDC
      address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
      aTokenAddress: '0x0a1d576f3eFeF75b330424287a95A366e8281D54',
      decimals: 6,
    }
  },
  1: { // Ethereum
    USDC: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      aTokenAddress: '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c',
      decimals: 6,
    },
    USDT: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      aTokenAddress: '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a',
      decimals: 6,
    },
    DAI: {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      aTokenAddress: '0x018008bfb33d285247A21d44E50697654f754e63',
      decimals: 18,
    },
  }
};

export class AaveService {
  private chainId: number;

  constructor(chainId: number = 137) {
    this.chainId = chainId;
  }

  // Get risk profiles with current APYs
  async getRiskProfiles(): Promise<RiskProfile[]> {
    // In a real implementation, we'd fetch current APYs from Aave
    // For now, using realistic estimates
    const profiles: RiskProfile[] = [
      {
        name: "Conservative",
        description: "Low risk, stable returns. Perfect for emergency funds.",
        targetAPY: "3-5%",
        riskLevel: "low",
        color: "#10B981",
        icon: "🛡️",
        strategies: [
          {
            protocol: "Aave V3",
            asset: "USDC",
            apy: "3.8%",
            allocation: 50,
            description: "Supply USDC to Aave for stable yields"
          },
          {
            protocol: "Aave V3",
            asset: "USDT",
            apy: "4.2%",
            allocation: 30,
            description: "Supply USDT for slightly higher yields"
          },
          {
            protocol: "Aave V3",
            asset: "DAI",
            apy: "3.5%",
            allocation: 20,
            description: "Decentralized stablecoin for diversification"
          }
        ]
      },
      {
        name: "Balanced",
        description: "Moderate risk with better returns. Good for long-term savings.",
        targetAPY: "5-8%",
        riskLevel: "medium",
        color: "#3B82F6",
        icon: "⚖️",
        strategies: [
          {
            protocol: "Aave V3",
            asset: "USDC",
            apy: "3.8%",
            allocation: 40,
            description: "Core stable position"
          },
          {
            protocol: "Aave V3",
            asset: "WETH",
            apy: "2.1%",
            allocation: 20,
            description: "ETH exposure with lending yield"
          },
          {
            protocol: "Aave V3",
            asset: "WMATIC",
            apy: "6.5%",
            allocation: 20,
            description: "Higher yield with MATIC"
          },
          {
            protocol: "1inch Fusion",
            asset: "Mixed",
            apy: "7.2%",
            allocation: 20,
            description: "Optimized swaps for better entry"
          }
        ]
      },
      {
        name: "Growth",
        description: "Higher risk, higher reward. For experienced DeFi users.",
        targetAPY: "8-15%",
        riskLevel: "high",
        color: "#F59E0B",
        icon: "🚀",
        strategies: [
          {
            protocol: "Aave V3",
            asset: "WETH",
            apy: "2.1%",
            allocation: 30,
            description: "ETH as collateral"
          },
          {
            protocol: "Aave V3",
            asset: "WMATIC",
            apy: "6.5%",
            allocation: 30,
            description: "High yield native token"
          },
          {
            protocol: "Leverage",
            asset: "Recursive",
            apy: "12%",
            allocation: 20,
            description: "Leveraged stablecoin strategy"
          },
          {
            protocol: "1inch LP",
            asset: "USDC/USDT",
            apy: "15%",
            allocation: 20,
            description: "Liquidity provision on 1inch"
          }
        ]
      }
    ];

    return profiles;
  }

  // Get supported markets for a chain
  getMarkets(): Record<string, any> {
    return STABLECOIN_MARKETS[this.chainId] || {};
  }

  // Calculate deposit allocation based on risk profile
  calculateAllocation(amount: number, profile: RiskProfile): Array<{
    protocol: string;
    asset: string;
    amount: number;
    address?: string;
  }> {
    const allocations = profile.strategies.map(strategy => {
      const allocationAmount = (amount * strategy.allocation) / 100;
      const marketData = this.getMarkets()[strategy.asset];
      
      return {
        protocol: strategy.protocol,
        asset: strategy.asset,
        amount: allocationAmount,
        address: marketData?.address
      };
    });

    return allocations;
  }

  // Get Aave pool addresses for current chain
  getAaveAddresses() {
    return AAVE_ADDRESSES[this.chainId];
  }

  // Estimate gas for Aave deposit
  async estimateDepositGas(asset: string, amount: string): Promise<string> {
    // Typical Aave deposit gas usage
    // Supply: ~150k-200k gas
    // Approval: ~50k gas
    return "250000"; // Conservative estimate
  }

  // Get current supply APY for an asset
  async getSupplyAPY(asset: string): Promise<string> {
    // In production, this would query Aave's data provider
    // For now, return mock data
    const apys: Record<string, string> = {
      USDC: "3.8",
      USDT: "4.2",
      DAI: "3.5",
      WETH: "2.1",
      WMATIC: "6.5"
    };
    
    return apys[asset] || "0";
  }

  // Build transaction data for Aave deposit
  buildDepositTx(asset: string, amount: string, onBehalfOf: string): {
    to: string;
    data: string;
    value: string;
  } {
    const aaveAddresses = this.getAaveAddresses();
    if (!aaveAddresses) {
      throw new Error(`Aave not supported on chain ${this.chainId}`);
    }

    const tokenConfig = STABLECOIN_MARKETS[this.chainId]?.[asset];
    if (!tokenConfig) {
      throw new Error(`Token ${asset} not supported on chain ${this.chainId}`);
    }

    // Encode the Aave Pool.supply() function call
    // function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
    // Function selector: 0x617ba037
    const functionSelector = "0x617ba037";
    
    // Encode parameters:
    // - asset address (32 bytes)
    // - amount (32 bytes) 
    // - onBehalfOf address (32 bytes)
    // - referralCode (32 bytes) - we use 0
    
    const assetAddress = tokenConfig.address.slice(2).padStart(64, '0'); // Remove 0x and pad
    const amountHex = BigInt(amount).toString(16).padStart(64, '0');
    const onBehalfOfAddress = onBehalfOf.slice(2).padStart(64, '0'); // Remove 0x and pad
    const referralCode = "0".padStart(64, '0');
    
    const encodedData = functionSelector + assetAddress + amountHex + onBehalfOfAddress + referralCode;
    
    console.log('🏗️ Aave deposit transaction details:', {
      pool: aaveAddresses.pool,
      asset: tokenConfig.address,
      amount,
      onBehalfOf,
      encodedData
    });

    return {
      to: aaveAddresses.pool,
      data: encodedData,
      value: "0"
    };
  }
} 