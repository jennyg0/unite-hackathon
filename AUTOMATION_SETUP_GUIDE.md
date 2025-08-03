# Gelato Automation Setup Guide

## Overview
This guide explains how to set up automated recurring USDC deposits to Aave using Gelato automation after deploying the contracts.

## 1. Deploy the AutomatedDeposits Contract

First, deploy the contract to Polygon:

```bash
export PRIVATE_KEY=your_private_key_here
forge script script/DeployAutomatedDepositsOnly.s.sol \
  --rpc-url https://polygon-rpc.com/ \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --verify
```

**Save the deployed contract address from the output!**

## 2. Update Contract Addresses

After deployment, update these files with your contract address:

### 2.1 Update `lib/gelato-automation.ts`
```typescript
const AUTOMATED_DEPOSITS_CONTRACT = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 2.2 Update `hooks/useAutomatedDeposits.ts`
```typescript
const AUTOMATED_DEPOSITS_ADDRESS = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS' as Address;
```

## 3. Set Up Gelato Web3 Functions

### 3.1 Create Gelato Account
1. Go to [Gelato App](https://app.gelato.network/)
2. Connect your wallet
3. Deposit some MATIC for gas fees (~10 MATIC should be enough)

### 3.2 Create Web3 Function (Alternative to SDK)

Since the Gelato SDK can be tricky, here's a Web3 Function approach:

1. **Create a Web3 Function** in the Gelato app
2. **Function Code:**

```javascript
import { Web3Function, Web3FunctionContext } from "@gelatonetwork/web3-functions-sdk";

const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
const USDC_ADDRESS = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { provider, multiChainProvider } = context;
  
  // Get contract instance
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    [
      "function getExecutableSchedules(uint256 offset, uint256 limit) view returns (address[] memory users, uint256[] memory scheduleIds, uint256 count)",
      "function executeDeposit(address user, uint256 scheduleId)",
      "function schedules(address user, uint256 scheduleId) view returns (tuple(address user, address token, uint256 amount, uint256 frequency, uint256 nextDeposit, uint256 totalDeposited, bool isActive, address recipient))"
    ],
    provider
  );

  try {
    // Get executable schedules
    const [users, scheduleIds, count] = await contract.getExecutableSchedules(0, 10);
    
    if (count === 0) {
      return { canExec: false, message: "No schedules ready for execution" };
    }

    // Execute first ready schedule
    const userAddress = users[0];
    const scheduleId = scheduleIds[0];
    
    // Verify schedule is ready
    const schedule = await contract.schedules(userAddress, scheduleId);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (schedule.nextDeposit > currentTime) {
      return { canExec: false, message: "Schedule not ready yet" };
    }

    // Execute the deposit
    const callData = contract.interface.encodeFunctionData("executeDeposit", [
      userAddress,
      scheduleId
    ]);

    return {
      canExec: true,
      callData: [{
        to: CONTRACT_ADDRESS,
        data: callData,
      }],
    };
    
  } catch (error) {
    return { canExec: false, message: `Error: ${error.message}` };
  }
});
```

3. **Set trigger:** Time-based, every 1 hour
4. **Deploy the function**

## 4. Integration in Your App

### 4.1 User Flow for Setting Up Automation

When a user wants to set up recurring deposits:

1. **Create Schedule** - Call your contract:
```typescript
const createSchedule = async (amount: number, frequency: number) => {
  const contract = new ethers.Contract(
    AUTOMATED_DEPOSITS_CONTRACT,
    [...], // ABI
    signer
  );
  
  const tx = await contract.createSchedule(
    USDC_ADDRESS, // Native USDC
    amount * 1e6, // Convert to 6 decimals
    frequency, // seconds (86400 for daily)
    AAVE_POOL_ADDRESS // Where deposits go
  );
  
  await tx.wait();
  return tx.hash;
};
```

2. **Set USDC Allowance** - User approves spending:
```typescript
const approveUSDC = async (amount: number) => {
  const usdcContract = new ethers.Contract(
    USDC_ADDRESS,
    ["function approve(address spender, uint256 amount) returns (bool)"],
    signer
  );
  
  const tx = await usdcContract.approve(
    AUTOMATED_DEPOSITS_CONTRACT,
    amount * 1e6 * 12 // Approve for 12 deposits
  );
  
  await tx.wait();
};
```

### 4.2 Update SmartDeposit Component

Modify the recurring deposit logic in `components/SmartDeposit.tsx`:

1. Replace localStorage saving with actual contract calls
2. Add proper error handling for contract interactions
3. Show real transaction hashes and status

## 5. Testing the Automation

### 5.1 Test Manual Execution
```typescript
// Test executing a deposit manually
const executeDeposit = async (userAddress: string, scheduleId: number) => {
  const contract = new ethers.Contract(
    AUTOMATED_DEPOSITS_CONTRACT,
    [...], // ABI
    signer
  );
  
  const tx = await contract.executeDeposit(userAddress, scheduleId);
  await tx.wait();
  console.log("Deposit executed:", tx.hash);
};
```

### 5.2 Monitor Gelato Executions
- Check Gelato dashboard for function executions
- Monitor contract events for successful deposits
- Verify USDC balance changes in user wallets

## 6. Production Considerations

### 6.1 Gas Management
- Keep 10+ MATIC in Gelato account
- Monitor gas costs and adjust frequency if needed

### 6.2 Error Handling
- Handle insufficient USDC balance gracefully
- Retry failed transactions
- Notify users of execution status

### 6.3 Security
- Implement proper access controls
- Add emergency pause functionality
- Monitor for unusual activity

## 7. Troubleshooting

### Common Issues:
1. **"Schedule not active"** - Check if user disabled their schedule
2. **"Insufficient allowance"** - User needs to approve more USDC spending  
3. **"Transfer amount exceeds balance"** - User doesn't have enough USDC
4. **Gelato not executing** - Check Web3 Function logs and MATIC balance

### Debug Commands:
```bash
# Check contract on Polygonscan
# View recent transactions and events

# Test contract calls locally
forge test --fork-url https://polygon-rpc.com/

# Check Gelato function logs
# Visit app.gelato.network -> Your Functions -> Logs
```

## 8. Final Steps

1. ✅ Deploy contract to Polygon
2. ✅ Update contract addresses in code
3. ✅ Create Gelato Web3 Function
4. ✅ Update SmartDeposit component
5. ✅ Test end-to-end flow
6. ✅ Monitor automation execution

**The automation is now ready! Users can set up recurring USDC deposits that will automatically execute via Gelato and deposit to Aave for yield.**