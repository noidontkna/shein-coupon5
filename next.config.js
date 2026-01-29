/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // IP restriction for admin in production
  async redirects() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/_dashboard',
          has: [
            {
              type: 'ip',
              value: '103.16.29.227' // Replace with YOUR PUBLIC IP
            }
          ],
          destination: '/_dashboard',
          permanent: false,
        },
        {
          source: '/_dashboard',
          destination: '/404',
          permanent: false,
        }
      ]
    }
    return []
  }
}

module.exports = nextConfig
