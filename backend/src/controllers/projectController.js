const projectService = require('../services/projectService');
const { successResponse } = require('../utils/apiResponse');

async function getProjects(req, res, next) {
  try {
    const result = await projectService.getProjects(req.query);
    return successResponse(res, 'Projects retrieved successfully', result);
  } catch (err) {
    next(err);
  }
}

async function createProject(req, res, next) {
  try {
    const project = await projectService.createProject(req.user.id, req.body);
    return successResponse(res, 'Project created successfully', { project }, 201);
  } catch (err) {
    next(err);
  }
}

async function getProjectById(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const userId = req.user ? req.user.id : null;
    const project = await projectService.getProjectById(projectId, userId);
    return successResponse(res, 'Project details retrieved successfully', { project });
  } catch (err) {
    next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const project = await projectService.updateProject(projectId, req.user.id, req.body);
    return successResponse(res, 'Project updated successfully', { project });
  } catch (err) {
    next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    await projectService.deleteProject(projectId, req.user.id);
    return successResponse(res, 'Project deleted successfully');
  } catch (err) {
    next(err);
  }
}

async function getMyProjects(req, res, next) {
  try {
    const projects = await projectService.getUserProjects(req.user.id);
    return successResponse(res, 'Your projects retrieved successfully', { projects });
  } catch (err) {
    next(err);
  }
}

async function getDashboard(req, res, next) {
  try {
    const dashboardData = await projectService.getDashboardData(req.user.id);
    return successResponse(res, 'Dashboard data retrieved successfully', dashboardData);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  getDashboard,
};

