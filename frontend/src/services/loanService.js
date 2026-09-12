import api from './api';

export const loanService = {
  async getEligibility(customerId) {
    const res = await api.get(`/loan/eligibility/${customerId}/`);
    return res.data;
  },

  async calculateEMI(amount, tenureMonths, interestRate = 11.5) {
    const res = await api.post('/loan/emi-calculate/', {
      amount,
      tenure_months: tenureMonths,
      interest_rate: interestRate
    });
    return res.data;
  },

  async applyLoan(data) {
    const res = await api.post('/loan/apply/', data);
    return res.data;
  },

  async getStatus(applicationId) {
    const res = await api.get(`/loan/status/${applicationId}/`);
    return res.data;
  }
};
