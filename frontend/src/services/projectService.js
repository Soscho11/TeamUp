import api from './api';

export const projectService = {
  async getProjects(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.skill) query.append('skill', params.skill);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.order) query.append('order', params.order);

    const response = await api.get(`/projects?${query.toString()}`);
    return response.data;
  },

  async getProjectById(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data.project;
  },

  async createProject(projectData) {
    const response = await api.post('/projects', projectData);
    return response.data.project;
  },

  async updateProject(id, projectData) {
    const response = await api.patch(`/projects/${id}`, projectData);
    return response.data.project;
  },

  async deleteProject(id) {
    const response = await api.delete(`/projects/${id}`);
    return response;
  },

  async getMyProjects() {
    const response = await api.get('/projects/my');
    return response.data.projects;
  },

  async getDashboard() {
    const response = await api.get('/projects/dashboard');
    return response.data;
  },

  async removeMember(projectId, memberUserId) {
    const response = await api.delete(`/projects/${projectId}/members/${memberUserId}`);
    return response;
  },
};

