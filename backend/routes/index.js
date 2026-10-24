const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const itemRoutes = require('./itemRoutes');

// Mount routes
router.use('/', healthRoutes);
router.use('/items', itemRoutes);

module.exports = router;
