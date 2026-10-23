const logger = require('../utils/logger');
const { errorResponse } = require('../utils/apiResponse');
const config = require('../config/env');

function notFoundHandler(req, res) {
  return errorResponse(res, `Resource not found: ${req.method} ${req.originalUrl}`, [], 404);
}

function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err);

  // MySQL Duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse(res, 'A record with this information already exists.', [], 409);
  }

  // MySQL Foreign key constraint failure
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return errorResponse(res, 'Referenced item does not exist.', [], 400);
  }

  // Bad JSON body syntax
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Invalid JSON payload received.', [], 400);
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message =
    statusCode === 500 && config.nodeEnv === 'production'
      ? 'An unexpected internal server error occurred.'
      : err.message || 'An error occurred';

  return errorResponse(res, message, [], statusCode);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
