require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { createServer } = require('http');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const xss = require('xss-clean');
const hpp = require('hpp');

// Import database connection
const db = require('./config/database');

// Import API routes
const apiRoutes = require('./routes/api');
const salesRoutes = require('./routes/sales');
const productsRoutes = require('./routes/products');

// Initialize Express app
const app = express();

// Configuración de Content Security Policy
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://cdn.jsdelivr.net",
      "https://code.jquery.com",
      "https://cdn.datatables.net",
      "https://unpkg.com"
    ],
    scriptSrcElem: [
      "'self'",
      "https://cdn.jsdelivr.net",
      "https://code.jquery.com",
      "https://cdn.datatables.net",
      "https://unpkg.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://cdn.jsdelivr.net",
      "https://cdn.datatables.net",
      "https://unpkg.com"
    ],
    styleSrcElem: [
      "'self'",
      "'unsafe-inline'",
      "https://cdn.jsdelivr.net",
      "https://cdn.datatables.net",
      "https://unpkg.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "https://cdn.jsdelivr.net",
      "https://unpkg.com"
    ],
    connectSrc: [
      "'self'",
      "http://localhost:3000"
    ],
    fontSrc: [
      "'self'",
      "data:",
      "https://cdn.jsdelivr.net",
      "https://unpkg.com"
    ],
    frameSrc: ["'self'"],
    objectSrc: ["'none'"],
    // Deshabilitar upgradeInsecureRequests en desarrollo para evitar redirecciones
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
  }
};

// Aplicar CSP
app.use(helmet({
  contentSecurityPolicy: cspConfig
}));

// Create HTTP server
const server = createServer(app);

// Set view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Trust proxy
app.enable('trust proxy');

// Set security HTTP headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'lax'
  },
  name: 'farmapp.sid'
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));

// Set global template variables
app.use((req, res, next) => {
  res.locals.appName = process.env.APP_NAME || 'FarmApp';
  res.locals.currentYear = new Date().getFullYear();
  res.locals.currentPath = req.path;
  next();
});

// Compress all responses
app.use(compression());

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  extensions: ['html', 'htm'],
  index: ['login.html']
}));

// API Routes - Mount products routes first to avoid conflicts
app.use('/api', productsRoutes);
app.use('/api', apiRoutes);
app.use('/api/sales', salesRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  } else if (req.accepts('json')) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.type('txt').send('Not found');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (res.headersSent) {
    return next(err);
  }
  
  if (req.accepts('html')) {
    res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
  } else if (req.accepts('json')) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } else {
    res.type('txt').send('Internal Server Error');
  }
});

// Export the app and server for testing and starting the server
module.exports = { app, server };
