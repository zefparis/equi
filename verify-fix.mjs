#!/usr/bin/env node

// Simple verification script to test if Vite dependency issue is fixed
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verifying Vite dependency fix...');

// Set production environment
process.env.NODE_ENV = 'production';

try {
  console.log('📦 Attempting to import production build...');
  
  // Import the built server
  const serverModule = await import('./dist/index.js');
  
  console.log('✅ SUCCESS: Production build imported without Vite dependency error!');
  console.log('🎉 The Vite dependency issue has been resolved.');
  
  // Give the server a moment to start, then exit
  setTimeout(() => {
    console.log('🛑 Test completed successfully. Exiting...');
    process.exit(0);
  }, 2000);
  
} catch (error) {
  console.error('❌ ERROR: Production build failed to load');
  console.error('Error message:', error.message);
  
  if (error.message.includes('Cannot find package \'vite\'')) {
    console.error('🚨 The Vite dependency issue is NOT resolved.');
    console.error('💡 Suggestion: Make sure Vite is in production dependencies.');
  }
  
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
