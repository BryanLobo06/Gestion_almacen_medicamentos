require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing database connection...');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'drugstore'
  };

  console.log('Connection config:', {
    ...config,
    password: config.password ? '***' : '(empty)'
  });

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Successfully connected to MySQL server');
    
    // Test query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('Test query result:', rows);
    
    // Check if database exists
    const [dbs] = await connection.query('SHOW DATABASES');
    console.log('Available databases:', dbs.map(db => db.Database));
    
    // Try to select the database
    try {
      await connection.query(`USE \`${config.database}\``);
      console.log(`✅ Successfully connected to database: ${config.database}`);
      
      // Check tables
      const [tables] = await connection.query('SHOW TABLES');
      console.log('Tables in database:', tables.length > 0 ? tables : 'No tables found');
      
    } catch (dbError) {
      console.error(`❌ Error accessing database ${config.database}:`, dbError.message);
      console.log('Creating database...');
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
      console.log(`✅ Created database: ${config.database}`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', {
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 TIPS:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check your MySQL credentials in .env file');
      console.log('3. Verify MySQL server is accessible from your network');
    }
    
    process.exit(1);
  }
}

// Run the test
testConnection().catch(console.error);
