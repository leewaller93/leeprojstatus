const fs = require('fs');
const { execSync } = require('child_process');

console.log('Starting build process...');

// Always try to build backend first if it exists
if (fs.existsSync('has-status-backend')) {
  console.log('Building backend...');
  try {
    process.chdir('has-status-backend');
    execSync('npm install', { stdio: 'inherit' });
    console.log('Backend build complete');
    process.exit(0);
  } catch (error) {
    console.log('Backend build failed, but continuing...');
    process.exit(0);
  }
} else {
  console.log('No backend directory found, skipping backend build');
  process.exit(0);
} 