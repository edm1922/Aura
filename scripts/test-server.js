#!/usr/bin/env node

/**
 * This script tests if the server.js file can be started
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Testing server.js...');

// Path to the server.js file
const serverPath = path.join(process.cwd(), '.next', 'server.js');

// Spawn the server process
const serverProcess = spawn('node', [serverPath], {
  stdio: 'pipe',
  env: { ...process.env, PORT: '3001' }
});

// Handle server output
serverProcess.stdout.on('data', (data) => {
  console.log(`Server stdout: ${data}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`Server stderr: ${data}`);
});

// Handle server exit
serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Kill the server after 5 seconds
setTimeout(() => {
  console.log('Killing server process...');
  serverProcess.kill();
  console.log('Server test completed');
}, 5000);
