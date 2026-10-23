import api from './api';

export const userService = {
  async getMyProfile() {
    const response = await api.get('/users/me');
    return response.data.profile;
  },

  async updateMyProfile(profileData) {
    const response = await api.patch('/users/me', profileData);
    return response.data.profile;
  },

  async updateMySkills(skills) {
    const response = await api.put('/users/me/skills', { skills });
    return response.data.profile;
  },

  async getUserById(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data.user;
  },

  async getAllSkills() {
    const response = await api.get('/users/skills/all');
    return response.data.skills;
  },
};

