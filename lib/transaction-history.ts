/**
 * Transaction History Service
 * 
 * Manages user transaction history including deposits, earnings, and automated payments.
 * Includes demo data for hackathon presentation.
 */

export interface Transaction {
  id: string;
  type: 'deposit' | 'earning' | 'automated_deposit' | 'cross_chain_swap' | 'withdrawal' | 'ai_strategy';
  status: 'pending' | 'completed' | 'failed';
  amount: string;
  amountUsd: number;
  token: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI?: string;
  };
  fromChain?: {
    id: number;
    name: string;
  };
  toChain?: {
    id: number;
    name: string;
  };
  txHash?: string;
  timestamp: number;
  description: string;
  apy?: number;
  route?: string; // For cross-chain transactions
  protocols?: string[]; // For AI strategy transactions
}

export interface TransactionSummary {
  totalDeposited: number;
  totalEarned: number;
  totalTransactions: number;
  averageApy: number;
  bestMonth: {
    month: string;
    earnings: number;
  };
}

// Generate realistic demo transaction history
function generateDemoHistory(): Transaction[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  const transactions: Transaction[] = [];
  
  // Initial deposits over past 3 months
  const deposits = [
    {
      date: now - 85 * dayMs,
      amount: '500000000', // 500 USDC
      amountUsd: 500,
      description: 'Initial deposit from Ethereum',
      fromChain: { id: 1, name: 'Ethereum' },
      route: 'ETH → Polygon via 1inch Fusion+'
    },
    {
      date: now - 70 * dayMs,
      amount: '300000000', // 300 USDC
      amountUsd: 300,
      description: 'Deposit from Base network',
      fromChain: { id: 8453, name: 'Base' },
      route: 'Base → Polygon via 1inch Fusion+'
    },
    {
      date: now - 45 * dayMs,
      amount: '200000000', // 200 USDC
      amountUsd: 200,
      description: 'Weekly automated deposit',
      fromChain: { id: 137, name: 'Polygon' },
      route: 'Direct deposit'
    },
    {
      date: now - 20 * dayMs,
      amount: '250000000', // 250 USDC
      amountUsd: 250,
      description: 'Cross-chain deposit from Arbitrum',
      fromChain: { id: 42161, name: 'Arbitrum' },
      route: 'Arbitrum → Polygon via 1inch Fusion+'
    },
    {
      date: now - 5 * dayMs,
      amount: '100000000', // 100 USDC  
      amountUsd: 100,
      description: 'Daily automated deposit',
      fromChain: { id: 137, name: 'Polygon' },
      route: 'Direct deposit'
    }
  ];

  // Add deposit transactions
  deposits.forEach((deposit, i) => {
    const isAutomated = deposit.description.includes('automated');
    const isCrossChain = deposit.fromChain.id !== 137;
    
    // Cross-chain swap transaction (if applicable)
    if (isCrossChain) {
      transactions.push({
        id: `swap_${i}`,
        type: 'cross_chain_swap',
        status: 'completed',
        amount: deposit.amount,
        amountUsd: deposit.amountUsd,
        token: {
          symbol: 'USDC',
          name: 'USD Coin',
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          decimals: 6,
          logoURI: 'https://wallet-asset.matic.network/img/tokens/usdc.svg'
        },
        fromChain: deposit.fromChain,
        toChain: { id: 137, name: 'Polygon' },
        txHash: `0x${Math.random().toString(16).slice(2, 42)}`,
        timestamp: deposit.date - 300000, // 5 minutes before deposit
        description: `Cross-chain swap: ${deposit.fromChain.name} → Polygon`,
        route: deposit.route
      });
    }
    
    // Main deposit transaction
    transactions.push({
      id: `deposit_${i}`,
      type: isAutomated ? 'automated_deposit' : 'deposit',
      status: 'completed',
      amount: deposit.amount,
      amountUsd: deposit.amountUsd,
      token: {
        symbol: 'USDC',
        name: 'USD Coin', 
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        decimals: 6,
        logoURI: 'https://wallet-asset.matic.network/img/tokens/usdc.svg'
      },
      toChain: { id: 137, name: 'Polygon' },
      txHash: `0x${Math.random().toString(16).slice(2, 42)}`,
      timestamp: deposit.date,
      description: deposit.description,
      apy: 12.4
    });
  });

  // Generate daily earnings (compound interest)
  let runningBalance = 0;
  const dailyEarnings: Array<{ date: number; earned: number; balance: number }> = [];
  
  for (let day = 85; day >= 0; day--) {
    const dayTimestamp = now - day * dayMs;
    
    // Add any deposits that happened on this day
    const dayDeposits = deposits.filter(d => 
      Math.abs(d.date - dayTimestamp) < dayMs / 2
    );
    
    dayDeposits.forEach(deposit => {
      runningBalance += deposit.amountUsd;
    });
    
    // Calculate daily earnings (12.4% APY = ~0.034% daily)
    if (runningBalance > 0) {
      const dailyRate = 0.124 / 365;
      const earned = runningBalance * dailyRate;
      runningBalance += earned;
      
      dailyEarnings.push({
        date: dayTimestamp,
        earned,
        balance: runningBalance
      });
      
      // Add earning transaction every few days to avoid clutter
      if (day % 7 === 0 && earned > 0.5) {
        transactions.push({
          id: `earning_${day}`,
          type: 'earning',
          status: 'completed',
          amount: Math.floor(earned * 1000000).toString(), // Convert to USDC decimals
          amountUsd: earned,
          token: {
            symbol: 'USDC',
            name: 'USD Coin',
            address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 
            decimals: 6,
            logoURI: 'https://wallet-asset.matic.network/img/tokens/usdc.svg'
          },
          timestamp: dayTimestamp,
          description: `Weekly compound earnings (12.4% APY)`,
          apy: 12.4
        });
      }
    }
  }

  // Add a pending automated deposit for future
  transactions.push({
    id: 'pending_auto',
    type: 'automated_deposit',
    status: 'pending',
    amount: '100000000', // 100 USDC
    amountUsd: 100,
    token: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
      logoURI: 'https://wallet-asset.matic.network/img/tokens/usdc.svg'
    },
    timestamp: now + dayMs, // Tomorrow
    description: 'Scheduled daily automated deposit',
    apy: 12.4
  });

  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

