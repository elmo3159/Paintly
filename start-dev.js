#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// Start Next.js development server
const nextPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(nextPath, ['dev', '--port', '3000'], {
  stdio: 'inherit',
  env: { ...process.env }
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});