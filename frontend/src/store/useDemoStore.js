import { create } from 'zustand'
import i18n from '../i18n'

export const PROFILES = {
  RAMESH: {
    id: 'ramesh',
    name: 'Ramesh Kumar',
    email: 'farmer@demo.com',
    segment: 'seasonal_earners',
    displaySegment: 'Farmer',
    language: 'hi',
    languageName: 'Hindi',
    stressScore: 22,
    status: 'GREEN',
    balance: 54200,
    monthlyIncome: 32000,
    savingsRate: 18,
    wellnessScore: 78,
    upcomingEmi: 0,
    recommendedThemes: ['Weather Insurance', 'Kisan Credit', 'Flexible SIP'],
    description: 'Irregular crop-cycle income with seasonal agricultural cash flows.'
  },
  PRIYA: {
    id: 'priya',
    name: 'Priya Sharma',
    email: 'salaried@demo.com',
    segment: 'prudent_savers',
    displaySegment: 'Salaried',
    language: 'ta',
    languageName: 'Tamil',
    stressScore: 18,
    status: 'GREEN',
    balance: 185000,
    monthlyIncome: 85000,
    savingsRate: 32,
    wellnessScore: 92,
    upcomingEmi: 15000,
    recommendedThemes: ['Growth SIP', 'Health Insurance', 'Tax Saver Fund'],
    description: 'Predictable corporate salary with high disciplined savings.'
  },
  SURESH: {
    id: 'suresh',
    name: 'Suresh Patel',
    email: 'shop@demo.com',
    segment: 'digital_natives',
    displaySegment: 'Shop Owner',
    language: 'gu',
    languageName: 'Gujarati',
    stressScore: 45,
    status: 'YELLOW',
    balance: 42000,
    monthlyIncome: 60000,
    savingsRate: 12,
    wellnessScore: 62,
    upcomingEmi: 12500,
    recommendedThemes: ['Smart Overdraft', 'Business Account', 'POS Device'],
    description: 'Retail trading cash flows with daily QR and digital payments.'
  },
  ARJUN: {
    id: 'arjun',
    name: 'Arjun Singh',
    email: 'gig@demo.com',
    segment: 'aspiring_spenders',
    displaySegment: 'Gig Worker',
    language: 'en',
    languageName: 'English',
    stressScore: 30,
    status: 'GREEN',
    balance: 28500,
    monthlyIncome: 35000,
    savingsRate: 15,
    wellnessScore: 70,
    upcomingEmi: 4200,
    recommendedThemes: ['Micro Insurance', 'Emergency Fund', 'Flexible SIP'],
    description: 'Weekly platform payouts with moderate discretionary spend.'
  },
  MEENA: {
    id: 'meena',
    name: 'Meena Devi',
    email: 'stressed@demo.com',
    segment: 'stressed_accounts',
    displaySegment: 'Needs Support',
    language: 'mr',
    languageName: 'Marathi',
    stressScore: 72,
    status: 'ORANGE',
    balance: 6100,
    monthlyIncome: 22000,
    savingsRate: 2,
    wellnessScore: 35,
    upcomingEmi: 8400,
    recommendedThemes: ['Restructure EMI', 'Shift EMI Date', 'Financial Counselor'],
    description: 'Elevated debt obligations. Protection rules active.'
  },
}

export const useDemoStore = create((set, get) => ({
  activeProfile: PROFILES.RAMESH,
  isDemoMode: true,

  setActiveProfile: (profileId) => {
    const profile = Object.values(PROFILES).find((p) => p.id === profileId)
    if (profile) {
      set({ activeProfile: profile })
      localStorage.setItem('preferred_language', profile.language)
      i18n.changeLanguage(profile.language)
    }
  },

  setActiveByEmail: (email) => {
    const profile = Object.values(PROFILES).find((p) => p.email.toLowerCase() === email.toLowerCase())
    if (profile) {
      set({ activeProfile: profile })
      localStorage.setItem('preferred_language', profile.language)
      i18n.changeLanguage(profile.language)
      return profile
    }
    return null
  },

  setBackendProfile: (customer) => {
    set((state) => ({
      isDemoMode: false,
      activeProfile: {
        ...state.activeProfile,
        id: customer.customer_id,
        name: customer.name || state.activeProfile.name,
        email: customer.email || state.activeProfile.email,
        segment: customer.segment || state.activeProfile.segment,
        language: customer.language || state.activeProfile.language,
        stressScore: customer.stress_score ?? state.activeProfile.stressScore,
        status: customer.stress_level || state.activeProfile.status,
        monthlyIncome: customer.income_monthly ?? state.activeProfile.monthlyIncome,
      },
    }))
  },

  updateActiveProfileLanguage: (lang) => {
    const langNames = {
      gu: 'Gujarati',
      hi: 'Hindi',
      en: 'English',
      ta: 'Tamil',
      mr: 'Marathi',
      kn: 'Kannada',
      bn: 'Bengali',
      te: 'Telugu',
      ml: 'Malayalam',
      pa: 'Punjabi',
      or: 'Odia',
      as: 'Assamese',
    }
    set((state) => ({
      activeProfile: {
        ...state.activeProfile,
        language: lang,
        languageName: langNames[lang] || lang,
      },
    }))
  },

  toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),

  canApplyForLoan: () => {
    const profile = get().activeProfile
    return profile.stressScore <= 30
  },
}))
