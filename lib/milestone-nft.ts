import { 
  parseUnits,
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

// Contract addresses per chain
const CONTRACT_ADDRESSES: Record<number, { nft: Address; tracker: Address }> = {
  137: {
    nft: '0x...' as Address,
    tracker: '0x...' as Address,
  },
  8453: {
    nft: '0x...' as Address,
    tracker: '0x...' as Address,
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
  private trackerAddress: Address;

  constructor(chainId: number = 137) {
    this.chainId = chainId;
    const addresses = CONTRACT_ADDRESSES[chainId];
    if (!addresses) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    
    this.nftAddress = addresses.nft;
    this.trackerAddress = addresses.tracker;
    
    const chain = chainId === 137 ? polygon : chainId === 8453 ? base : mainnet;
    
    this.publicClient = createPublicClient({
      chain,
      transport: http(),
    });
  }

  setWalletClient(walletClient: any) {
    this.walletClient = walletClient;
  }

  // Get user's milestone data
  async getUserData(user: Address): Promise<UserMilestoneData> {
    // Get basic user data from tracker
    const userData = await this.publicClient.readContract({
      address: this.trackerAddress,
      abi: MILESTONE_TRACKER_ABI,
      functionName: 'userData',
      args: [user],
    });

    // Get user's NFT token IDs
    const tokenIds = await this.publicClient.readContract({
      address: this.nftAddress,
      abi: MILESTONE_NFT_ABI,
      functionName: 'getUserMilestones',
      args: [user],
    });

    // Fetch metadata for each NFT
    const milestones: Milestone[] = await Promise.all(
      tokenIds.map(async (tokenId: bigint) => {
        const uri = await this.publicClient.readContract({
          address: this.nftAddress,
          abi: MILESTONE_NFT_ABI,
          functionName: 'tokenURI',
          args: [tokenId],
        });

        // Parse base64 JSON metadata
        const metadata = this.parseTokenURI(uri);
        const info = this.getMilestoneInfo(this.getMilestoneTypeFromName(metadata.name));
        
        return {
          id: Number(tokenId),
          type: this.getMilestoneTypeFromName(metadata.name),
          value: metadata.attributes?.find((a: any) => a.trait_type === 'Value')?.value || 0,
          title: metadata.name,
          description: metadata.description,
          timestamp: new Date(Number(metadata.attributes?.find((a: any) => a.trait_type === 'Achievement Date')?.value || 0) * 1000),
          imageUrl: metadata.image,
          emoji: info.emoji,
        };
      })
    );

    return {
      totalDeposited: Number(userData[0]) / 1e6, // Convert from USDC decimals
      firstDepositTime: userData[1] > 0 ? new Date(Number(userData[1]) * 1000) : null,
      lastDepositTime: userData[2] > 0 ? new Date(Number(userData[2]) * 1000) : null,
      depositStreak: Number(userData[3]),
      longestStreak: Number(userData[4]),
      referralCount: Number(userData[5]),
      educationProgress: Number(userData[6]),
      financialFreedomTarget: Number(userData[7]) / 1e6,
      milestones,
    };
  }

  // Check if user has specific milestone
  async hasAchievedMilestone(user: Address, milestoneType: MilestoneType): Promise<boolean> {
    return await this.publicClient.readContract({
      address: this.nftAddress,
      abi: MILESTONE_NFT_ABI,
      functionName: 'hasAchievedMilestone',
      args: [user, milestoneType],
    });
  }

  // Record a deposit (called by savings contract or admin)
  async recordDeposit(user: Address, amountUSD: number): Promise<string> {
    if (!this.walletClient) throw new Error('Wallet client not set');

    const amount = parseUnits(amountUSD.toString(), 6); // USDC has 6 decimals

    const { request } = await this.publicClient.simulateContract({
      address: this.trackerAddress,
      abi: MILESTONE_TRACKER_ABI,
      functionName: 'recordDeposit',
      args: [user, amount],
      account: this.walletClient.account,
    });

    const hash = await this.walletClient.writeContract(request);
    return hash;
  }

  // Record education progress
  async recordEducationProgress(user: Address, moduleId: number): Promise<string> {
    if (!this.walletClient) throw new Error('Wallet client not set');

    const { request } = await this.publicClient.simulateContract({
      address: this.trackerAddress,
      abi: MILESTONE_TRACKER_ABI,
      functionName: 'recordEducationProgress',
      args: [user, BigInt(moduleId)],
      account: this.walletClient.account,
    });

    const hash = await this.walletClient.writeContract(request);
    return hash;
  }

  // Set financial freedom target
  async setFinancialFreedomTarget(user: Address, targetUSD: number): Promise<string> {
    if (!this.walletClient) throw new Error('Wallet client not set');

    const target = parseUnits(targetUSD.toString(), 6);

    const { request } = await this.publicClient.simulateContract({
      address: this.trackerAddress,
      abi: MILESTONE_TRACKER_ABI,
      functionName: 'setFinancialFreedomTarget',
      args: [user, target],
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
    };
    
    return info[type];
  }
} 