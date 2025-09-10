#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if next exists
const nextBinPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

if (!fs.existsSync(nextBinPath)) {
  console.error('Next.js not found. Installing...');
  process.exit(1);
}

console.log('Starting Paintly development server...');
console.log('----------------------------------------');

// Start the development server
const child = spawn(nextBinPath, ['dev', '--port', '3000'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});