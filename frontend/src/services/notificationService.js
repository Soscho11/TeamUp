import api from './api';

export const notificationService = {
  async getNotifications(params = {}) {
    const query = new URLSearchParams();
    if (params.unreadOnly) query.append('unreadOnly', 'true');
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);

    const response = await api.get(`/notifications?${query.toString()}`);
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.unread_count;
  },

  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response;
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};
