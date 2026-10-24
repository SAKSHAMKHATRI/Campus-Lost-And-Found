const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security and Parsing Middlewares
const allowedOrigins = [
  'https://campuslost-and-found.netlify.app',
  process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for evaluation/development flexibility, or restrict as needed
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Campus Lost & Found Backend API',
    endpoints: {
      health: '/api/health',
      items: '/api/items (available in Issue #3)'
    }
  });
});

// Mount API routes under /api
app.use('/api', apiRoutes);

// Catch-all 404 Handler for undefined routes
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
