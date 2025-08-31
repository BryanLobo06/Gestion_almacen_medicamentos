require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('Successfully connected to MySQL!');
    
    // Test query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('Test query result:', rows);
    
    await connection.end();
    console.log('Connection closed.');
    
  } catch (error) {
    console.error('Error connecting to MySQL:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
  }
}

testConnection();
