// Cron Job for Executing Auto Deposits
// Run this every hour/day via cron or GitHub Actions

const { ethers } = require('ethers');

// Handle fetch for different Node.js versions
let fetch;
if (typeof globalThis.fetch === 'undefined') {
  // Node.js < 18 or fetch not available
  try {
    fetch = require('node-fetch');
  } catch (err) {
    console.error('❌ node-fetch not installed. Run: npm install node-fetch@2');
    process.exit(1);
  }
} else {
  // Node.js >= 18 with built-in fetch
  fetch = globalThis.fetch;
}

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const RPC_URL = process.env.RPC_URL || 'https://polygon-rpc.com';
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY; // Backend wallet with ETH for gas
const SIMPLE_AUTO_DEPOSIT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x93CCA0c23c52E59a4aDA7694F1D7eaEf2cF89C13';

// Simple contract ABI for depositFor function
const SIMPLE_AUTO_DEPOSIT_ABI = [
    "function depositFor(address user, address token, uint256 amount) external",
    "event AutoDepositExecuted(address indexed user, address indexed token, uint256 amount, address indexed target)"
];

class DepositExecutor {
    constructor() {
        if (!RELAYER_PRIVATE_KEY) {
            throw new Error('RELAYER_PRIVATE_KEY environment variable is required');
        }
        
        this.provider = new ethers.JsonRpcProvider(RPC_URL);
        this.relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, this.provider);
        this.contract = new ethers.Contract(
            SIMPLE_AUTO_DEPOSIT_ADDRESS,
            SIMPLE_AUTO_DEPOSIT_ABI,
            this.relayerWallet
        );
        
        console.log('🤖 Deposit Executor initialized');
        console.log('📍 Contract:', SIMPLE_AUTO_DEPOSIT_ADDRESS);
        console.log('🔑 Relayer:', this.relayerWallet.address);
    }
    
    async checkDueDeposits() {
        try {
            console.log('🔍 Checking for due deposits...');
            
            const response = await fetch(`${API_BASE_URL}/due-deposits`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error('Failed to fetch due deposits');
            }
            
            console.log(`📊 Found ${data.count} due deposits`);
            return data.dueDeposits;
            
        } catch (error) {
            console.error('❌ Error checking due deposits:', error);
            return [];
        }
    }
    
    async executeDeposit(deposit) {
        try {
            console.log('⚡ Executing deposit:', {
                user: deposit.user,
                token: deposit.token,
                amount: deposit.amount,
                scheduleId: deposit.id
            });
            
            // Check relayer balance
            const balance = await this.provider.getBalance(this.relayerWallet.address);
            const balanceEth = ethers.formatEther(balance);
            console.log(`💰 Relayer balance: ${balanceEth} ETH`);
            
            if (balance < ethers.parseEther('0.01')) {
                console.warn('⚠️ Low relayer balance, may fail');
            }
            
            // Execute the depositFor transaction
            // Convert amount to proper decimals (USDC has 6 decimals)
            const amountInDecimals = ethers.parseUnits(deposit.amount, 6);
            
            console.log('💱 Amount conversion:', {
                original: deposit.amount,
                decimals: amountInDecimals.toString()
            });
            
            const tx = await this.contract.depositFor(
                deposit.user,
                deposit.token,
                amountInDecimals,
                {
                    gasLimit: 300000, // 300k gas limit
                    gasPrice: ethers.parseUnits('30', 'gwei') // 30 gwei
                }
            );
            
            console.log('📡 Transaction sent:', tx.hash);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('✅ Transaction confirmed:', receipt.hash);
            
            // Notify backend of successful execution
            await this.recordExecution(deposit.id, receipt.hash, deposit.amount);
            
            return {
                success: true,
                txHash: receipt.hash,
                gasUsed: receipt.gasUsed.toString()
            };
            
        } catch (error) {
            console.error('❌ Error executing deposit:', error);
            
            // Record failed execution
            await this.recordFailedExecution(deposit.id, error.message);
            
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async recordExecution(scheduleId, txHash, amount) {
        try {
            const response = await fetch(`${API_BASE_URL}/execute-deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    scheduleId,
                    txHash,
                    amount
                })
            });
            
            const data = await response.json();
            if (data.success) {
                console.log('📝 Execution recorded in backend');
            } else {
                console.error('❌ Failed to record execution:', data.error);
            }
            
        } catch (error) {
            console.error('❌ Error recording execution:', error);
        }
    }
    
    async recordFailedExecution(scheduleId, errorMessage) {
        try {
            // TODO: Add endpoint for recording failed executions
            console.log('📝 Recording failed execution for schedule:', scheduleId, errorMessage);
        } catch (error) {
            console.error('❌ Error recording failed execution:', error);
        }
    }
    
    async run() {
        console.log('🚀 Starting deposit execution cycle...');
        
        try {
            const dueDeposits = await this.checkDueDeposits();
            
            if (dueDeposits.length === 0) {
                console.log('✅ No deposits due for execution');
                return;
            }
            
            console.log(`🔄 Processing ${dueDeposits.length} due deposits...`);
            
            for (const deposit of dueDeposits) {
                const result = await this.executeDeposit(deposit);
                
                if (result.success) {
                    console.log(`✅ Successfully executed deposit for ${deposit.user}`);
                } else {
                    console.error(`❌ Failed to execute deposit for ${deposit.user}: ${result.error}`);
                }
                
                // Wait a bit between executions to avoid nonce issues
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            console.log('🎉 Execution cycle completed');
            
        } catch (error) {
            console.error('❌ Error in execution cycle:', error);
        }
    }
}

// Main execution
async function main() {
    try {
        const executor = new DepositExecutor();
        await executor.run();
        process.exit(0);
    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = DepositExecutor;