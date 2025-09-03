const express = require('express');
const router = express.Router();
const db = require('../config/database');
const productController = require('../controllers/productController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// API Routes - No authentication for API endpoints (handled by the controller)
router.get('/products', async (req, res) => {
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

// Low stock products API
router.get('/products/low-stock', async (req, res) => {
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

// Apply authentication middleware to web routes
router.use(isAuthenticated);

// Web Routes
router.get('/', productController.listProducts);
router.get('/search', productController.searchProducts);

// Admin-only routes
router.use(isAdmin);

// Add new product
router.get('/add', productController.showAddForm);
router.post('/add', productController.addProduct);

// Edit product
router.get('/edit/:id', productController.showEditForm);
router.post('/update/:id', productController.updateProduct);

// Delete product
router.post('/delete/:id', productController.deleteProduct);

module.exports = router;
