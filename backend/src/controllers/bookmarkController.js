const bookmarkService = require('../services/bookmarkService');
const { successResponse } = require('../utils/apiResponse');

async function toggleBookmark(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const result = await bookmarkService.toggleBookmark(req.user.id, projectId);
    return successResponse(res, result.message, { is_bookmarked: result.is_bookmarked });
  } catch (err) {
    next(err);
  }
}

async function getUserBookmarks(req, res, next) {
  try {
    const projects = await bookmarkService.getUserBookmarks(req.user.id);
    return successResponse(res, 'Bookmarks retrieved successfully', { projects });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  toggleBookmark,
  getUserBookmarks,
};
