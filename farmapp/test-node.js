console.log('Node.js is working!');
console.log('Current directory:', process.cwd());
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_PASSWORD: process.env.DB_PASSWORD ? '***' : '(not set)'
});

// Test file system access
const fs = require('fs');
try {
  const files = fs.readdirSync('.');
  console.log('Files in current directory:', files);
} catch (err) {
  console.error('Error reading directory:', err.message);
}

// Test simple math
console.log('1 + 1 =', 1 + 1);
