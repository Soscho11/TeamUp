import api from './api';

export const requestService = {
  async submitJoinRequest(projectId, message) {
    const response = await api.post(`/projects/${projectId}/requests`, { message });
    return response.data.request;
  },

  async getSentRequests() {
    const response = await api.get('/requests/sent');
    return response.data.requests;
  },

  async getReceivedRequests() {
    const response = await api.get('/requests/received');
    return response.data.requests;
  },

  async updateRequestStatus(requestId, status) {
    const response = await api.patch(`/requests/${requestId}/status`, { status });
    return response.data;
  },

  async deleteRequest(requestId) {
    const response = await api.delete(`/requests/${requestId}`);
    return response;
  },
};

