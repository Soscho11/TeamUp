const teamService = require('../services/teamService');
const { successResponse } = require('../utils/apiResponse');

async function getProjectMembers(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const members = await teamService.getProjectMembers(projectId);
    return successResponse(res, 'Project members retrieved successfully', { members });
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const memberUserId = parseInt(req.params.userId, 10);
    await teamService.removeMember(projectId, memberUserId, req.user.id);
    return successResponse(res, 'Team member removed successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjectMembers,
  removeMember,
};