// Transaction history service
class TransactionHistoryService {
  private transactions: Transaction[] = [];
  private initialized = false;
  private demoMode = false;
  private storageKey = 'byob_user_transactions';

  // Enable demo mode for testing
  enableDemoMode() {
    this.demoMode = true;
    this.init();
  }

  // Disable demo mode for real users
  disableDemoMode() {
    this.demoMode = false;
    this.transactions = [];
    this.initialized = false;
  }

  // Load user transactions from localStorage
  private loadUserTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load user transactions:', error);
      return [];
    }
  }

  // Save user transactions to localStorage
  private saveUserTransactions(transactions: Transaction[]) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save user transactions:', error);
    }
  }

  init() {
    if (!this.initialized) {
      // Only load cached transactions on init
      // Real blockchain transactions will be fetched async
      const userTransactions = this.loadUserTransactions();
      this.transactions = userTransactions;
      
      console.log('📚 Loaded cached transactions:', userTransactions.length);
      this.initialized = true;
    }
  }

  // Fetch real blockchain transactions using our backend proxy to 1inch History API
  async fetchBlockchainTransactions(userAddress: string): Promise<Transaction[]> {
    try {
      console.log('🔗 Fetching transactions via backend proxy for:', userAddress);
      
      // Use our backend proxy to call 1inch History API (bypasses CORS and handles auth)
      const chainId = 137; // Polygon
      const now = Date.now();
      const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      const params = new URLSearchParams({
        limit: '100',
        chainId: chainId.toString(),
        toTimestampMs: now.toString(),
        fromTimestampMs: oneMonthAgo.toString(),
      });
      
      // Call our backend proxy instead of 1inch API directly
      const proxyUrl = `/api/1inch/history/v2.0/history/${userAddress}/events?${params}`;
      console.log('📡 Calling backend proxy:', proxyUrl);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 Backend proxy response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend proxy error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        return [];
      }
      
      const data = await response.json();
      console.log('📊 1inch History API response via proxy:', data);
      
      if (!data.items || !Array.isArray(data.items)) {
        console.log('ℹ️ No transaction events found in 1inch History API response');
        return [];
      }
      
      const transactions = data.items.map((event: any) => this.parse1inchEvent(event)).filter(Boolean);
      
      console.log('✅ Parsed 1inch transactions via proxy:', transactions.length);
      return transactions;
      
    } catch (error) {
      console.error('Failed to fetch transactions via backend proxy:', error);
      return [];
    }
  }

  // Parse 1inch History API event into our transaction format
  private parse1inchEvent(event: any): Transaction | null {
    try {
      console.log('🔍 Parsing 1inch event:', JSON.stringify(event, null, 2));
      
      // Skip unimportant transaction types
      const eventType = event.details?.type;
      if (eventType === 'Approve') {
        console.log('⏭️ Skipping approval transaction');
        return null; // Skip approvals as they're not meaningful to users
      }
      
      // Only show important transactions
      const importantTypes = ['AddLiquidity', 'RemoveLiquidity', 'Swap', 'Transfer', 'Deposit', 'Withdrawal'];
      const isIncoming = event.direction === 'in';
      const isOutgoing = event.direction === 'out';
      
      // Skip if not an important type and not incoming
      if (!importantTypes.includes(eventType) && !isIncoming) {
        console.log(`⏭️ Skipping unimportant transaction type: ${eventType}`);
        return null;
      }
      
      // Extract basic event data
      const timestamp = event.timeMs || Date.now();
      const txHash = event.details?.txHash;
      const tokenActions = event.details?.tokenActions || [];
      
      if (tokenActions.length === 0) {
        console.log('⏭️ Skipping transaction with no token actions');
        return null;
      }
      
      // Get the main token action
      const mainAction = tokenActions[0];
      const tokenAddress = mainAction.address;
      const amount = mainAction.amount || '0';
      
      // Map token addresses to symbols (common Polygon tokens)
      const tokenMap: Record<string, {symbol: string, name: string, decimals: number}> = {
        '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { symbol: 'USDC.e', name: 'USD Coin (PoS)', decimals: 6 },
        '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': { symbol: 'USDT', name: 'Tether USD (PoS)', decimals: 6 },
        '0x8f3cf7ad23cd3cadbdf9735aff958023239c6a063': { symbol: 'DAI', name: 'Dai Stablecoin (PoS)', decimals: 18 },
        '0x7ceb23fd6f88dd4e85e598d4c4ca8c2b7cf1ee83': { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
        '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': { symbol: 'WMATIC', name: 'Wrapped Matic', decimals: 18 },
      };
      
      const tokenInfo = tokenMap[tokenAddress.toLowerCase()] || {
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18
      };
      
      // Determine transaction type and description
      let type: Transaction['type'] = 'deposit';
      let description = '';
      
      if (eventType === 'AddLiquidity') {
        type = 'deposit';
        const formattedAmount = this.formatTokenAmountFromString(amount, tokenInfo.decimals, tokenInfo.symbol);
        
        // Check if this is to Aave (liquidity provision to Aave = deposit)
        const aavePool = '0x794a61358d6845594f94dc1db02a252b5b4814ad';
        if (mainAction.toAddress?.toLowerCase() === aavePool.toLowerCase()) {
          description = `Deposited ${formattedAmount} to Aave V3`;
        } else {
          description = `Added ${formattedAmount} liquidity`;
        }
      } else if (eventType === 'RemoveLiquidity') {
        type = 'withdrawal';
        const formattedAmount = this.formatTokenAmountFromString(amount, tokenInfo.decimals, tokenInfo.symbol);
        description = `Withdrew ${formattedAmount} from liquidity`;
      } else if (eventType === 'Swap') {
        type = 'cross_chain_swap';
        const formattedAmount = this.formatTokenAmountFromString(amount, tokenInfo.decimals, tokenInfo.symbol);
        description = `Swapped ${formattedAmount}`;
      } else if (isIncoming) {
        type = 'deposit';
        const formattedAmount = this.formatTokenAmountFromString(amount, tokenInfo.decimals, tokenInfo.symbol);
        description = `Received ${formattedAmount}`;
      } else {
        type = 'deposit';
        const formattedAmount = this.formatTokenAmountFromString(amount, tokenInfo.decimals, tokenInfo.symbol);
        description = `${eventType} ${formattedAmount}`;
      }
      
      // Calculate USD value (simplified - in production you'd get real prices)
      const amountNum = parseFloat(amount) / Math.pow(10, tokenInfo.decimals);
      let amountUsd = 0;
      if (tokenInfo.symbol.includes('USDC') || tokenInfo.symbol.includes('USDT') || tokenInfo.symbol.includes('DAI')) {
        amountUsd = amountNum; // Stablecoins ≈ $1
      }
      
      return {
        id: `oneinch_${txHash}_${timestamp}`,
        type,
        status: event.details?.status === 'completed' ? 'completed' : 'pending',
        amount: amount.toString(),
        amountUsd: amountUsd,
        token: {
          symbol: tokenInfo.symbol,
          name: tokenInfo.name,
          address: tokenAddress,
          decimals: tokenInfo.decimals,
          logoURI: undefined
        },
        txHash: txHash,
        timestamp: timestamp,
        description
      };
      
    } catch (error) {
      console.error('Failed to parse 1inch event:', error);
      return null;
    }
  }
  
  // Helper function to format token amounts from string
  private formatTokenAmountFromString(amount: string, decimals: number, symbol: string): string {
    try {
      const amountNum = parseFloat(amount) / Math.pow(10, decimals);
      
      // Format with appropriate decimal places
      if (amountNum < 0.001) {
        return `${amountNum.toFixed(6)} ${symbol}`;
      } else if (amountNum < 1) {
        return `${amountNum.toFixed(4)} ${symbol}`;
      } else {
        return `${amountNum.toFixed(2)} ${symbol}`;
      }
    } catch (error) {
      return `${amount} ${symbol}`;
    }
  }
  
  // Helper function to format token amounts
  private formatTokenAmount(amount: string | number, token: any): string {
    if (!amount || !token) return '0 UNKNOWN';
    
    try {
      const decimals = token.decimals || 18;
      const symbol = token.symbol || 'UNKNOWN';
      const amountNum = parseFloat(amount.toString()) / Math.pow(10, decimals);
      
      // Format with appropriate decimal places
      if (amountNum < 0.001) {
        return `${amountNum.toFixed(6)} ${symbol}`;
      } else if (amountNum < 1) {
        return `${amountNum.toFixed(4)} ${symbol}`;
      } else {
        return `${amountNum.toFixed(2)} ${symbol}`;
      }
    } catch (error) {
      return `${amount} ${token.symbol || 'UNKNOWN'}`;
    }
  }

  getTransactions(limit?: number): Transaction[] {
    this.init();
    return limit ? this.transactions.slice(0, limit) : this.transactions;
  }

  getTransactionsByType(type: Transaction['type'], limit?: number): Transaction[] {
    this.init();
    const filtered = this.transactions.filter(tx => tx.type === type);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  getTransactionsByDateRange(startDate: number, endDate: number): Transaction[] {
    this.init();
    return this.transactions.filter(tx => 
      tx.timestamp >= startDate && tx.timestamp <= endDate
    );
  }

  getSummary(): TransactionSummary {
    this.init();
    
    const deposits = this.transactions.filter(tx => 
      tx.type === 'deposit' || tx.type === 'automated_deposit'
    );
    const earnings = this.transactions.filter(tx => tx.type === 'earning');
    
    const totalDeposited = deposits.reduce((sum, tx) => sum + tx.amountUsd, 0);
    const totalEarned = earnings.reduce((sum, tx) => sum + tx.amountUsd, 0);
    
    // Find best earning month
    const monthlyEarnings: Record<string, number> = {};
    earnings.forEach(tx => {
      const month = new Date(tx.timestamp).toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
      });
      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + tx.amountUsd;
    });
    
    const bestMonth = Object.entries(monthlyEarnings).reduce(
      (best, [month, earnings]) => 
        earnings > best.earnings ? { month, earnings } : best,
      { month: 'N/A', earnings: 0 }
    );

    // Calculate actual APY from user's transactions if we have enough data
    const actualApy = totalDeposited > 0 && totalEarned > 0 
      ? (totalEarned / totalDeposited) * 100 
      : 0;

    return {
      totalDeposited,
      totalEarned,
      totalTransactions: this.transactions.length,
      averageApy: actualApy || 12.4,
      bestMonth
    };
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: `user_${Date.now()}`,
      timestamp: Date.now()
    };
    
    // Add to beginning of array (most recent first)
    this.transactions.unshift(newTransaction);
    
    // Save user transactions to localStorage
    const userTransactions = this.transactions.filter(tx => tx.id.startsWith('user_'));
    this.saveUserTransactions(userTransactions);
    
    // Log the transaction
    console.log('📝 Added new transaction:', newTransaction);
    
    return newTransaction;
  }

  // Add a real Aave deposit transaction
  addAaveDeposit(
    amount: string, 
    amountUsd: number, 
    txHash: string,
    userAddress: string
  ): Transaction {
    return this.addTransaction({
      type: 'deposit',
      status: 'completed',
      amount: amount,
      amountUsd: amountUsd,
      token: {
        symbol: 'USDC',
        name: 'USD Coin',
        address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Native USDC on Polygon
        decimals: 6,
        logoURI: 'https://wallet-asset.matic.network/img/tokens/usdc.svg'
      },
      txHash: txHash,
      description: `Deposit to Aave V3 - Earning 4.5% APY`,
      apy: 4.5,
      toChain: { id: 137, name: 'Polygon' }
    });
  }

  // Get transactions for a specific user (in future, filter by wallet address)
  getTransactionsForUser(userAddress?: string, limit?: number): Transaction[] {
    this.init();
    // For now, return all transactions
    // In future, filter by user address stored in transaction
    return limit ? this.transactions.slice(0, limit) : this.transactions;
  }
}

// Singleton instance
export const transactionHistory = new TransactionHistoryService();

// Utility functions
export function formatTransactionAmount(transaction: Transaction): string {
  const amount = parseFloat(transaction.amount) / Math.pow(10, transaction.token.decimals);
  return `${amount.toFixed(2)} ${transaction.token.symbol}`;
}

export function getTransactionIcon(type: Transaction['type']): string {
  switch (type) {
    case 'deposit':
      return '💰';
    case 'automated_deposit':
      return '🔄';
    case 'earning':
      return '📈';
    case 'cross_chain_swap':
      return '🌉';
    case 'withdrawal':
      return '💸';
    default:
      return '📋';
  }
}

export function getTransactionColor(type: Transaction['type']): string {
  switch (type) {
    case 'deposit':
    case 'automated_deposit':
      return 'text-green-600';
    case 'earning':
      return 'text-blue-600';
    case 'cross_chain_swap':
      return 'text-purple-600';
    case 'withdrawal':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}