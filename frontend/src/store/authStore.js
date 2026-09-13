import { create } from 'zustand'
import { authService } from '../services/authService'
import { useDemoStore } from './useDemoStore'

const storedCustomer = JSON.parse(localStorage.getItem('customer') || 'null')

export const useAuthStore = create((set) => ({
  customer: storedCustomer,
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,

  login: async (identifier, password) => {
    set({ loading: true, error: null })
    try {
      const { customer } = await authService.login(identifier, password)
      useDemoStore.getState().setBackendProfile(customer)
      set({ customer, isAuthenticated: true, loading: false })
      return customer
    } catch (error) {
      set({ loading: false, error: error.response?.data?.error || 'Login failed. Please check your credentials.' })
      throw error
    }
  },

  register: async (formData) => {
    set({ loading: true, error: null })
    try {
      const { customer } = await authService.register(formData)
      useDemoStore.getState().setBackendProfile(customer)
      set({ customer, isAuthenticated: true, loading: false, error: null })
      return customer
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Registration failed. Please try again.'
      set({ loading: false, error: msg })
      throw new Error(msg)
    }
  },

  loginWithOtp: async (email, otp) => {
    set({ loading: true, error: null })
    try {
      const { customer } = await authService.loginWithOtp(email, otp)
      useDemoStore.getState().setBackendProfile(customer)
      set({ customer, isAuthenticated: true, loading: false, error: null })
      return customer
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'OTP Login failed. Please check the code.'
      set({ loading: false, error: msg })
      throw new Error(msg)
    }
  },

  loginDemo: (profile) => {
    const demoUser = {
      customer_id: profile.id,
      name: profile.name,
      email: profile.email,
      segment: profile.segment,
      language: profile.language,
    }
    localStorage.setItem('access_token', `demo_access_token_${Date.now()}`)
    localStorage.setItem('customer', JSON.stringify(demoUser))
    set({ customer: demoUser, isAuthenticated: true, loading: false, error: null })
    useDemoStore.getState().setActiveProfile(profile.id)
    return demoUser
  },

  logout: () => {
    authService.logout()
    set({ customer: null, isAuthenticated: false, error: null })
  },

  clearError: () => set({ error: null }),

  setCustomer: (customer) => {
    localStorage.setItem('customer', JSON.stringify(customer))
    set({ customer, isAuthenticated: !!localStorage.getItem('access_token') })
  }
}))

if (storedCustomer?.customer_id?.startsWith('CUST_')) {
  useDemoStore.getState().setBackendProfile(storedCustomer)
}
