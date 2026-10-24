const mongoose = require('mongoose');

/**
 * Sanitizes MongoDB connection URI to mask credentials in log messages
 * @param {string} uri - The connection URI
 * @returns {string} - Sanitized URI safe for logging
 */
const sanitizeUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
};

/**
 * Connect to MongoDB database
 * Safely handles connection attempts and avoids leaking credentials
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // Check if URI is missing or contains placeholder values
  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.warn(
      '\n[Database Notice] MONGODB_URI is not configured in your .env file.\n' +
      'To connect to a live MongoDB Atlas database:\n' +
      '  1. Create a ".env" file in the backend/ folder based on ".env.example".\n' +
      '  2. Set MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/campus-lost-found\n' +
      'Backend will continue running in health-only mode until database is connected.\n'
    );
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s if Atlas host is unreachable
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // Sanitize any URI details in the error message to protect credentials
    const safeError = error.message.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.error(`[MongoDB Connection Error] Failed to connect: ${safeError}`);
    console.error('Tip: Check your MongoDB Atlas Network Access (IP Whitelist) and credentials.');
    return null;
  }
};

/**
 * Disconnect from MongoDB (useful for test cleanup and graceful shutdown)
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  sanitizeUri
};
