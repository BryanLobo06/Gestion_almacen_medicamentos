const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Apply authentication middleware to all product routes
router.use(isAuthenticated);

// Product listing
router.get('/', productController.listProducts);

// Product search API
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
