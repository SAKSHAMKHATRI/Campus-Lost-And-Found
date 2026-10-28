const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security and Parsing Middlewares
const allowedOrigins = [
  'https://campuslost-and-found.netlify.app',
  'https://campus-lost-and-found-r1d3.onrender.com',
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

// Safely resolve frontend directory path relative to backend source location
const frontendPath = [
  path.resolve(__dirname, '../frontend'),
  path.resolve(__dirname, './frontend'),
  path.resolve(process.cwd(), 'frontend'),
  path.resolve(process.cwd(), '../frontend')
].find((dir) => fs.existsSync(dir)) || path.resolve(__dirname, '../frontend');

// 1. Mount API routes under /api (BEFORE static files so /api/* is never intercepted)
app.use('/api', apiRoutes);

// 2. Serve static frontend assets (CSS, JS, images, HTML)
app.use(express.static(frontendPath, {
  extensions: ['html']
}));

// Root endpoint: Serve frontend/index.html directly (Campus Lost & Found Login page)
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Login alias: Serve frontend/index.html
app.get('/login', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Catch-all 404 Handler for undefined routes
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
