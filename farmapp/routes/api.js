const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

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
        const [sales] = await db.query(`
            SELECT s.id, s.total, s.created_at as date, c.name as customer
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            ORDER BY s.created_at DESC
            LIMIT 10
        `);
        
        res.json(sales);
    } catch (error) {
        console.error('Error fetching recent sales:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener las ventas recientes' 
        });
    }
});

// Get low stock products
router.get('/products/low-stock', async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT id, name, stock, min_stock as minStock, unit
            FROM products
            WHERE stock <= min_stock
            ORDER BY stock ASC
            LIMIT 10
        `);
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener los productos con stock bajo' 
        });
    }
});

module.exports = router;
