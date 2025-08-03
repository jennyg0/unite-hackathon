# Post-Deployment Checklist

After you deploy the AutomatedDeposits contract, follow this checklist to complete the automation setup:

## ✅ Deployment Steps

### 1. Deploy Contract
```bash
forge script script/DeployAutomatedDepositsOnly.s.sol \
  --rpc-url https://polygon-rpc.com/ \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --verify
```

**Copy the deployed contract address from the output!**

### 2. Update Contract Addresses (Critical!)

Update the following files with your deployed contract address:

#### A. `lib/gelato-automation.ts` (line 5):
```typescript
const AUTOMATED_DEPOSITS_CONTRACT = "0xYOUR_DEPLOYED_ADDRESS_HERE";
```

#### B. `lib/automated-deposits.ts` (line 100):
```typescript
137: '0xYOUR_DEPLOYED_ADDRESS_HERE', // Polygon
```

#### C. `hooks/useAutomatedDeposits.ts` (line 19):
```typescript
const AUTOMATED_DEPOSITS_ADDRESS = '0xYOUR_DEPLOYED_ADDRESS_HERE' as Address;
```

### 3. Set Up Gelato Automation

#### Option A: Gelato Web3 Functions (Recommended)
1. Go to [app.gelato.network](https://app.gelato.network)
2. Connect wallet and deposit ~10 MATIC for gas
3. Create new Web3 Function using the code from `AUTOMATION_SETUP_GUIDE.md`
4. Set trigger: Time-based, every 1 hour
5. Deploy function

#### Option B: Manual Keeper Bot
Create a simple bot that calls `executeDeposit` for ready schedules:

```javascript
// keeper-bot.js
const { ethers } = require('ethers');

const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_ADDRESS';
const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com/');
const signer = new ethers.Wallet(process.env.KEEPER_PRIVATE_KEY, provider);

// Check every hour
setInterval(async () => {
  // Get executable schedules and execute them
  // See AUTOMATION_SETUP_GUIDE.md for full code
}, 3600000); // 1 hour
```

## ✅ Testing Checklist

### 1. Test Contract Functions
```bash
# Test creating a schedule
cast call $CONTRACT \
  "createSchedule(address,uint256,uint256,address)" \
  $USDC_ADDRESS $AMOUNT $FREQUENCY $AAVE_POOL

# Test reading schedule
cast call $CONTRACT \
  "schedules(address,uint256)" \
  $USER_ADDRESS 0
```

### 2. Test Frontend Integration
1. Visit your app
2. Connect wallet with USDC
3. Try setting up recurring deposit
4. Check that schedule is created on-chain
5. Verify USDC approval was set

### 3. Test Automation
1. Create a test schedule with short frequency (1 minute for testing)
2. Wait for Gelato to execute or run manual execution
3. Verify deposit went to Aave and user received aUSDC
4. Check that nextDeposit time was updated

## ✅ Production Setup

### 1. Security Checks
- [ ] Contract verified on Polygonscan
- [ ] Owner functions properly restricted
- [ ] Emergency pause functionality working
- [ ] Protocol fees set reasonably (0.1%)

### 2. Monitoring Setup
- [ ] Gelato automation running and funded
- [ ] Contract events being monitored
- [ ] Error alerting for failed executions
- [ ] Gas cost monitoring

### 3. User Experience
- [ ] Clear error messages for common issues
- [ ] Proper loading states during transactions
- [ ] Transaction history showing real data
- [ ] Accurate APY calculations

## ✅ Common Issues & Solutions

### Issue: "Transfer amount exceeds balance"
**Solution:** User doesn't have enough USDC. Check balances before allowing schedule creation.

### Issue: "Insufficient allowance"
**Solution:** User needs to approve USDC spending. The SDK handles this automatically.

### Issue: Gelato not executing
**Solutions:**
- Check Gelato account has MATIC for gas
- Verify Web3 Function is deployed and active
- Check function logs in Gelato dashboard

### Issue: Wrong USDC address
**Solution:** Make sure you're using native USDC: `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`

## ✅ Final Verification

### Test End-to-End Flow:
1. **User creates schedule** → Contract event emitted ✅
2. **USDC approved** → Allowance set correctly ✅
3. **Gelato executes** → Deposit happens automatically ✅
4. **USDC → Aave** → User receives aUSDC ✅
5. **Schedule updates** → nextDeposit time incremented ✅

### Key Metrics to Monitor:
- Number of active schedules
- Total value automated per day
- Success rate of executions
- Average gas costs
- User retention with recurring deposits

## 🎉 You're Done!

Your automated deposit system is now live! Users can:
- Set up recurring USDC deposits (daily/weekly/monthly)
- Automatically earn yield on Aave (4.48% APY)
- Manage their schedules (pause/resume)
- Track their automated savings progress

The system will run continuously via Gelato, executing deposits when scheduled and earning compound interest for your users.

**Next Steps:**
- Monitor the system for the first few days
- Gather user feedback
- Consider adding more protocols (Compound, Yearn, etc.)
- Add email notifications for successful deposits