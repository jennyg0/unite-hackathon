import { 
  parseUnits,
  createPublicClient,
  http,
  type Address 
} from 'viem';
import { polygon, base, mainnet } from 'viem/chains';
import { get1inchRPC } from './1inch-rpc';

// Contract ABIs (simplified)
const MILESTONE_NFT_ABI = [
  {
    name: 'mintMilestone',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'milestoneType', type: 'uint8' },
      { name: 'value', type: 'uint256' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'getUserMilestones',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'hasAchievedMilestone',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'milestoneType', type: 'uint8' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
];

const MILESTONE_TRACKER_ABI = [
  {
    name: 'recordDeposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amountUSD', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'recordReferral',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'referrer', type: 'address' },
      { name: 'referred', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'recordEducationProgress',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'moduleId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'setFinancialFreedomTarget',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'target', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'userData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'totalDeposited', type: 'uint256' },
      { name: 'firstDepositTime', type: 'uint256' },
      { name: 'lastDepositTime', type: 'uint256' },
      { name: 'depositStreak', type: 'uint256' },
      { name: 'longestStreak', type: 'uint256' },
      { name: 'referralCount', type: 'uint256' },
      { name: 'educationProgress', type: 'uint256' },
      { name: 'financialFreedomTarget', type: 'uint256' },
    ],
  },
];

// Contract addresses per chain - Only need ONE NFT collection
const CONTRACT_ADDRESSES: Record<number, { nft: Address }> = {
  137: {
    nft: '0x0000000000000000000000000000000000000000' as Address, // Replace with your deployed NFT contract
  },
  8453: {
    nft: '0x0000000000000000000000000000000000000000' as Address,
  },
};

export enum MilestoneType {
  FIRST_DEPOSIT = 0,
  SAVINGS_STREAK = 1,
  AMOUNT_SAVED = 2,
  FINANCIAL_FREEDOM = 3,
  EDUCATION_COMPLETE = 4,
  REFERRAL_CHAMPION = 5,
  EARLY_ADOPTER = 6,
  WHALE_SAVER = 7,
  ENS_IDENTITY = 8,
}

export interface Milestone {
  id: number;
  type: MilestoneType;
  value: number;
  title: string;
  description: string;
  timestamp: Date;
  imageUrl?: string;
  emoji?: string;
}

export interface UserMilestoneData {
  totalDeposited: number;
  firstDepositTime: Date | null;
  lastDepositTime: Date | null;
  depositStreak: number;
  longestStreak: number;
  referralCount: number;
  educationProgress: number;
  financialFreedomTarget: number;
  milestones: Milestone[];
}

export class MilestoneSDK {
  private publicClient: any;
  private walletClient: any;
  private chainId: number;
  private nftAddress: Address;

  constructor(chainId: number = 137) {
    this.chainId = chainId;
    const addresses = CONTRACT_ADDRESSES[chainId];
    if (!addresses) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    
    this.nftAddress = addresses.nft;
    
    const chain = chainId === 137 ? polygon : chainId === 8453 ? base : mainnet;
    
    this.publicClient = createPublicClient({
      chain,
      transport: http(),
    });
  }

  setWalletClient(walletClient: any) {
    this.walletClient = walletClient;
  }

  // Get user's milestone data using 1inch NFT API
  async getUserData(user: Address): Promise<UserMilestoneData> {
    try {
      // Fetch user's NFTs from our collection using 1inch API
      const nftResponse = await fetch(`/api/1inch/nft/v2/byaddress/${user}?contractAddress=${this.nftAddress}&chainId=${this.chainId}`);
      
      let milestones: Milestone[] = [];
      
      if (nftResponse.ok) {
        const nftData = await nftResponse.json();
        
        // Parse milestone NFTs from the response
        milestones = (nftData.result || [])
          .filter((token: any) => token.contractAddress?.toLowerCase() === this.nftAddress.toLowerCase())
          .map((token: any) => {
            const info = this.getMilestoneInfo(this.getMilestoneTypeFromName(token.name || ''));
            return {
              id: Number(token.tokenId),
              type: this.getMilestoneTypeFromName(token.name || ''),
              value: token.metadata?.attributes?.find((a: any) => a.trait_type === 'Value')?.value || 0,
              title: token.name || 'Milestone NFT',
              description: token.metadata?.description || 'Achievement unlocked!',
              timestamp: new Date(Number(token.metadata?.attributes?.find((a: any) => a.trait_type === 'Achievement Date')?.value || Date.now() / 1000) * 1000),
              imageUrl: token.metadata?.image,
              emoji: info.emoji,
            };
          });
      }

      // For now, return mock progress data - this could come from your backend/database
      // or be calculated based on the earned NFTs
      return {
        totalDeposited: 0, // Calculate from deposit NFTs or backend
        firstDepositTime: null,
        lastDepositTime: null,
        depositStreak: 0,
        longestStreak: 0,
        referralCount: 0,
        educationProgress: milestones.some(m => m.type === MilestoneType.EDUCATION_COMPLETE) ? 100 : 0,
        financialFreedomTarget: 10000,
        milestones,
      };
    } catch (error) {
      console.error('Error fetching user milestone data:', error);
      throw error;
    }
  }

