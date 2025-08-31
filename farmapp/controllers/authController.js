const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authController = {
  // Show login form
  showLoginForm: (req, res) => {
    res.render('auth/login', { 
      title: 'Iniciar Sesión',
      layout: 'auth'  // Use a different layout for auth pages
    });
  },

  // Handle login
  login: async (req, res) => {
    const { username, password } = req.body;
    
    try {
      // Find user by username
      const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      const user = users[0];

      if (!user) {
        return res.redirect('/auth/login?error=Usuario o contraseña incorrectos');
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.redirect('/auth/login?error=Usuario o contraseña incorrectos');
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

      // Redirect based on role
      if (user.role === 'admin') {
        return res.redirect('/dashboard');
      } else {
        return res.redirect('/sales/pos');
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error al iniciar sesión. Por favor, intente nuevamente.'
      });
    }
  },

  // Logout
  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        return res.redirect('/');
      }
      res.clearCookie('connect.sid');
      res.redirect('/auth/login');
    });
  },

  // Middleware to check if user is authenticated
  isAuthenticated: (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    res.redirect('/auth/login');
  },

  // Middleware to check if user has admin role
  isAdmin: (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    res.status(403).render('error', {
      title: 'Acceso denegado',
      message: 'No tiene permisos para acceder a esta sección.'
    });
  }
};

module.exports = authController;
