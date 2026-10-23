const requestService = require('../services/requestService');
const { successResponse } = require('../utils/apiResponse');

async function createJoinRequest(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const request = await requestService.createJoinRequest(
      projectId,
      req.user.id,
      req.body.message
    );
    return successResponse(res, 'Join request submitted successfully', { request }, 201);
  } catch (err) {
    next(err);
  }
}

async function getSentRequests(req, res, next) {
  try {
    const requests = await requestService.getSentRequests(req.user.id);
    return successResponse(res, 'Sent requests retrieved successfully', { requests });
  } catch (err) {
    next(err);
  }
}

async function getReceivedRequests(req, res, next) {
  try {
    const requests = await requestService.getReceivedRequests(req.user.id);
    return successResponse(res, 'Received requests retrieved successfully', { requests });
  } catch (err) {
    next(err);
  }
}

async function updateRequestStatus(req, res, next) {
  try {
    const requestId = parseInt(req.params.id, 10);
    const result = await requestService.updateRequestStatus(
      requestId,
      req.user.id,
      req.body.status
    );
    return successResponse(res, `Request has been marked as ${result.status}`, result);
  } catch (err) {
    next(err);
  }
}

async function deleteRequest(req, res, next) {
  try {
    const requestId = parseInt(req.params.id, 10);
    await requestService.deleteRequest(requestId, req.user.id);
    return successResponse(res, 'Join request deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createJoinRequest,
  getSentRequests,
  getReceivedRequests,
  updateRequestStatus,
  deleteRequest,
};
