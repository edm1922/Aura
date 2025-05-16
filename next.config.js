/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Server Actions are available by default now, no need for the experimental flag

  // Optimize image handling
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Optimize build output
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Improve performance with HTTP/2 server push
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Optimize for production
  productionBrowserSourceMaps: false,

  // Improve loading performance
  poweredByHeader: false,

  // Handle redirects if needed
  async redirects() {
    return [
      // Add any redirects here if needed
    ];
  },

  // Configure for Vercel deployment
  output: 'standalone',

  // Disable static generation
  staticPageGenerationTimeout: 1000,

  // Explicitly set that we're not using static exports
  trailingSlash: false,

  // Disable static optimization for all pages
  experimental: {
    // Existing experimental features
    optimizeCss: true,
    scrollRestoration: true,

    // Disable static generation
    isrMemoryCacheSize: 0,
    serverActions: true,
  },


}

module.exports = nextConfig