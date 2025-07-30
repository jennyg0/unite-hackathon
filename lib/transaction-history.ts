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

  init() {
    if (!this.initialized) {
      if (this.demoMode) {
        this.transactions = generateDemoHistory();
      }
      this.initialized = true;
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
    
    this.transactions.unshift(newTransaction);
    return newTransaction;
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