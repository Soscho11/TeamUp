const userService = require('../services/userService');
const { successResponse } = require('../utils/apiResponse');

async function getMe(req, res, next) {
  try {
    const profile = await userService.getProfile(req.user.id);
    return successResponse(res, 'Profile retrieved successfully', { profile });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const updated = await userService.updateProfile(req.user.id, req.body);
    return successResponse(res, 'Profile updated successfully', { profile: updated });
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await userService.getUserById(parseInt(req.params.id, 10));
    return successResponse(res, 'User profile retrieved successfully', { user });
  } catch (err) {
    next(err);
  }
}

async function updateMySkills(req, res, next) {
  try {
    const updated = await userService.updateSkills(req.user.id, req.body.skills);
    return successResponse(res, 'Skills updated successfully', { profile: updated });
  } catch (err) {
    next(err);
  }
}

async function getAllSkills(req, res, next) {
  try {
    const skills = await userService.getAllSkills();
    return successResponse(res, 'Skills retrieved successfully', { skills });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMe,
  updateMe,
  getUserById,
  updateMySkills,
  getAllSkills,
};

