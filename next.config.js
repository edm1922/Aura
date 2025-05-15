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


}

module.exports = nextConfig