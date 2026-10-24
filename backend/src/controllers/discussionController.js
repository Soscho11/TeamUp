const discussionService = require('../services/discussionService');
const { successResponse } = require('../utils/apiResponse');

async function getProjectDiscussions(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const userId = req.user ? req.user.id : null;
    const type = req.query.type || 'public_qa';
    const discussions = await discussionService.getProjectDiscussions(projectId, userId, type);
    return successResponse(res, 'Discussions retrieved successfully', { discussions });
  } catch (err) {
    next(err);
  }
}

async function createDiscussion(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const discussion = await discussionService.createDiscussion(projectId, req.user.id, req.body);
    return successResponse(res, 'Discussion message posted', { discussion }, 201);
  } catch (err) {
    next(err);
  }
}

async function deleteDiscussion(req, res, next) {
  try {
    const discussionId = parseInt(req.params.id, 10);
    const result = await discussionService.deleteDiscussion(discussionId, req.user.id);
    return successResponse(res, result.message);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjectDiscussions,
  createDiscussion,
  deleteDiscussion,
};
