const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  try {
    // Create connection to MySQL without specifying a database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'drugstore'}\`;`);
    console.log(`Database '${process.env.DB_NAME || 'drugstore'}' is ready`);

    // Switch to the database
    await connection.changeUser({ database: process.env.DB_NAME || 'drugstore' });

    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Import the SQL file
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'drugstore.sql'), 'utf8');
    
    // Split the SQL file into individual queries and filter out empty ones
    const queries = sql
      .replace(/\r\n/g, '\n')
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('/*') && !query.startsWith('--'));

    // Execute each query
    for (const query of queries) {
      try {
        if (query) {
          await connection.query(query);
        }
      } catch (error) {
        console.error('Error executing query:', error.message);
        console.error('Query:', query.substring(0, 100) + (query.length > 100 ? '...' : ''));
        // Don't stop on error, try to continue with other queries
      }
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database schema and data imported successfully');
    
    // Close the connection
    if (connection) {
      await connection.end();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
