/**
 * Health Controller
 * Provides system status and service health information
 */
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Campus Lost and Found API is healthy and running',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    environment: process.env.NODE_ENV || 'development'
  });
};

module.exports = {
  getHealth
};
