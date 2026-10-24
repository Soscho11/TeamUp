import api from './api';

export const discussionService = {
  getDiscussions: async (projectId, type = 'public_qa') => {
    return await api.get(`/projects/${projectId}/discussions?type=${type}`);
  },

  createDiscussion: async (projectId, data) => {
    return await api.post(`/projects/${projectId}/discussions`, data);
  },

  deleteDiscussion: async (discussionId) => {
    return await api.delete(`/discussions/${discussionId}`);
  },
};
