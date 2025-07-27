// Replace this with any of the networks listed at https://github.com/wevm/viem/blob/main/src/chains/index.ts
import {base, polygon, mainnet, gnosis} from 'viem/chains';
export const privyConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your-privy-app-id',
  config: {
    loginMethods: ['wallet', 'email'], 
    appearance: {
      theme: 'light',
      accentColor: '#0ea5e9',
      showWalletLoginFirst: true,
    },
    supportedChains: [base, polygon, mainnet, gnosis],
  },
} 