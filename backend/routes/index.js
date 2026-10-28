const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const itemRoutes = require('./itemRoutes');
const authRoutes = require('./authRoutes');

// Mount routes
// GET /api - API Welcome / Discovery endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Campus Lost & Found Backend API',
    endpoints: {
      health: '/api/health',
      items: '/api/items',
      auth: '/api/auth'
    }
  });
});

router.use('/', healthRoutes);
router.use('/items', itemRoutes);
router.use('/auth', authRoutes);

module.exports = router;

