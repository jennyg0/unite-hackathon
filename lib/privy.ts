import { PrivyProvider } from '@privy-io/react-auth'

export const privyConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your-privy-app-id',
  config: {
    loginMethods: ['email', 'wallet'],
    appearance: {
      theme: 'light',
      accentColor: '#0ea5e9',
      showWalletLoginFirst: true, // Wallet first for hackathon
    },
    supportedChains: [
      {
        id: 8453, // Base
        name: 'Base',
        rpcUrl: 'https://mainnet.base.org',
        blockExplorer: 'https://basescan.org',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
      },
      {
        id: 1, // Ethereum
        name: 'Ethereum',
        rpcUrl: 'https://ethereum.publicnode.com',
        blockExplorer: 'https://etherscan.io',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
      },
      {
        id: 100, // Gnosis Chain
        name: 'Gnosis Chain',
        rpcUrl: 'https://rpc.gnosischain.com',
        blockExplorer: 'https://gnosisscan.io',
        nativeCurrency: {
          name: 'xDai',
          symbol: 'XDAI',
          decimals: 18,
        },
      },
      {
        id: 'stellar', // Stellar
        name: 'Stellar',
        rpcUrl: 'https://horizon.stellar.org',
        blockExplorer: 'https://stellar.expert',
        nativeCurrency: {
          name: 'Lumens',
          symbol: 'XLM',
          decimals: 7,
        },
      },
    ],
    defaultChain: 8453, // Base as default
  },
} 