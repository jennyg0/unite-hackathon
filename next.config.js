/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['assets.coingecko.com', 'raw.githubusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_1INCH_API_URL: 'https://api.1inch.dev',
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
  },
}

module.exports = nextConfig 