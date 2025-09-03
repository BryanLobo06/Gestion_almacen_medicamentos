const mysql = require('mysql2/promise');

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'drugstore'
  });

  try {
    // Check if users table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'users'"
    );
    
    if (tables.length === 0) {
      console.log('The users table does not exist in the database.');
      return;
    }

    // Get all users
    const [users] = await connection.execute('SELECT * FROM users');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      return;
    }

    console.log('Users in the database:');
    console.table(users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    })));

    // Check password hashing
    console.log('\nTesting password hashing for the first user:');
    const bcrypt = require('bcryptjs');
    const testUser = users[0];
    const testPassword = 'admin123'; // Common test password
    
    const isMatch = await bcrypt.compare(testPassword, testUser.password);
    console.log(`Password '${testPassword}' matches: ${isMatch ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await connection.end();
    process.exit();
  }
}

checkUsers();