  // Check if user has specific milestone by querying their NFTs
  async hasAchievedMilestone(user: Address, milestoneType: MilestoneType): Promise<boolean> {
    try {
      const userData = await this.getUserData(user);
      return userData.milestones.some(m => m.type === milestoneType);
    } catch (error) {
      console.error('Error checking milestone:', error);
      return false;
    }
  }

  // Mint milestone NFT (called by backend when milestone is achieved)
  async mintMilestone(to: Address, milestoneType: MilestoneType, metadata: any): Promise<string> {
    if (!this.walletClient) throw new Error('Wallet client not set');

    const { request } = await this.publicClient.simulateContract({
      address: this.nftAddress,
      abi: MILESTONE_NFT_ABI,
      functionName: 'mintMilestone',
      args: [to, milestoneType, BigInt(metadata.value || 0), metadata.title, metadata.description],
      account: this.walletClient.account,
    });

    const hash = await this.walletClient.writeContract(request);
    return hash;
  }

  // Helper to parse token URI
  private parseTokenURI(uri: string): any {
    if (uri.startsWith('data:application/json;base64,')) {
      const base64 = uri.replace('data:application/json;base64,', '');
      const json = Buffer.from(base64, 'base64').toString('utf-8');
      return JSON.parse(json);
    }
    return {};
  }

  // Helper to get milestone type from name
  private getMilestoneTypeFromName(name: string): MilestoneType {
    if (name.includes('First Deposit')) return MilestoneType.FIRST_DEPOSIT;
    if (name.includes('Streak')) return MilestoneType.SAVINGS_STREAK;
    if (name.includes('Saved')) return MilestoneType.AMOUNT_SAVED;
    if (name.includes('Freedom')) return MilestoneType.FINANCIAL_FREEDOM;
    if (name.includes('Education')) return MilestoneType.EDUCATION_COMPLETE;
    if (name.includes('Referral')) return MilestoneType.REFERRAL_CHAMPION;
    if (name.includes('Early')) return MilestoneType.EARLY_ADOPTER;
    if (name.includes('Whale')) return MilestoneType.WHALE_SAVER;
    if (name.includes('ENS') || name.includes('Identity')) return MilestoneType.ENS_IDENTITY;
    return MilestoneType.FIRST_DEPOSIT;
  }

  // Get milestone info
  getMilestoneInfo(type: MilestoneType): { emoji: string; color: string; category: string } {
    const info = {
      [MilestoneType.FIRST_DEPOSIT]: { emoji: '💰', color: '#10B981', category: 'Getting Started' },
      [MilestoneType.SAVINGS_STREAK]: { emoji: '🔥', color: '#3B82F6', category: 'Consistency' },
      [MilestoneType.AMOUNT_SAVED]: { emoji: '💎', color: '#F59E0B', category: 'Savings Goals' },
      [MilestoneType.FINANCIAL_FREEDOM]: { emoji: '🎯', color: '#8B5CF6', category: 'Freedom Progress' },
      [MilestoneType.EDUCATION_COMPLETE]: { emoji: '🎓', color: '#EC4899', category: 'Learning' },
      [MilestoneType.REFERRAL_CHAMPION]: { emoji: '🤝', color: '#14B8A6', category: 'Community' },
      [MilestoneType.EARLY_ADOPTER]: { emoji: '🚀', color: '#F97316', category: 'Special' },
      [MilestoneType.WHALE_SAVER]: { emoji: '🐋', color: '#6366F1', category: 'Elite' },
      [MilestoneType.ENS_IDENTITY]: { emoji: '🌐', color: '#3B82F6', category: 'Web3 Identity' },
    };
    
    return info[type];
  }
} 