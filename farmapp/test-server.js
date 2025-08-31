const http = require('http');
const { app } = require('./app');

const PORT = process.env.PORT || 3000;

// Add a simple test route
app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

// Create HTTP server
const server = http.createServer(app);

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}/test`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
