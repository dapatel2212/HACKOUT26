import api from './api';

export const consentService = {
  async getConsent(customerId) {
    const res = await api.get(`/consent/${customerId}/`);
    return res.data;
  },

  async grantConsent(customerId, dataType) {
    const res = await api.post(`/consent/${customerId}/grant/`, { data_type: dataType });
    return res.data;
  },

  async revokeConsent(customerId, dataType) {
    const res = await api.post(`/consent/${customerId}/revoke/`, { data_type: dataType });
    return res.data;
  },

  async downloadData(customerId) {
    const res = await api.get('/consent/data-download/', {
      params: { customer_id: customerId }
    });
    return res.data;
  },

  async requestDelete(customerId) {
    const res = await api.post('/consent/delete-request/', { customer_id: customerId });
    return res.data;
  }
};
