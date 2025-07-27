# DeFi Savings App - 1inch Hackathon Project

A DeFi savings application that abstracts away crypto complexities while helping users learn about finance through concrete actions.

## 🎯 Project Overview

This app targets crypto-native users who don't use DeFi, helping them:
- Create secure savings accounts
- Calculate financial freedom numbers
- Set up emergency funds
- Automate deposits
- Track progress with educational content

## 🏆 Hackathon Goals

- **1inch API Integration**: Extensive use of 1inch APIs for swaps, price feeds, wallet balances, and more
- **Stellar Integration**: Cross-chain functionality for the $10,000 prize
- **Base Network**: Leveraging Base for scalability and cost-effectiveness

## 🚀 Features

### Core Functionality
- [ ] Wallet connection and account management
- [ ] Financial freedom calculator (yearly expenses × 25)
- [ ] Emergency fund setup and tracking
- [ ] Automated deposit scheduling
- [ ] Progress tracking with growth plans

### 1inch API Integration
- [ ] Swap functionality (Cross-chain, Intent-based, Classic, Limit Orders)
- [ ] Price feeds for real-time market data
- [ ] Wallet balance tracking
- [ ] Token metadata and information
- [ ] Transaction posting via Web3 API

### Educational Features
- [ ] Bite-sized financial literacy content
- [ ] Risk tolerance assessment
- [ ] Achievement badges/NFTs
- [ ] Personalized learning paths

## 🛠 Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: Web3Modal for multi-wallet support
- **APIs**: 1inch API, Stellar API
- **Blockchain**: Ethereum, Base, Stellar
- **DeFi Protocols**: Aave, Morpho, Ondo

## 📦 Installation

```bash
npm install
npm run dev
```

## 🔧 Environment Setup

Create a `.env.local` file with:
```
NEXT_PUBLIC_1INCH_API_KEY=your_1inch_api_key
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

## 📝 Development History

This project follows a clear git history approach with meaningful commits for each feature implementation. 