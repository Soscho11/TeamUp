import api from './api';

export const taskService = {
  getTasks: async (projectId) => {
    return await api.get(`/projects/${projectId}/tasks`);
  },

  createTask: async (projectId, data) => {
    return await api.post(`/projects/${projectId}/tasks`, data);
  },

  updateTask: async (taskId, data) => {
    return await api.patch(`/tasks/${taskId}`, data);
  },

  deleteTask: async (taskId) => {
    return await api.delete(`/tasks/${taskId}`);
  },
};
