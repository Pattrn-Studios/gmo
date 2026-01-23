/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for Vercel
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  // Enable transpiling shared package
  transpilePackages: ['../shared'],
}

module.exports = nextConfig
