const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Prepared for Issue #2 (MongoDB Connection & Item Model)
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('Warning: MONGODB_URI is not set in environment variables.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Do not exit process during initialization to allow health endpoint to function
    return null;
  }
};

module.exports = { connectDB };
