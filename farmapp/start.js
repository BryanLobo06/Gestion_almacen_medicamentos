#!/usr/bin/env node

/**
 * Module dependencies.
 */
require('dotenv').config();
const debug = require('debug')('farmapp:server');
const { app, server } = require('./app');

// Log environment
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Connecting to database:', process.env.DB_NAME || 'drugstore');

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Start the server with error handling
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Visit: http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
  console.log(`Server running on http://localhost:${addr.port}`);
  
  // Log environment
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  // Log database connection status
  const db = require('./config/database');
  db.getConnection()
    .then(connection => {
      console.log('✅ Database connection has been established successfully.');
      connection.release();
    })
    .catch(err => {
      console.error('❌ Unable to connect to the database:', err);
    });
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Close server and exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server and exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = server;
