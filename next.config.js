/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'shein-coupon5.vercel.app']
    }
  }
}

module.exports = nextConfig