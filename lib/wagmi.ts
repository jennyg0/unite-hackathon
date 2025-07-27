import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { mainnet, sepolia, base, baseGoerli } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    base, // Primary: Base mainnet (cost-effective)
    mainnet, // Secondary: Ethereum mainnet
  ],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'DeFi Savings App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains,
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export { chains } 