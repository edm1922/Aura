#!/usr/bin/env node

/**
 * This script tests the Vercel deployment process locally
 * It simulates the Vercel build environment and helps identify errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log with timestamp for better debugging
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Main function
async function main() {
  try {
    log('Starting Vercel deployment test...');
    
    // Step 1: Run the build script
    log('Running build script...');
    try {
      execSync('node scripts/enhanced-vercel-build.js', { stdio: 'inherit' });
      log('Build script completed successfully');
    } catch (error) {
      log('Build script failed:');
      console.error(error);
      return;
    }
    
    // Step 2: Check if the .next directory was created
    const nextDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(nextDir)) {
      log('Error: .next directory was not created');
      return;
    }
    log('.next directory exists');
    
    // Step 3: Check if the server.js file was created
    const serverJsPath = path.join(nextDir, 'server.js');
    if (!fs.existsSync(serverJsPath)) {
      log('Error: server.js file was not created');
      return;
    }
    log('server.js file exists');
    
    // Step 4: Check if the package.json file was created
    const packageJsonPath = path.join(nextDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      log('Error: package.json file was not created');
      return;
    }
    log('package.json file exists');
    
    // Step 5: Try to start the server
    log('Attempting to start the server...');
    try {
      // We'll just check if the file is executable, not actually run it
      const serverContent = fs.readFileSync(serverJsPath, 'utf8');
      if (!serverContent.includes('server.listen')) {
        log('Warning: server.js does not contain server.listen code');
      } else {
        log('server.js contains server.listen code');
      }
    } catch (error) {
      log('Error checking server.js:');
      console.error(error);
    }
    
    // Step 6: Check for the map error
    log('Checking for potential "map" errors...');
    const buildFiles = [
      path.join(nextDir, 'build-manifest.json'),
      path.join(nextDir, 'routes-manifest.json'),
      path.join(nextDir, 'prerender-manifest.json'),
      path.join(nextDir, 'required-server-files.json')
    ];
    
    for (const file of buildFiles) {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const json = JSON.parse(content);
          
          // Check for null or undefined values that might cause map errors
          const checkForUndefined = (obj, path = '') => {
            if (!obj) return;
            
            if (typeof obj === 'object') {
              for (const key in obj) {
                const value = obj[key];
                const currentPath = path ? `${path}.${key}` : key;
                
                if (value === undefined) {
                  log(`Warning: Found undefined value at ${currentPath} in ${file}`);
                } else if (value === null) {
                  log(`Warning: Found null value at ${currentPath} in ${file}`);
                } else if (Array.isArray(value)) {
                  if (value.includes(undefined)) {
                    log(`Warning: Array at ${currentPath} in ${file} contains undefined values`);
                  }
                  if (value.includes(null)) {
                    log(`Warning: Array at ${currentPath} in ${file} contains null values`);
                  }
                } else if (typeof value === 'object') {
                  checkForUndefined(value, currentPath);
                }
              }
            }
          };
          
          checkForUndefined(json);
          log(`Checked ${file} for potential issues`);
        } catch (error) {
          log(`Error parsing ${file}:`);
          console.error(error);
        }
      } else {
        log(`Warning: ${file} does not exist`);
      }
    }
    
    log('Vercel deployment test completed');
  } catch (error) {
    log('Test failed:');
    console.error(error);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error in main function:', error);
});
