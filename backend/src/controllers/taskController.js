const taskService = require('../services/taskService');
const { successResponse } = require('../utils/apiResponse');

async function getProjectTasks(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const tasks = await taskService.getProjectTasks(projectId);
    return successResponse(res, 'Tasks retrieved successfully', { tasks });
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const task = await taskService.createTask(projectId, req.user.id, req.body);
    return successResponse(res, 'Task created successfully', { task }, 201);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const task = await taskService.updateTask(taskId, req.user.id, req.body);
    return successResponse(res, 'Task updated successfully', { task });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const result = await taskService.deleteTask(taskId, req.user.id);
    return successResponse(res, result.message);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
};
