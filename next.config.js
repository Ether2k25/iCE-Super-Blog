/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.notion.so', 's3.us-west-2.amazonaws.com', 'images.unsplash.com'],
    unoptimized: true
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    KV_REST_API_URL: process.env.KV_REST_API_URL || '',
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || ''
  },
  reactStrictMode: true
}

module.exports = nextConfig
