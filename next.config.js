/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;

