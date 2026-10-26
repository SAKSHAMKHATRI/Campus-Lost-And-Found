/**
 * JWT Configuration & Security Policy
 * Enforces production secret validation so weak fallbacks are strictly prohibited in production.
 */

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (
      !secret ||
      typeof secret !== 'string' ||
      secret.trim() === '' ||
      secret === 'your_jwt_secret_key_change_in_production' ||
      secret === 'campus-lost-found-dev-secret-key-2026' ||
      secret.length < 16
    ) {
      throw new Error(
        'FATAL: JWT_SECRET environment variable is missing, empty, or insecure in production. A strong secret of at least 16 characters is required.'
      );
    }
    return secret;
  }

  // Safe fallback for local development and offline unit tests only
  return secret || 'campus-lost-found-dev-secret-key-2026';
};

const getJwtExpiresIn = () => {
  return process.env.JWT_EXPIRES_IN || '7d';
};

module.exports = {
  getJwtSecret,
  getJwtExpiresIn
};
