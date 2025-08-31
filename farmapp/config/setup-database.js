require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
  // Create connection to MySQL server without specifying a database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    console.log('Creating database...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log('Database created or already exists');

    // Switch to the created database
    await connection.query(`USE \`${process.env.DB_NAME}\`;`);
    console.log('Using database:', process.env.DB_NAME);

    // Create tables
    console.log('Creating tables...');
    await connection.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Categories table
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Suppliers table
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        contact_person VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category_id INT,
        barcode VARCHAR(50) UNIQUE,
        price DECIMAL(10, 2) NOT NULL,
        cost_price DECIMAL(10, 2) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        min_stock_level INT DEFAULT 10,
        supplier_id INT,
        expiration_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Sales table
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        customer_name VARCHAR(100) DEFAULT 'Consumidor Final',
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method ENUM('efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Sale items table
      CREATE TABLE IF NOT EXISTS sale_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Tables created successfully');

    // Insert sample data
    console.log('Inserting sample data...');
    
    // Insert admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(
      'INSERT IGNORE INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
      ['admin', 'admin@farmacia.com', hashedPassword, 'Administrador', 'admin']
    );

    // Insert sample employee
    const employeePassword = await bcrypt.hash('empleado123', 10);
    await connection.query(
      'INSERT IGNORE INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
      ['empleado1', 'empleado@farmacia.com', employeePassword, 'Empleado Ejemplo', 'employee']
    );

    // Insert sample categories
    await connection.query(`
      INSERT IGNORE INTO categories (name, description) VALUES 
      ('Medicamentos', 'Medicamentos de venta libre y con receta'),
      ('Cuidado Personal', 'Productos de higiene y cuidado personal'),
      ('Dermocosmética', 'Productos para el cuidado de la piel'),
      ('Mamá y Bebé', 'Productos para madres y bebés'),
      ('Suplementos', 'Vitaminas y suplementos alimenticios');
    `);

    // Insert sample suppliers
    await connection.query(`
      INSERT IGNORE INTO suppliers (name, contact_person, phone, email, address) VALUES 
      ('Genfar', 'Juan Pérez', '5551234567', 'contacto@genfar.com', 'Av. Industrial 123, CDMX'),
      ('Bayer', 'María García', '5557654321', 'ventas@bayer.com.mx', 'Paseo de la Reforma 500, CDMX'),
      ('Pfizer', 'Roberto Sánchez', '5559876543', 'contacto@pfizer.com.mx', 'Av. Ejército Nacional 579, CDMX');
    `);

    console.log('Sample data inserted successfully');
    console.log('\n✅ Database setup completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin:    username: admin, password: admin123');
    console.log('Employee: username: empleado1, password: empleado123');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

// Run the setup
setupDatabase();
