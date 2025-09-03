const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const categoryController = require('../controllers/categoryController');
const { isAuthenticated } = require('../middleware/auth');

// Products API
router.get('/products', isAuthenticated, async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.name
        `);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Error al cargar los productos' });
    }
});

// Get single product
router.get('/products/:id', isAuthenticated, async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json(products[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Error al cargar el producto' });
    }
});

// Create new product
router.post('/products', isAuthenticated, async (req, res) => {
    try {
        const { 
            code, name, category_id, description, 
            unit, purchase_price, sale_price, 
            stock, min_stock, max_stock, status 
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO products 
             (code, name, category_id, description, unit, purchase_price, 
              sale_price, stock, min_stock, max_stock, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [code, name, category_id, description, unit, purchase_price,
             sale_price, stock, min_stock, max_stock, status]
        );

        const [newProduct] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
        
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: newProduct[0]
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear el producto',
            error: error.message
        });
    }
});

// Update product
router.put('/products/:id', isAuthenticated, async (req, res) => {
    try {
        const { 
            code, name, category_id, description, 
            unit, purchase_price, sale_price, 
            stock, min_stock, max_stock, status 
        } = req.body;

        await db.query(
            `UPDATE products SET 
                code = ?, name = ?, category_id = ?, description = ?, 
                unit = ?, purchase_price = ?, sale_price = ?, 
                stock = ?, min_stock = ?, max_stock = ?, status = ?
             WHERE id = ?`,
            [code, name, category_id, description, unit, purchase_price,
             sale_price, stock, min_stock, max_stock, status, req.params.id]
        );

        const [updatedProduct] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        
        res.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: updatedProduct[0]
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar el producto',
            error: error.message
        });
    }
});

// Delete product
router.delete('/products/:id', isAuthenticated, async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
});

// Get single product by ID
router.get('/products/:id', isAuthenticated, async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json(products[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Error al cargar el producto' });
    }
});

// Get low stock products
router.get('/products/low-stock', isAuthenticated, async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.stock < p.min_stock_level OR p.stock IS NULL
            ORDER BY p.stock ASC
            LIMIT 10
        `);
        res.json(products);
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        res.status(500).json({ success: false, message: 'Error al cargar los productos con bajo stock' });
    }
});

// Recent sales
router.get('/sales/recent', isAuthenticated, async (req, res) => {
    try {
        const [sales] = await db.query(`
            SELECT s.*, u.full_name as user_name
            FROM sales s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
            LIMIT 10
        `);
        
        // Format dates for display (using native Date methods)
        const formattedSales = sales.map(sale => ({
            ...sale,
            formatted_date: new Date(sale.created_at).toLocaleString('es-ES')
        }));
        
        res.json(formattedSales);
    } catch (error) {
        console.error('Error fetching recent sales:', error);
        res.status(500).json({ success: false, message: 'Error al cargar las ventas recientes' });
    }
});

// Categories API
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/search', categoryController.searchCategories);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Auth routes
router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Find user by username
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuario o contraseña incorrectos' 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuario o contraseña incorrectos' 
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                fullName: user.full_name,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        // Set session
        req.session.user = {
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            role: user.role
        };

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({ 
            success: true, 
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error del servidor' 
        });
    }
});

// Check authentication status
router.get('/auth/check', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            isAuthenticated: false 
        });
    }
    
    res.json({ 
        isAuthenticated: true, 
        user: req.session.user 
    });
});

// Logout
router.post('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al cerrar sesión' 
            });
        }
        
        res.clearCookie('token');
        res.clearCookie('farmapp.sid');
        
        res.json({ 
            success: true 
        });
    });
});

// Get recent sales
router.get('/sales/recent', async (req, res) => {
    try {
        // First check if sales table exists
        const [tables] = await db.query("SHOW TABLES LIKE 'sales'");
        if (tables.length === 0) {
            return res.json([]);
        }

        // Check if customers table exists
        const [customerTables] = await db.query("SHOW TABLES LIKE 'customers'");
        const hasCustomers = customerTables.length > 0;

        let query = `
            SELECT s.id, s.total, s.created_at as date
            ${hasCustomers ? ', c.name as customer' : ', "Cliente no registrado" as customer'}
            FROM sales s
            ${hasCustomers ? 'LEFT JOIN customers c ON s.customer_id = c.id' : ''}
            ORDER BY s.created_at DESC
            LIMIT 10
        `;
        
        const [sales] = await db.query(query);
        res.json(sales);
    } catch (error) {
        console.error('Error fetching recent sales:', error);
        // Return empty array instead of error for dashboard to keep working
        res.json([]);
    }
});

// Get low stock products
router.get('/products/low-stock', async (req, res) => {
    try {
        // First check if products table exists
        const [tables] = await db.query("SHOW TABLES LIKE 'products'");
        if (tables.length === 0) {
            return res.json([]);
        }

        const [products] = await db.query(`
            SELECT id, name, stock, 
                   COALESCE(min_stock, 0) as minStock, 
                   COALESCE(unit, 'un') as unit
            FROM products
            WHERE stock <= COALESCE(min_stock, 0)
            ORDER BY stock ASC
            LIMIT 10
        `);
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        // Return empty array instead of error for dashboard to keep working
        res.json([]);
    }
});

module.exports = router;
