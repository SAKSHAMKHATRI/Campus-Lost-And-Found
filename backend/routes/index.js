const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');

// Mount routes
router.use('/', healthRoutes);

// Future routes (Issue #3: items CRUD) will be mounted here:
// router.use('/items', itemRoutes);

module.exports = router;
