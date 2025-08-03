# 🤖 Simplified Auto Deposit System

A hackathon-friendly auto deposit system using Privy + MetaMask with backend cron jobs, replacing the complex Gelato integration.

## 🏗️ System Architecture

### Components
1. **Frontend**: React + Privy (MetaMask auth)
2. **Backend**: Node.js API for scheduling deposits
3. **Smart Contract**: Simple `depositFor` function
4. **Cron Job**: Automated execution via GitHub Actions

### Flow
1. User sets up auto deposit (amount, interval, token)
2. User approves USDC spending for the contract
3. Backend API stores the schedule
4. Cron job checks schedules and executes on-chain deposits
5. Dashboard shows scheduled deposits with pause/cancel options

## 🚀 Quick Start

### 1. Deploy the Smart Contract

```bash
# Deploy SimpleAutoDeposit contract
forge script script/DeploySimpleAutoDeposit.s.sol --broadcast --rpc-url $POLYGON_RPC
```

Update contract address in:
- `hooks/useAutomatedDeposits.ts` 
- `api/auto-deposit.js`
- `cron/deposit-executor.js`

### 2. Run the Backend API

```bash
cd api
npm install
npm start
```

Deploy to Vercel/Railway:
```bash
# Deploy to Vercel
npm i -g vercel
vercel --prod
```

### 3. Setup Cron Job (GitHub Actions)

1. Add repository secrets:
   - `API_BASE_URL`: Your deployed API URL
   - `RPC_URL`: Polygon RPC endpoint 
   - `RELAYER_PRIVATE_KEY`: Backend wallet private key (needs ETH for gas)
   - `CONTRACT_ADDRESS`: Deployed contract address

2. The workflow runs hourly automatically

### 4. Update Frontend Environment

Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

## 📁 File Structure

```
├── contracts/
│   └── SimpleAutoDeposit.sol          # Simplified contract
├── api/
│   ├── auto-deposit.js               # Backend API
│   └── package.json
├── cron/
│   ├── deposit-executor.js           # Cron job logic
│   └── package.json
├── components/
│   └── AutoDepositDashboard.tsx      # Dashboard component
├── hooks/
│   └── useAutomatedDeposits.ts       # Updated hook
└── .github/workflows/
    └── auto-deposit-cron.yml         # GitHub Actions
```

## 🔧 Smart Contract

### SimpleAutoDeposit.sol
```solidity
function depositFor(address user, address token, uint256 amount) external
```

- Pulls tokens from user via `transferFrom`
- Deposits to configurable target (Aave pool)
- Emits events for tracking

## 🌐 API Endpoints

### POST `/schedule-auto-deposit`
```json
{
  "user": "0x123...",
  "token": "0xUSDC...", 
  "amount": "50",
  "intervalDays": 7
}
```

### GET `/scheduled-deposits/:user`
Returns user's scheduled deposits

### DELETE `/scheduled-deposits/:scheduleId`
Cancels a schedule

### GET `/due-deposits`
Returns deposits ready for execution (used by cron)

## ⚙️ Configuration

### Environment Variables

**Backend API:**
- `PORT`: API port (default: 3001)

**Cron Job:**
- `API_BASE_URL`: Backend API URL
- `RPC_URL`: Polygon RPC endpoint
- `RELAYER_PRIVATE_KEY`: Private key for gas payments
- `CONTRACT_ADDRESS`: SimpleAutoDeposit contract address

### Frontend Environment
- `NEXT_PUBLIC_API_URL`: Backend API URL

## 💡 Key Features

### ✅ Implemented
- [x] Simple contract with `depositFor` function
- [x] Backend API for scheduling
- [x] Frontend integration with Privy
- [x] Cron job execution via GitHub Actions
- [x] Dashboard for managing schedules
- [x] Automatic USDC approval flow

### 🚧 Hackathon Limitations
- Uses in-memory storage (replace with DB for production)
- Simplified user registry in contract
- Basic error handling
- No fee mechanism (can be added easily)

### 🔮 Bonus Features (Implemented)
- [x] Dashboard showing next scheduled deposits
- [x] Cancel/pause functionality  
- [x] Yearly savings projection calculator
- [x] Transaction history with Polygonscan links

## 🛡️ Security Considerations

### Current Implementation
- Semi-custodial: Users approve tokens, backend executes
- Relayer wallet needs ETH for gas
- Contract is simple and auditable

### Production Improvements
- Add multi-signature for relayer wallet
- Implement fee collection mechanism
- Add rate limiting and validation
- Use proper database with encryption
- Add comprehensive logging and monitoring

## 🚀 Deployment Checklist

### Smart Contract
- [ ] Deploy SimpleAutoDeposit to Polygon
- [ ] Verify contract on Polygonscan
- [ ] Set correct deposit target (Aave pool)

### Backend
- [ ] Deploy API to Vercel/Railway
- [ ] Configure environment variables
- [ ] Test all endpoints

### Cron Job  
- [ ] Add repository secrets to GitHub
- [ ] Test manual workflow execution
- [ ] Verify hourly execution

### Frontend
- [ ] Update contract address in code
- [ ] Set API URL in environment
- [ ] Test end-to-end flow

## 📊 Testing

### Manual Test Flow
1. Connect wallet to app
2. Set up recurring deposit (small amount)
3. Approve USDC spending
4. Verify schedule appears in dashboard
5. Manually trigger cron job
6. Check transaction on Polygonscan
7. Verify balance updated in dashboard

### API Testing
```bash
# Health check
curl https://your-api-url.com/health

# Check due deposits
curl https://your-api-url.com/due-deposits
```

## 💰 Gas & Cost Optimization

### Current Approach
- Single relayer wallet pays gas for all users
- ~50k gas per deposit execution
- Batch multiple deposits in one transaction (possible enhancement)

### Cost Estimates (Polygon)
- Gas per deposit: ~50,000
- Gas price: ~30 gwei
- Cost per deposit: ~$0.0015
- Daily costs for 100 users: ~$0.15

## 🆘 Troubleshooting

### Common Issues

**"Approval not confirmed"**
- Wait longer for blockchain confirmation
- Check wallet has sufficient ETH for gas

**"Backend API error"**  
- Verify API URL is correct
- Check API logs for detailed errors

**"Cron job not running"**
- Check GitHub Actions secrets are set
- Verify workflow file syntax
- Check relayer wallet has ETH balance

**"Transaction failed"**
- User may have insufficient USDC balance
- Check allowance is still valid
- Verify contract address is correct

## 🎯 Next Steps for Production

1. **Database**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Security**: Add rate limiting, input validation, audit contract
3. **Monitoring**: Add logging, alerts, health checks
4. **UI/UX**: Better error handling, loading states, notifications  
5. **Features**: Multiple tokens, cross-chain deposits, yield optimization
6. **Economics**: Add small fees to sustain operations

---

**This system provides a clean, hackathon-ready alternative to complex Gelato integrations while maintaining the core auto-deposit functionality!**