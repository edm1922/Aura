// This script optimizes the build process for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log with timestamp for better debugging
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Check if we're running in a Vercel environment
const isVercel = process.env.VERCEL === '1';

// Main build function
async function main() {
  try {
    log('Starting optimized build process...');

    // Check if this is a production build
    const isProd = process.env.NODE_ENV === 'production';
    log(`Building for ${isProd ? 'production' : 'development'} environment`);
    log(`Running on ${isVercel ? 'Vercel' : 'local'} environment`);

    // IMPORTANT: Only run migrations automatically on Vercel production builds
    // This prevents accidental migrations during local development
    if (isProd && isVercel && process.env.DATABASE_URL) {
      log('Running Prisma migrations (Vercel production only)...');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        log('Prisma migrations completed successfully');
      } catch (error) {
        log('Warning: Prisma migrations failed, but continuing build');
        console.error(error);
      }
    } else {
      log('Skipping automatic migrations (not on Vercel production)');
    }

    // Generate Prisma client (safe for all environments)
    log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Run the Next.js build
    log('Running Next.js build...');
    execSync('next build', { stdio: 'inherit' });

    log('Build completed successfully!');
  } catch (error) {
    log('Build failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the build
main();
