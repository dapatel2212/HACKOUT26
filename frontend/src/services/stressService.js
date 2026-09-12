import api from './api';

export const stressService = {
  async getStatus(customerId) {
    const res = await api.get(`/stress/status/${customerId}/`);
    return res.data;
  },
};
