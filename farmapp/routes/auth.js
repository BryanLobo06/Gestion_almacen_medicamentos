const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login routes
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Iniciar Sesión',
    layout: 'auth',
    error: req.query.error
  });
});

router.post('/login', authController.login);

// Logout route
router.get('/logout', authController.logout);

module.exports = router;
