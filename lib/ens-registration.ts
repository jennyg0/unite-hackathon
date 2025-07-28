import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

// ENS Contract addresses on mainnet
const ENS_REGISTRAR_CONTROLLER = '0x253553366Da8546fC250F225fe3d25d0C782303b';
const ENS_BASE_REGISTRAR = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85';
const ENS_RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63';

// Minimum registration duration (1 year in seconds)
const MIN_REGISTRATION_DURATION = 31536000;

// ENS Registration ABI (simplified)
const ENS_CONTROLLER_ABI = [
  {
    name: 'available',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'name', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'rentPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'duration', type: 'uint256' },
    ],
    outputs: [
      {
        components: [
          { name: 'base', type: 'uint256' },
          { name: 'premium', type: 'uint256' },
        ],
        name: 'price',
        type: 'tuple',
      },
    ],
  },
  {
    name: 'makeCommitment',
    type: 'function',
    stateMutability: 'pure',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'duration', type: 'uint256' },
      { name: 'secret', type: 'bytes32' },
      { name: 'resolver', type: 'address' },
      { name: 'data', type: 'bytes[]' },
      { name: 'reverseRecord', type: 'bool' },
      { name: 'ownerControlledFuses', type: 'uint16' },
    ],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'commit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'register',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'duration', type: 'uint256' },
      { name: 'secret', type: 'bytes32' },
      { name: 'resolver', type: 'address' },
      { name: 'data', type: 'bytes[]' },
      { name: 'reverseRecord', type: 'bool' },
      { name: 'ownerControlledFuses', type: 'uint16' },
    ],
    outputs: [],
  },
];

export interface ENSRegistrationParams {
  name: string;
  owner: string;
  duration?: number;
  resolver?: string;
}

export interface ENSPrice {
  base: bigint;
  premium: bigint;
  total: bigint;
  totalEth: string;
}

// Generate a random secret for commitment
export function generateSecret(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')}` as `0x${string}`;
}

// Check if a name is available
export async function checkENSAvailable(
  name: string,
  publicClient: any
): Promise<boolean> {
  try {
    const normalizedName = normalize(name);
    const result = await publicClient.readContract({
      address: ENS_REGISTRAR_CONTROLLER,
      abi: ENS_CONTROLLER_ABI,
      functionName: 'available',
      args: [normalizedName],
    });
    return result as boolean;
  } catch (error) {
    console.error('Error checking ENS availability:', error);
    return false;
  }
}

// Get registration price
export async function getENSPrice(
  name: string,
  duration: number = MIN_REGISTRATION_DURATION,
  publicClient: any
): Promise<ENSPrice> {
  try {
    const normalizedName = normalize(name);
    const result = await publicClient.readContract({
      address: ENS_REGISTRAR_CONTROLLER,
      abi: ENS_CONTROLLER_ABI,
      functionName: 'rentPrice',
      args: [normalizedName, duration],
    });

    const base = result.base as bigint;
    const premium = result.premium as bigint;
    const total = base + premium;

    return {
      base,
      premium,
      total,
      totalEth: (Number(total) / 1e18).toFixed(4),
    };
  } catch (error) {
    console.error('Error getting ENS price:', error);
    throw error;
  }
}

// Create commitment for ENS registration (step 1)
export async function createENSCommitment(
  params: ENSRegistrationParams,
  secret: `0x${string}`,
  publicClient: any
): Promise<`0x${string}`> {
  const normalizedName = normalize(params.name);
  const duration = params.duration || MIN_REGISTRATION_DURATION;
  const resolver = params.resolver || ENS_RESOLVER;

  const commitment = await publicClient.readContract({
    address: ENS_REGISTRAR_CONTROLLER,
    abi: ENS_CONTROLLER_ABI,
    functionName: 'makeCommitment',
    args: [
      normalizedName,
      params.owner as `0x${string}`,
      duration,
      secret,
      resolver as `0x${string}`,
      [],
      true, // reverseRecord
      0, // ownerControlledFuses
    ],
  });

  return commitment as `0x${string}`;
}

// Submit commitment transaction (step 1)
export async function submitCommitment(
  commitment: `0x${string}`,
  walletClient: any
): Promise<`0x${string}`> {
  const hash = await walletClient.writeContract({
    address: ENS_REGISTRAR_CONTROLLER,
    abi: ENS_CONTROLLER_ABI,
    functionName: 'commit',
    args: [commitment],
  });

  return hash;
}

// Register ENS name (step 2 - after waiting period)
export async function registerENSName(
  params: ENSRegistrationParams,
  secret: `0x${string}`,
  price: bigint,
  walletClient: any
): Promise<`0x${string}`> {
  const normalizedName = normalize(params.name);
  const duration = params.duration || MIN_REGISTRATION_DURATION;
  const resolver = params.resolver || ENS_RESOLVER;

  // Add 10% buffer to price for gas fluctuations
  const valueWithBuffer = (price * BigInt(110)) / BigInt(100);

  const hash = await walletClient.writeContract({
    address: ENS_REGISTRAR_CONTROLLER,
    abi: ENS_CONTROLLER_ABI,
    functionName: 'register',
    args: [
      normalizedName,
      params.owner as `0x${string}`,
      duration,
      secret,
      resolver as `0x${string}`,
      [],
      true, // reverseRecord
      0, // ownerControlledFuses
    ],
    value: valueWithBuffer,
  });

  return hash;
}

// Full registration flow
export interface RegistrationState {
  step: 'idle' | 'checking' | 'committing' | 'waiting' | 'registering' | 'complete' | 'error';
  commitmentHash?: string;
  registrationHash?: string;
  secret?: `0x${string}`;
  commitment?: `0x${string}`;
  error?: string;
  waitEndTime?: number;
}

// The minimum wait time between commitment and registration (60 seconds)
export const COMMITMENT_WAIT_TIME = 60; 