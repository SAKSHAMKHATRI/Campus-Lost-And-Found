/**
 * 404 Not Found Middleware
 * Catches any unhandled route requests and returns structured JSON
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`
  });
};

module.exports = notFoundHandler;
