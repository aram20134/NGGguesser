/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL
  },
  images: {
    domains: ['localhost']
  },
}

module.exports = nextConfig
