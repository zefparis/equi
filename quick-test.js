// Quick test to see if Vite dependency error is resolved
import fs from 'fs';

process.env.NODE_ENV = 'production';

console.log('Starting quick test...');

try {
  // Try to require the dist file
  const result = await import('./dist/index.js');
  console.log('SUCCESS: No Vite dependency error!');
  
  // Write success to file
  fs.writeFileSync('test-result.txt', 'SUCCESS: Application loaded without Vite dependency error');
  
  // Exit after a short delay
  setTimeout(() => {
    process.exit(0);
  }, 1000);
  
} catch (error) {
  console.error('ERROR:', error.message);
  
  // Write error to file
  fs.writeFileSync('test-result.txt', `ERROR: ${error.message}\n\nStack: ${error.stack}`);
  
  process.exit(1);
}
