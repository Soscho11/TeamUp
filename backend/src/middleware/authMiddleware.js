const { verifyToken, COOKIE_NAME } = require('../utils/jwt');
const { pool } = require('../config/db');
const { errorResponse } = require('../utils/apiResponse');

async function requireAuth(req, res, next) {
  try {
    let token = null;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }

    // 2. Fallback to Authorization Bearer header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in.', [], 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return errorResponse(res, 'Invalid or expired session. Please log in again.', [], 401);
    }

    // Fetch user from database to verify account exists and remains active
    const [rows] = await pool.execute(
      'SELECT id, name, email, university, department FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'User account no longer exists.', [], 401);
    }

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

async function optionalAuth(req, res, next) {
  try {
    let token = null;

    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const [rows] = await pool.execute(
          'SELECT id, name, email, university, department FROM users WHERE id = ?',
          [decoded.id]
        );
        if (rows.length > 0) {
          req.user = rows[0];
        }
      }
    }
    next();
  } catch (err) {
    // For optional auth, continue even if token is invalid
    next();
  }
}

module.exports = {
  requireAuth,
  optionalAuth,
};
