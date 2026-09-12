import api from './api';

export const authService = {
  async login(identifier, password) {
    const res = await api.post('/auth/login/', {
      email: identifier,
      password: password,
    });
    const { tokens, customer } = res.data;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('customer', JSON.stringify(customer));
    return { customer, tokens };
  },

  async register(data) {
    const res = await api.post('/auth/register/', data);
    const { tokens, customer } = res.data;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('customer', JSON.stringify(customer));
    return { customer, tokens };
  },

  async getProfile() {
    const res = await api.get('/auth/profile/');
    return res.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('customer');
  }
};
