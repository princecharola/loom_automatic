import { logger } from '../utils/logger.js';

export function errorHandler(error, req, res, next) {
  logger.error('Unhandled error', {
    path: req.originalUrl,
    method: req.method,
    message: error.message
  });

  if (res.headersSent) {
    return next(error);
  }

  const status = error.statusCode || 500;
  return res.status(status).json({
    message: error.message || 'Internal server error.'
  });
}
