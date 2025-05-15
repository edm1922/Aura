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

    // Fix TypeScript configuration for the build
    log('Updating TypeScript configuration for build...');
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');

    try {
      // Read the current tsconfig.json
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

      // Update the configuration to support JSX and Set spread
      tsConfig.compilerOptions.jsx = 'react-jsx';
      tsConfig.compilerOptions.target = 'es2015';
      tsConfig.compilerOptions.downlevelIteration = true;

      // Write the updated configuration back to the file
      fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      log('TypeScript configuration updated successfully');
    } catch (error) {
      log('Warning: Failed to update TypeScript configuration');
      console.error(error);
    }

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
