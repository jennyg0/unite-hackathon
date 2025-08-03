# BYOB Milestone NFT Deployment Guide

## Prerequisites

1. **Get xDAI for deployment** (~0.01 xDAI needed)
   - Bridge some ETH/USDC to Gnosis Chain via [Gnosis Bridge](https://bridge.gnosischain.com/)
   - Or use [1inch cross-chain swap](https://app.1inch.io/) to get xDAI

2. **Set up environment variables**
   ```bash
   # Add to .env.local
   PRIVATE_KEY=your_wallet_private_key_here
   GNOSISSCAN_API_KEY=optional_for_verification
   ```

## Deployment Steps (Foundry)

### 1. Build the Contract
```bash
# Build contracts
forge build
```

### 2. Deploy to Gnosis Chain
```bash
# Deploy to Gnosis
forge script script/Deploy.s.sol:DeployScript --rpc-url gnosis --broadcast --verify

# Optional: Deploy with test NFT mint
MINT_TEST_NFT=true forge script script/Deploy.s.sol:DeployScript --rpc-url gnosis --broadcast --verify
```

### 3. Manual Verification (if auto-verify fails)
```bash
forge verify-contract DEPLOYED_CONTRACT_ADDRESS ByobMilestoneNFT --chain gnosis
```

## Expected Output
```
🚀 Deploying BYOB Milestone NFT to Gnosis Chain...

Deploying with account: 0x...
Account balance: 0.1 xDAI

📄 Deploying ByobMilestoneNFT contract...
✅ Contract deployed successfully!
📍 Contract address: 0x123...
🔗 Transaction hash: 0xabc...

📋 Deployment Summary:
{
  "contractAddress": "0x123...",
  "network": "gnosis",
  "chainId": 100,
  "deployedAt": "2024-01-01T12:00:00.000Z"
}

🎯 Next Steps:
1. Update milestone-nft.ts with contract address:
   nft: '0x123...' as Address,
```

## After Deployment

### 1. Update Frontend Code
Replace the contract address in `lib/milestone-nft.ts`:
```typescript
const CONTRACT_ADDRESSES: Record<number, { nft: Address }> = {
  100: { // Gnosis Chain
    nft: '0xYOUR_DEPLOYED_ADDRESS' as Address,
  },
};

// Also update the constructor to support Gnosis
constructor(chainId: number = 100) { // Default to Gnosis
  // ...
  const chain = chainId === 100 ? gnosis : chainId === 137 ? polygon : mainnet;
}
```

### 2. Add Gnosis Chain Support
```typescript
// Add to viem imports
import { gnosis } from 'viem/chains';
```

### 3. Test Milestone Minting
```typescript
// Example mint function for your backend
async function mintFirstDepositNFT(userAddress: string) {
  const milestoneSDK = new MilestoneSDK(100); // Gnosis
  await milestoneSDK.mintMilestone(
    userAddress as Address,
    0, // FIRST_DEPOSIT
    {
      value: 100,
      title: "First Deposit",
      description: "Made your first deposit!"
    }
  );
}
```

## Gas Costs on Gnosis
- Deploy contract: ~0.005 xDAI ($0.005)
- Mint NFT: ~0.0001 xDAI ($0.0001)
- Batch mint 10 NFTs: ~0.001 xDAI ($0.001)

## Troubleshooting

**"Insufficient balance"**: Get more xDAI from [Gnosis Bridge](https://bridge.gnosischain.com/)

**"Network not supported"**: Make sure you're using chainId 100 for Gnosis

**"Contract not verified"**: Use `npx hardhat verify --network gnosis CONTRACT_ADDRESS`

**1inch NFT API not showing NFTs**: Wait 5-10 minutes for indexing, or check [GnosisScan](https://gnosisscan.io) to confirm mint

## Ready to Test!
Once deployed, your milestone NFTs will be:
- ✅ Minted on Gnosis Chain (cheap gas)
- ✅ Indexed by 1inch NFT API automatically  
- ✅ Visible in your BYOB achievements tab
- ✅ Cross-chain compatible via 1inch swaps