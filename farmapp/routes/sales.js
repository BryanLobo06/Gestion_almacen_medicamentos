const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get recent sales
router.get('/recent', async (req, res) => {
    try {
        const [sales] = await db.query(`
            SELECT s.*, u.username as cashier 
            FROM sales s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.sale_date DESC
            LIMIT 10
        `);
        
        res.json(sales);
    } catch (error) {
        console.error('Error fetching recent sales:', error);
        res.status(500).json({ success: false, message: 'Error al cargar las ventas recientes' });
    }
});

module.exports = router;
