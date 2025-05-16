#!/usr/bin/env node

/**
 * This script tests the Vercel build bypass script to ensure it works correctly.
 */

const { execSync } = require('child_process');

// Log with timestamp for better debugging
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Main function
async function main() {
  try {
    log('Starting Vercel build bypass test...');
    
    // Run the build bypass script
    execSync('node scripts/vercel-build-bypass.js', { stdio: 'inherit' });
    
    log('Vercel build bypass test completed successfully!');
  } catch (error) {
    log('Vercel build bypass test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error in main function:', error);
  process.exit(1);
});
