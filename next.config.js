/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove appDir from experimental as it's now stable in Next.js 15+
  images: {
    domains: ['assets.coingecko.com', 'raw.githubusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_1INCH_API_URL: 'https://api.1inch.dev',
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
  },
}

module.exports = nextConfig 