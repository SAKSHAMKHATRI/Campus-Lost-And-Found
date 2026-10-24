const dotenv = require('dotenv');

// Load environment variables from .env if present
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Attempt database connection if configured
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.log('Info: MONGODB_URI not set. Ready for Issue #2 database setup.');
}

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Campus Lost & Found backend listening on port ${PORT} [env: ${process.env.NODE_ENV || 'development'}]`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // In production we might gracefully close the server:
  // server.close(() => process.exit(1));
});

module.exports = server;
