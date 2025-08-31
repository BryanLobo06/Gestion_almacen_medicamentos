const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
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
    
    const dbName = process.env.DB_NAME || 'drugstore';
    
    // Drop and create the database
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
    await connection.query(`CREATE DATABASE \`${dbName}\`;`);
    console.log(`Database '${dbName}' created`);
    
    // Switch to the database
    await connection.changeUser({ database: dbName });
    
    // Create tables in the correct order
    await connection.query(`
      -- Users table (referenced by employees)
      CREATE TABLE IF NOT EXISTS users (
        id_user INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Categories table (referenced by products)
      CREATE TABLE IF NOT EXISTS categories (
        id_category INT AUTO_INCREMENT PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL,
        description TEXT
      );
      
      -- Suppliers table (referenced by products and deliverys)
      CREATE TABLE IF NOT EXISTS suppliers (
        id_supplier INT AUTO_INCREMENT PRIMARY KEY,
        supplier_name VARCHAR(100) NOT NULL,
        contact_person VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100)
      );
      
      -- Products table (referenced by many tables)
      CREATE TABLE IF NOT EXISTS products (
        id_product INT AUTO_INCREMENT PRIMARY KEY,
        product_name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        id_category INT,
        id_supplier INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_category) REFERENCES categories(id_category) ON DELETE SET NULL,
        FOREIGN KEY (id_supplier) REFERENCES suppliers(id_supplier) ON DELETE SET NULL
      );
      
      -- Employees table (references users)
      CREATE TABLE IF NOT EXISTS employees (
        id_employee INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        position VARCHAR(100),
        id_user INT,
        FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL
      );
      
      -- Deliveries table (references products, suppliers, employees)
      CREATE TABLE IF NOT EXISTS deliverys (
        id_delivery INT AUTO_INCREMENT PRIMARY KEY,
        delivery_date VARCHAR(255) NOT NULL,
        id_product INT,
        id_supplier INT,
        amount INT NOT NULL,
        id_employee INT,
        delivery_status VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_product) REFERENCES products(id_product) ON DELETE SET NULL,
        FOREIGN KEY (id_supplier) REFERENCES suppliers(id_supplier) ON DELETE SET NULL,
        FOREIGN KEY (id_employee) REFERENCES employees(id_employee) ON DELETE SET NULL
      );
      
      -- Insert sample data
      INSERT INTO users (user_name, password, role) VALUES 
        ('admin', '$2a$10$XFDq3wZ2N3z3Z1Q1Xk8Y9e8vJ8vL8Z9X8k8vJ8vJ8vJ8vJ8vJ8vJ', 'admin'),
        ('user1', '$2a$10$XFDq3wZ2N3z3Z1Q1Xk8Y9e8vJ8vL8Z9X8k8vJ8vJ8vJ8vJ8vJ8vJ', 'user');
      
      INSERT INTO categories (category_name, description) VALUES 
        ('Medicamentos', 'Medicamentos de venta libre y recetados'),
        ('Cuidado Personal', 'Productos de higiene personal'),
        ('Vitaminas', 'Suplementos vitamínicos');
      
      INSERT INTO suppliers (supplier_name, contact_person, phone, email) VALUES 
        ('Farmacéutica S.A.', 'Juan Pérez', '1234567890', 'juan@farmaceutica.com'),
        ('Laboratorios Unidos', 'María García', '0987654321', 'maria@labunidos.com');
      
      INSERT INTO employees (first_name, last_name, position, id_user) VALUES 
        ('Admin', 'Sistema', 'Administrador', 1),
        ('Usuario', 'Prueba', 'Vendedor', 2);
      
      INSERT INTO products (product_name, description, price, stock_quantity, id_category, id_supplier) VALUES 
        ('Paracetamol 500mg', 'Analgésico y antipirético', 5.99, 100, 1, 1),
        ('Jabón Antibacterial', 'Jabón líquido para manos', 3.50, 50, 2, 2);
      
      INSERT INTO deliverys (delivery_date, id_product, id_supplier, amount, id_employee, delivery_status) VALUES 
        (CURDATE(), 1, 1, 100, 1, 'Completado'),
        (CURDATE(), 2, 2, 50, 2, 'Completado');
    `);
    
    console.log('Database tables created and populated with sample data');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the initialization
initDatabase()
  .then(() => {
    console.log('Database initialization completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
