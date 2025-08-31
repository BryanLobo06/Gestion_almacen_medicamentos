const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Home route
router.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.redirect('/auth/login');
});

// Dashboard route
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        // Get today's sales
        const [salesToday] = await db.query(`
            SELECT COALESCE(COUNT(*), 0) as count, COALESCE(SUM(total_amount), 0) as total
            FROM sales
            WHERE DATE(created_at) = CURDATE()
        `);
        
        // Get low stock count
        const [lowStock] = await db.query(`
            SELECT COUNT(*) as count
            FROM products
            WHERE stock_quantity <= min_stock_level
        `);
        
        // Get expiring soon count (within 30 days)
        const [expiring] = await db.query(`
            SELECT COUNT(*) as count
            FROM products
            WHERE expiration_date IS NOT NULL 
            AND expiration_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        `);
        
        // Get total products
        const [products] = await db.query(`SELECT COUNT(*) as count FROM products`);
        
        // Get recent sales
        const [recentSales] = await db.query(`
            SELECT s.*, u.full_name as user_name
            FROM sales s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
            LIMIT 5
        `);
        
        // Get low stock products
        const [lowStockProducts] = await db.query(`
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.stock_quantity <= p.min_stock_level
            ORDER BY p.stock_quantity ASC
            LIMIT 5
        `);
        
        // Get sales by day for the last 7 days
        const [salesByDay] = await db.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count,
                COALESCE(SUM(total_amount), 0) as total
            FROM sales
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);
        
        res.render('dashboard', {
            title: 'Panel de Control',
            user: req.session.user,
            salesToday: salesToday[0],
            lowStockCount: lowStock[0].count,
            expiringSoonCount: expiring[0].count,
            totalProducts: products[0].count,
            recentSales,
            lowStockProducts,
            salesByDay
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error al cargar el panel de control'
        });
    }
});

// Profile routes
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', {
        title: 'Mi Perfil',
        user: req.session.user
    });
});

// Settings routes (admin only)
router.get('/settings', isAuthenticated, isAdmin, (req, res) => {
    res.render('settings', {
        title: 'Configuración del Sistema',
        user: req.session.user
    });
});

// API status check
router.get('/api/status', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404 handler (keep this as the last route)
router.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - Página no encontrada',
        message: 'La página que buscas no existe o ha sido movida.'
    });
});

module.exports = router;
