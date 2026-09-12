import { create } from 'zustand';
import { customerService } from '../services/customerService';

export const useCustomerStore = create((set) => ({
  profile: null,
  segment: null,
  stressLevel: 'GREEN',
  stressScore: 0,
  loading: false,
  error: null,

  fetchProfile: async (customerId) => {
    set({ loading: true, error: null });
    try {
      const data = await customerService.getCustomer(customerId);
      set({
        profile: data,
        segment: data.segment,
        stressLevel: data.stress_level || 'GREEN',
        stressScore: data.stress_score || 0,
        loading: false
      });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateProfile: async (customerId, patchData) => {
    try {
      const updated = await customerService.updateCustomer(customerId, patchData);
      set((state) => ({ profile: { ...state.profile, ...updated } }));
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  }
}));
