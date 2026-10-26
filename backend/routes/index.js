const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const itemRoutes = require('./itemRoutes');
const authRoutes = require('./authRoutes');

// Mount routes
router.use('/', healthRoutes);
router.use('/items', itemRoutes);
router.use('/auth', authRoutes);

module.exports = router;
