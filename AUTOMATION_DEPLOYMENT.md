# Automated Deposits Deployment Guide

## Prerequisites

1. **Get MATIC for deployment** (~0.1 MATIC needed)
   - Use [Polygon Bridge](https://wallet.polygon.technology/bridge) 
   - Or swap on [1inch](https://app.1inch.io/) directly to Polygon

2. **Environment variables set in .env.local**
   ```bash
   PRIVATE_KEY=your_wallet_private_key_here
   ```

## Deployment Commands

### Deploy to Polygon
```bash
# Build contracts first
forge build

# Deploy AutomatedDeposits to Polygon
forge script script/DeployAutomation.s.sol:DeployAutomationScript --rpc-url polygon --broadcast --verify

# Optional: Deploy with test schedule
CREATE_TEST_SCHEDULE=true forge script script/DeployAutomation.s.sol:DeployAutomationScript --rpc-url polygon --broadcast --verify
```

### Expected Output
```
🤖 Deploying AutomatedDeposits to Polygon
==================================================
Deployer address: 0x...
Deployer balance: 1.5 MATIC

📄 Deploying AutomatedDeposits contract...
✅ Contract deployed successfully!
📍 Contract address: 0x123...

⚙️ Setting up initial configuration...
Fee recipient set to: 0x...
Deployer added as keeper
Protocol fee set to 0.1%

🎯 Next Steps:
1. Update automated-deposits.ts with contract address:
   137: '0x123...' as Address,
```

## Post-Deployment Setup

### 1. Update Frontend Code

**In `lib/automated-deposits.ts`:**
```typescript
const CONTRACT_ADDRESSES: Record<number, Address> = {
  137: '0xYOUR_DEPLOYED_ADDRESS' as Address, // Replace with actual
  // ... other chains
};
```

**In `lib/gelato-automation.ts`:**
```typescript
const AUTOMATED_DEPOSITS_CONTRACT = "0xYOUR_DEPLOYED_ADDRESS";
```

### 2. Configure Default Recipients

Update the contract with actual DeFi protocol addresses:
```bash
# Example: Set Aave V3 Pool as default recipient
cast send 0xYOUR_CONTRACT_ADDRESS "setDefaultRecipient(address)" 0x794a61358D6845594F94dc1DB02A252b5b4814aD --rpc-url polygon --private-key $PRIVATE_KEY
```

### 3. Set Up Keepers

Add Gelato or other keeper addresses:
```bash
# Add Gelato ops contract as keeper
cast send 0xYOUR_CONTRACT_ADDRESS "addKeeper(address)" 0x527a819db1eb0e34426297b03bae11F2f8B3A19E --rpc-url polygon --private-key $PRIVATE_KEY
```

## Integration with Gelato

### 1. Fund Gelato Account
- Go to [Gelato App](https://app.gelato.network/)
- Deposit MATIC for automation fees
- Estimated cost: ~$0.50 per execution

### 2. Create Automated Tasks
The `GelatoAutomationService` will automatically:
- Create time-based triggers for deposit schedules
- Execute deposits when users' schedules are due
- Handle gas estimation and payment

## Key Contract Features

✅ **Recurring Deposits**: Daily, weekly, bi-weekly, monthly
✅ **Gasless Approvals**: Supports ERC20 Permit for better UX  
✅ **Multi-Protocol**: Send deposits to any DeFi protocol
✅ **Keeper Network**: Gelato or custom keepers can execute
✅ **Protocol Fees**: Configurable fees for sustainability
✅ **Pausable**: Emergency stop functionality
✅ **Access Control**: Owner and keeper roles

## Cost Breakdown

**Deployment**: ~0.01 MATIC (~$0.01)
**Schedule Creation**: ~0.001 MATIC (~$0.001) per user
**Deposit Execution**: ~0.002 MATIC (~$0.002) per execution
**Gelato Fees**: ~$0.50 per execution (covered by protocol or user)

## Smart Yield Integration

The contract can send deposits to:
- **Aave V3**: Automatic lending for yield
- **Morpho**: Optimized lending rates  
- **Yearn Vaults**: Automated yield strategies
- **Custom Strategies**: Your own yield optimization

## Testing

After deployment, test with small amounts:
1. Create a daily $1 USDC schedule
2. Wait for Gelato to execute (or manually trigger)
3. Verify funds are deposited to yield protocol
4. Check milestone NFT minting on Gnosis

## Production Checklist

- [ ] Deploy contract to Polygon
- [ ] Update frontend contract addresses
- [ ] Configure default yield recipients  
- [ ] Add production keepers
- [ ] Fund Gelato automation wallet
- [ ] Test end-to-end flow
- [ ] Set up monitoring and alerts

## Security Notes

- Contract is pausable by owner
- Only approved keepers can execute deposits
- Users maintain control of their schedules
- Protocol fees are transparent and configurable
- Reentrancy protection on all external calls