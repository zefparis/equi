// Test script to check if the production build works
process.env.NODE_ENV = 'production';

console.log('Testing production build...');
console.log('NODE_ENV:', process.env.NODE_ENV);

try {
  // Try to import the built server
  import('./dist/index.js')
    .then(() => {
      console.log('✅ Production build loaded successfully!');
      setTimeout(() => {
        console.log('🔄 Stopping test...');
        process.exit(0);
      }, 2000);
    })
    .catch((error) => {
      console.error('❌ Error loading production build:');
      console.error(error.message);
      console.error('Stack:', error.stack);
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Immediate error:');
  console.error(error.message);
  process.exit(1);
}
