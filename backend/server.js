const dotenv = require('dotenv');

// Load environment variables from .env if present
dotenv.config();

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

// Render sets the PORT environment variable dynamically (do not hardcode in production)
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Ensure listening on all public container interfaces on Render

// Connect to MongoDB using environment configuration
connectDB();

// Start HTTP server
const server = app.listen(PORT, HOST, () => {
  console.log(`Campus Lost & Found backend listening on ${HOST}:${PORT} [env: ${process.env.NODE_ENV || 'development'}]`);
  console.log(`Health check available at /api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

// Graceful shutdown handling for container lifecycles (Render SIGTERM/SIGINT)
const handleShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down server...`);
  server.close(async () => {
    await disconnectDB();
    console.log('HTTP server and database connections closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = server;
