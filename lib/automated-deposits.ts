import { 
  createPublicClient, 
  createWalletClient, 
  custom, 
  http,
  parseUnits,
  formatUnits,
  type Address 
} from 'viem';
import { polygon, base, mainnet } from 'viem/chains';

// Contract ABI (simplified)
const AUTOMATED_DEPOSITS_ABI = [
  {
    name: 'createSchedule',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'frequency', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    outputs: [{ name: 'scheduleId', type: 'uint256' }],
  },
  {
    name: 'executeDeposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'scheduleId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'updateSchedule',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'scheduleId', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
    ],
    outputs: [],
  },
  {
    name: 'schedules',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'scheduleId', type: 'uint256' },
    ],
    outputs: [
      { name: 'user', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'frequency', type: 'uint256' },
      { name: 'nextDeposit', type: 'uint256' },
      { name: 'totalDeposited', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'recipient', type: 'address' },
    ],
  },
  {
    name: 'userScheduleCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

// ERC20 ABI for approvals
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

// Contract addresses per chain - UPDATED WITH DEPLOYED ADDRESS
const CONTRACT_ADDRESSES: Record<number, Address> = {
  137: '0x40D8364e7FB4BF12870f5ADBA5DAe206354bD6ED', // AutomatedDeposits deployed on Polygon
  8453: '0x0000000000000000000000000000000000000000', // TODO: Replace with deployed AutomatedDeposits address on Base
  1: '0x0000000000000000000000000000000000000000', // TODO: Replace with deployed AutomatedDeposits address on Mainnet
};

// Default recipient addresses (Aave V3 Pools where deposits go)
const DEFAULT_RECIPIENTS: Record<number, Address> = {
  137: '0x794a61358D6845594F94dc1DB02A252b5b4814aD', // Aave V3 Pool on Polygon
  8453: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', // Aave V3 Pool on Base
  1: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // Aave V3 Pool on Mainnet
};

export interface DepositSchedule {
  user: Address;
  token: Address;
  amount: bigint;
  frequency: bigint;
  nextDeposit: bigint;
  totalDeposited: bigint;
  isActive: boolean;
  recipient: Address;
}

export interface CreateScheduleParams {
  token: Address;
  amount: string; // Human readable amount
  decimals: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  recipient?: Address;
}

export class AutomatedDepositsSDK {
  private publicClient: any;
  private walletClient: any;
  private chainId: number;
  private contractAddress: Address;

  constructor(chainId: number = 137) {
    this.chainId = chainId;
    this.contractAddress = CONTRACT_ADDRESSES[chainId] || '0x0';
    
    const chain = chainId === 137 ? polygon : chainId === 8453 ? base : mainnet;
    
    this.publicClient = createPublicClient({
      chain,
      transport: http(),
    });
  }

  setWalletClient(walletClient: any) {
    this.walletClient = walletClient;
  }

  // Convert frequency to seconds
  private getFrequencyInSeconds(frequency: CreateScheduleParams['frequency']): bigint {
    const frequencies = {
      daily: BigInt(86400), // 24 hours
      weekly: BigInt(604800), // 7 days
      biweekly: BigInt(1209600), // 14 days
      monthly: BigInt(2592000), // 30 days
    };
    return frequencies[frequency];
  }

  // Check if token is approved
  async checkAllowance(
    token: Address,
    owner: Address
  ): Promise<bigint> {
    const allowance = await this.publicClient.readContract({
      address: token,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner, this.contractAddress],
    });
    return allowance as bigint;
  }

  // Approve token spending
  async approveToken(
    token: Address,
    amount: bigint
  ): Promise<string> {
    if (!this.walletClient) throw new Error('Wallet client not set');

    const { request } = await this.publicClient.simulateContract({
      address: token,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [this.contractAddress, amount],
      account: this.walletClient.account,
    });

    const hash = await this.walletClient.writeContract(request);
    return hash;
  }

  // Create a new deposit schedule
  async createSchedule(params: CreateScheduleParams): Promise<{
    hash: string;
    scheduleId: number;
  }> {
    if (!this.walletClient) throw new Error('Wallet client not set');

    const amount = parseUnits(params.amount, params.decimals);
    const frequency = this.getFrequencyInSeconds(params.frequency);
    const recipient = params.recipient || DEFAULT_RECIPIENTS[this.chainId];

    // Check allowance first
    const allowance = await this.checkAllowance(
      params.token,
      this.walletClient.account.address
    );

    // If not enough allowance, approve max uint256 for convenience
    if (allowance < amount) {
      await this.approveToken(
        params.token,
        BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
      );
    }

    // Create schedule
    const { request } = await this.publicClient.simulateContract({
      address: this.contractAddress,
      abi: AUTOMATED_DEPOSITS_ABI,
      functionName: 'createSchedule',
      args: [params.token, amount, frequency, recipient],
      account: this.walletClient.account,
    });

    const hash = await this.walletClient.writeContract(request);
    
    // Wait for transaction and get schedule ID from logs
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    
    // Parse logs to get schedule ID (simplified)
    const scheduleId = 0; // Would parse from event logs
    
    return { hash, scheduleId };
  }

  // Get user's schedules
  async getUserSchedules(user: Address): Promise<DepositSchedule[]> {
    const count = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: AUTOMATED_DEPOSITS_ABI,
      functionName: 'userScheduleCount',
      args: [user],
    });

    const schedules: DepositSchedule[] = [];
    
    for (let i = 0; i < Number(count); i++) {
      const schedule = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: AUTOMATED_DEPOSITS_ABI,
        functionName: 'schedules',
        args: [user, BigInt(i)],
      });
      
      schedules.push({
        user: schedule[0],
        token: schedule[1],
        amount: schedule[2],
        frequency: schedule[3],
        nextDeposit: schedule[4],
        totalDeposited: schedule[5],
        isActive: schedule[6],
        recipient: schedule[7],
      });
    }

    return schedules;
  }

  // Execute a deposit (can be called by anyone when time is ready)
  async executeDeposit(
    user: Address,
    scheduleId: number
  ): Promise<string> {
    if (!this.walletClient) throw new Error('Wallet client not set');

    const { request } = await this.publicClient.simulateContract({
      address: this.contractAddress,
      abi: AUTOMATED_DEPOSITS_ABI,
      functionName: 'executeDeposit',
      args: [user, BigInt(scheduleId)],
      account: this.walletClient.account,
    });

    const hash = await this.walletClient.writeContract(request);
    return hash;
  }

  // Update schedule status
  async updateSchedule(
    scheduleId: number,
    isActive: boolean
  ): Promise<string> {
    if (!this.walletClient) throw new Error('Wallet client not set');

    const { request } = await this.publicClient.simulateContract({
      address: this.contractAddress,
      abi: AUTOMATED_DEPOSITS_ABI,
      functionName: 'updateSchedule',
      args: [BigInt(scheduleId), isActive],
      account: this.walletClient.account,
    });

    const hash = await this.walletClient.writeContract(request);
    return hash;
  }

  // Helper to format schedule for display
  formatSchedule(schedule: DepositSchedule, tokenInfo: any) {
    return {
      amount: formatUnits(schedule.amount, tokenInfo.decimals),
      token: tokenInfo.symbol,
      frequency: this.getFrequencyLabel(schedule.frequency),
      nextDeposit: new Date(Number(schedule.nextDeposit) * 1000),
      totalDeposited: formatUnits(schedule.totalDeposited, tokenInfo.decimals),
      isActive: schedule.isActive,
    };
  }

  private getFrequencyLabel(seconds: bigint): string {
    const secondsNum = Number(seconds);
    if (secondsNum === 86400) return 'Daily';
    if (secondsNum === 604800) return 'Weekly';
    if (secondsNum === 1209600) return 'Bi-weekly';
    if (secondsNum === 2592000) return 'Monthly';
    return `Every ${secondsNum / 86400} days`;
  }
} 