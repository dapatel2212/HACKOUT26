import api from './api';

export const customerService = {
  async getCustomer(customerId) {
    const res = await api.get(`/customers/${customerId}/`);
    return res.data;
  },

  async updateCustomer(customerId, data) {
    const res = await api.put(`/customers/${customerId}/`, data);
    return res.data;
  },

  async getSegment(customerId) {
    const res = await api.get(`/customers/${customerId}/segment/`);
    return res.data;
  }
};
