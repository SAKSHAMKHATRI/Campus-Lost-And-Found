const express = require('express');
const router = express.Router();
const { getHealth } = require('../controllers/healthController');

// GET /api/health - Health check endpoint
router.get('/health', getHealth);

module.exports = router;
