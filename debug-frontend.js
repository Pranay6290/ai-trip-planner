#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 AI Trip Planner - Frontend Debug Script');
console.log('==========================================\n');

const frontendDir = path.join(__dirname, 'frontend');

console.log('📁 Frontend directory:', frontendDir);
console.log('🚀 Starting Vite development server...\n');

// Start the Vite dev server with verbose output
const viteProcess = spawn('npx', ['vite', '--debug'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error('❌ Failed to start Vite:', error.message);
  process.exit(1);
});

viteProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Vite process exited with code ${code}`);
    process.exit(code);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  viteProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  viteProcess.kill('SIGTERM');
  process.exit(0);
});
