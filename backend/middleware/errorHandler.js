/**
 * Global Error Handling Middleware
 * Ensures all uncaught errors return a consistent JSON response
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  const response = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  // Only include stack trace during non-production development environments
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
