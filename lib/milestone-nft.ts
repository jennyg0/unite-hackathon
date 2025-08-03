import { 
  parseUnits,
  createPublicClient,
  http,
  type Address 
} from 'viem';
import { polygon, base, mainnet, gnosis } from 'viem/chains';
import { get1inchRPCUrl } from './1inch-rpc';

// Contract ABIs (simplified)
const MILESTONE_NFT_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'milestoneType', type: 'uint8' },
      { name: 'value', type: 'uint256' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'metadataURI', type: 'string' },
    ],
    name: 'mintMilestone',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
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
  {
    name: 'hasEarnedMilestone',
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
  100: {
    nft: '0x0a3C9A29C6C8462F4FBe17B5690542bb0C8C4Ce7' as Address, // Deployed on Gnosis
  },
  137: {
    nft: '0xcEa193BF20a0CdA82b7C51443ec9547345156664' as Address, // Deployed on Polygon
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
  public publicClient: any;
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
    
    const chain = chainId === 100 ? gnosis : chainId === 137 ? polygon : chainId === 8453 ? base : mainnet;
    
    // Fallback to standard Gnosis RPC due to 1inch proxy issues
    const rpcUrl = chainId === 100 ? 'https://rpc.gnosischain.com' : `/api/1inch-rpc/${chainId}`;
    
    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });
    
    console.log(`🌐 Public client initialized with RPC: ${rpcUrl} for chain ${chainId}`);
  }

  setWalletClient(walletClient: any) {
    this.walletClient = walletClient;
  }

  get contractAddress(): Address {
    return this.nftAddress;
  }

  // Get user's milestone data using 1inch NFT API
  async getUserData(user: Address): Promise<UserMilestoneData> {
    try {
      // Check cache first to avoid rate limiting
      const cacheKey = `nft-data-${user}-${this.chainId}`;
      const cached = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}-time`);
      
      // Use cache if less than 2 minutes old
      if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 120000) {
        console.log('📦 Using cached NFT data for:', user);
        const cachedData = JSON.parse(cached);
        console.log('📦 Cached NFT data:', cachedData);
        return cachedData;
      }
      
      console.log('🚀 Making fresh NFT API request...');

      // Fetch user's NFTs from our collection using 1inch API
      // Use POST to properly send array parameters like axios does
      const nftResponse = await fetch(`/api/1inch/nft/v2/byaddress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: user,
          chainIds: [this.chainId],
          // Don't send contractAddress - 1inch API doesn't accept it for /byaddress endpoint
          // We filter by contract address in the response instead
        }),
      });
      
      console.log('🔍 Fetching NFTs for:', user, 'on chain:', this.chainId, 'contract:', this.nftAddress);
      
      let milestones: Milestone[] = [];
      
      if (nftResponse.status === 429) {
        console.warn('⚠️ Rate limited by 1inch API, using fallback...');
        // Return cached data if available, otherwise empty state
        if (cached) {
          return JSON.parse(cached);
        }
        throw new Error('Rate limited and no cached data available');
      }
      
      console.log('📡 NFT API response status:', nftResponse.status);
      
      if (nftResponse.ok) {
        const nftData = await nftResponse.json();
        console.log('📦 NFT API response:', nftData);
        console.log('📊 Total NFTs found:', nftData.assets?.length || 0);
        
        // Parse milestone NFTs from the response (1inch API returns "assets", not "result")
        milestones = (nftData.assets || [])
          .filter((token: any) => token.asset_contract?.address?.toLowerCase() === this.nftAddress.toLowerCase())
          .map((token: any) => {
            const info = this.getMilestoneInfo(this.getMilestoneTypeFromName(token.name || ''));
            return {
              id: Number(token.token_id),
              type: this.getMilestoneTypeFromName(token.name || ''),
              value: 1, // Default value since metadata might not be available
              title: token.name || 'Milestone NFT',
              description: 'Achievement unlocked!',
              timestamp: new Date(), // Use current date as fallback
              imageUrl: token.image_url,
              emoji: info.emoji,
            };
          });
      } else {
        console.warn('⚠️ NFT API request failed:', nftResponse.status, nftResponse.statusText);
        const errorText = await nftResponse.text();
        console.error('❌ NFT API error response:', errorText);
      }

      // For now, return mock progress data - this could come from your backend/database
      // or be calculated based on the earned NFTs
      const userData = {
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

      // Cache the successful response
      localStorage.setItem(cacheKey, JSON.stringify(userData));
      localStorage.setItem(`${cacheKey}-time`, Date.now().toString());
      
      return userData;
    } catch (error) {
      console.error('Error fetching user milestone data:', error);
      throw error;
    }
  }

  // Check if user has specific milestone by querying the contract directly
  async hasAchievedMilestone(user: Address, milestoneType: MilestoneType): Promise<boolean> {
    try {
      // First try direct contract call for most accurate data
      const hasAchieved = await this.publicClient.readContract({
        address: this.nftAddress,
        abi: MILESTONE_NFT_ABI,
        functionName: 'hasEarnedMilestone',
        args: [user, milestoneType],
      });
      
      console.log(`📋 Contract check - User ${user} milestone ${milestoneType}:`, hasAchieved);
      return hasAchieved as boolean;
    } catch (contractError) {
      console.warn('Contract check failed, falling back to NFT API:', contractError);
      
      // Fallback to 1inch API method
      try {
        const userData = await this.getUserData(user);
        return userData.milestones.some(m => m.type === milestoneType);
      } catch (apiError) {
        console.error('Both contract and API checks failed:', apiError);
        return false;
      }
    }
  }

  // Mint milestone NFT (called by backend when milestone is achieved)
  async mintMilestone(to: Address, milestoneType: MilestoneType, metadata: any): Promise<string> {
    if (!this.walletClient) throw new Error('Wallet client not set');

    // Create simple metadata URI (for hackathon, we'll use a simple JSON string)
    const metadataJson = {
      name: metadata.title,
      description: metadata.description,
      image: `https://api.dicebear.com/7.x/shapes/svg?seed=${milestoneType}`,
      attributes: [
        { trait_type: "Milestone Type", value: MilestoneType[milestoneType] },
        { trait_type: "Value", value: metadata.value },
        { trait_type: "Achievement Date", value: Math.floor(Date.now() / 1000) }
      ]
    };
    
    console.log('📋 Metadata JSON:', metadataJson);
    
    const metadataURI = `data:application/json;base64,${Buffer.from(JSON.stringify(metadataJson)).toString('base64')}`;
    
    console.log('📋 Metadata URI length:', metadataURI.length);
    console.log('📋 Metadata URI preview:', metadataURI.substring(0, 100) + '...');

    console.log('📤 Final contract call arguments:');
    console.log('  address:', this.nftAddress);
    console.log('  to:', to);
    console.log('  milestoneType:', milestoneType);
    console.log('  value:', BigInt(metadata.value || 0));
    console.log('  title:', metadata.title);
    console.log('  description:', metadata.description);
    console.log('  metadataURI length:', metadataURI.length);

    try {
      console.log('🎯 Minting NFT...');
      
      const { request } = await this.publicClient.simulateContract({
        address: this.nftAddress,
        abi: MILESTONE_NFT_ABI,
        functionName: 'mintMilestone',
        args: [to, milestoneType, BigInt(metadata.value || 0), metadata.title, metadata.description, metadataURI],
        account: this.walletClient.account,
      });

      console.log('✅ Simulation successful, executing transaction...');
      const hash = await this.walletClient.writeContract(request);
      return hash;
    } catch (simulateError: any) {
      console.error('❌ Contract simulation failed:', simulateError);
      
      // Try to decode the specific error
      if (simulateError?.data === '0x118cdaa7') {
        console.error('🔍 Error 0x118cdaa7 detected - this is likely a custom revert');
        
        // Check if this matches any known Solidity error signatures
        console.error('💡 Possible causes:');
        console.error('  - Contract is paused');
        console.error('  - Invalid milestone type (should be 0-4)');
        console.error('  - Milestone already earned by this user');
        console.error('  - Contract access control issue');
        console.error('  - Gas estimation failure');
        
        // Let's try to call the hasEarnedMilestone function directly to debug
        try {
          const alreadyEarned = await this.publicClient.readContract({
            address: this.nftAddress,
            abi: MILESTONE_NFT_ABI,
            functionName: 'hasEarnedMilestone',
            args: [to, milestoneType],
          });
          console.error('🔍 hasEarnedMilestone check:', alreadyEarned);
        } catch (readError) {
          console.error('🔍 Failed to read hasEarnedMilestone:', readError);
        }
        
        throw new Error(`Contract revert with signature 0x118cdaa7. Check console for detailed analysis.`);
      }
      
      // For other errors, provide more context
      if (simulateError?.message) {
        console.error('📝 Error message:', simulateError.message);
      }
      if (simulateError?.cause) {
        console.error('📝 Error cause:', simulateError.cause);
      }
      if (simulateError?.data) {
        console.error('📝 Error data:', simulateError.data);
      }
      
      throw simulateError;
    }
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