import api from './api';

export const chatService = {
  async sendMessage(customerId, message, language = 'hi') {
    const res = await api.post('/chat/message/', {
      customer_id: customerId,
      message,
      language
    });
    return res.data;
  },

  async getHistory(customerId) {
    const res = await api.get(`/chat/history/${customerId}/`);
    return res.data;
  }
};
