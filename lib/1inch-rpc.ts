/**
 * Simple 1inch Web3 RPC Integration
 * Uses 1inch's Web3 RPC endpoint for blockchain interactions
 */

import { ethers } from 'ethers';

// 1inch Web3 RPC endpoint
const ONEINCH_RPC_URL = 'https://api.1inch.dev/web3/';

interface RPCRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

interface RPCResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

class OneInchRPC {
  private apiKey: string;
  private chainId: number;
  private rpcUrl: string;

  constructor(apiKey: string, chainId: number = 1) {
    this.apiKey = apiKey;
    this.chainId = chainId;
    // Use chain-specific RPC URL
    this.rpcUrl = ONEINCH_RPC_URL + chainId;
  }

  private async makeRPCRequest(method: string, params: any[] = []): Promise<any> {
    const request: RPCRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now(),
    };

    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.status} ${response.statusText}`);
      }

      const data: RPCResponse = await response.json();
      
      if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`);
      }

      return data.result;
    } catch (error) {
      console.error('1inch RPC request failed:', error);
      throw error;
    }
  }

  // Get ETH balance
  async getBalance(address: string): Promise<string> {
    const result = await this.makeRPCRequest('eth_getBalance', [address, 'latest']);
    return result;
  }

  // Get token balance
  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    // ERC20 balanceOf function signature: 0x70a08231
    const data = `0x70a08231000000000000000000000000${walletAddress.slice(2)}`;
    
    const result = await this.makeRPCRequest('eth_call', [
      {
        to: tokenAddress,
        data: data,
      },
      'latest'
    ]);

    return result;
  }

  // Send transaction
  async sendTransaction(transaction: {
    to: string;
    data?: string;
    value?: string;
    gas?: string;
    gasPrice?: string;
    from: string;
  }): Promise<string> {
    const result = await this.makeRPCRequest('eth_sendTransaction', [transaction]);
    return result;
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash: string): Promise<any> {
    const result = await this.makeRPCRequest('eth_getTransactionReceipt', [txHash]);
    return result;
  }

  // Get current gas price
  async getGasPrice(): Promise<string> {
    const result = await this.makeRPCRequest('eth_gasPrice', []);
    return result;
  }

  // Estimate gas
  async estimateGas(transaction: {
    to: string;
    data?: string;
    value?: string;
    from: string;
  }): Promise<string> {
    const result = await this.makeRPCRequest('eth_estimateGas', [transaction]);
    return result;
  }

  // Get block number
  async getBlockNumber(): Promise<string> {
    const result = await this.makeRPCRequest('eth_blockNumber', []);
    return result;
  }

  // Call contract function
  async call(transaction: {
    to: string;
    data: string;
  }, blockTag: string = 'latest'): Promise<string> {
    const result = await this.makeRPCRequest('eth_call', [transaction, blockTag]);
    return result;
  }
}

// Create providers for different chains using 1inch RPC
export function create1inchProvider(chainId: number = 1): ethers.JsonRpcProvider {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error('1inch API key not found. Please set ONEINCH_API_KEY');
  }

  const rpcUrl = `https://api.1inch.dev/web3/${chainId}`;
  
  // Create provider with auth headers
  const provider = new ethers.JsonRpcProvider(rpcUrl, chainId, {
    staticNetwork: ethers.Network.from(chainId),
    batchMaxCount: 1,
  });

  // Add auth header to all requests
  // Note: Ethers v6 provider options may differ
  // provider.options = {
  //   ...provider.options,
  //   headers: {
  //     'Authorization': `Bearer ${apiKey}`,
  //   },
  // };
console.log(provider, 'provider')
  return provider;
}

// Singleton instances for different chains
const rpcInstances: Record<number, OneInchRPC> = {};

export function get1inchRPC(chainId: number = 1): OneInchRPC {
  if (!rpcInstances[chainId]) {
    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) {
      throw new Error('1inch API key not found. Please set ONEINCH_API_KEY');
    }
    rpcInstances[chainId] = new OneInchRPC(apiKey, chainId);
  }
  return rpcInstances[chainId];
}

// Utility functions for common operations
export async function getETHBalance(address: string, chainId: number = 1): Promise<string> {
  const rpc = get1inchRPC(chainId);
  return rpc.getBalance(address);
}

export async function getUSDCBalance(address: string, chainId: number = 1): Promise<string> {
  const rpc = get1inchRPC(chainId);
  
  // USDC contract addresses for different chains
  const usdcAddresses: Record<number, string> = {
    1: '0xA0b86a33E6441be9e93ED5B69bb98D36a50Af3E5', // Ethereum
    137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon
    80001: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // Polygon Amoy testnet
  };

  const usdcAddress = usdcAddresses[chainId];
  if (!usdcAddress) {
    throw new Error(`USDC address not found for chain ${chainId}`);
  }

  return rpc.getTokenBalance(usdcAddress, address);
}

export async function getCurrentGasPrice(chainId: number = 1): Promise<string> {
  const rpc = get1inchRPC(chainId);
  return rpc.getGasPrice();
}

// Helper to format balance from wei to readable format
export function formatBalance(balance: string, decimals: number = 18): string {
  return ethers.formatUnits(balance, decimals);
}

// Helper to parse amount to wei
export function parseAmount(amount: string, decimals: number = 18): string {
  return ethers.parseUnits(amount, decimals).toString();
}