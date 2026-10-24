import api from './api';

export const bookmarkService = {
  toggleBookmark: async (projectId) => {
    return await api.post(`/projects/${projectId}/bookmark`);
  },

  getUserBookmarks: async () => {
    return await api.get('/bookmarks');
  },
};
