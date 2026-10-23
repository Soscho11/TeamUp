const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/apiResponse');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many attempts. Please try again after 15 minutes.', [], 429);
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Limit each IP to 500 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Rate limit exceeded. Please slow down your requests.', [], 429);
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};
