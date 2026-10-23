const authService = require('../services/authService');
const { successResponse } = require('../utils/apiResponse');
const { setAuthCookie, clearAuthCookie } = require('../utils/jwt');

async function register(req, res, next) {
  try {
    const { user, token } = await authService.register(req.body);
    setAuthCookie(res, token);
    return successResponse(
      res,
      'Registration successful. Welcome to TeamUp!',
      { user, token },
      201
    );
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { user, token } = await authService.login(req.body);
    setAuthCookie(res, token);
    return successResponse(
      res,
      'Login successful. Welcome back!',
      { user, token }
    );
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  clearAuthCookie(res);
  return successResponse(res, 'Logged out successfully');
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return successResponse(res, 'Session authenticated', { user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
};

