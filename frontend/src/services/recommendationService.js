import api from './api';

export const recommendationService = {
  async getRecommendations(customerId) {
    const res = await api.get(`/recommendations/${customerId}/`);
    return res.data;
  },

  async acceptRecommendation(id) {
    const res = await api.post(`/recommendations/${id}/accept/`);
    return res.data;
  },

  async rejectRecommendation(id) {
    const res = await api.post(`/recommendations/${id}/reject/`);
    return res.data;
  }
};
