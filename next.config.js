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
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },

  // Optimize build output
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Improve performance with HTTP/2 server push

  // Optimize for production
  productionBrowserSourceMaps: false,

  // Improve loading performance
  poweredByHeader: false,

  // Handle redirects if needed
  async redirects() {
    try {
      return [
        {
          source: '/test',
          destination: '/test/adaptive',
          permanent: true,
        },
        // Add any redirects here if needed
      ];
    } catch (error) {
      console.error('Error in redirects configuration:', error);
      return []; // Return empty array as fallback
    }
  },

  // Configure for Vercel deployment
  output: 'standalone',

  // Disable static generation
  staticPageGenerationTimeout: 1000,

  // Explicitly set that we're not using static exports
  trailingSlash: false,

  // Experimental features - only define once
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Disable static generation for API routes
  async headers() {
    try {
      return [
        {
          source: '/api/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, max-age=0',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
          ],
        },
      ];
    } catch (error) {
      console.error('Error in headers configuration:', error);
      return []; // Return empty array as fallback
    }
  },

  // Error handling for webpack configuration
  webpack: (config, { isServer }) => {
    // Add error handling for webpack configuration
    try {
      // Return the modified config
      return config;
    } catch (error) {
      console.error('Error in webpack configuration:', error);
      return config; // Return original config as fallback
    }
  },

  // Ensure onDemandEntries doesn't cause issues
  onDemandEntries: {
    // Make sure to handle any potential errors in this configuration
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  }
}

// Add global error handling
try {
  module.exports = nextConfig;
} catch (error) {
  console.error('Error exporting Next.js config:', error);
  // Export a minimal config as fallback
  module.exports = {
    reactStrictMode: true,
    output: 'standalone'
  };
}