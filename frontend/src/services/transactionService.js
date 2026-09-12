import api from './api';

export const transactionService = {
  async getTransactions(customerId, params = {}) {
    const res = await api.get('/transactions/', {
      params: { customer_id: customerId, ...params }
    });
    return res.data;
  },

  async getInsights(customerId) {
    const res = await api.get(`/transactions/insights/${customerId}/`);
    return res.data;
  },

  async getSpendingCategories(customerId) {
    const res = await api.get(`/transactions/spending-categories/${customerId}/`);
    return res.data;
  }
};
