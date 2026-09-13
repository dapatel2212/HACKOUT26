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
    description: 'Irregular crop-cycle income with seasonal agricultural cash flows.',
    loans: [
      {
        id: 'LN_KCC_8810',
        productName: 'Kisan Crop Credit Loan',
        amount: 75000,
        tenureMonths: 12,
        monthlyEmi: 6640,
        appliedDate: '15 Jan 2026',
        status: 'ACCEPTED',
        category: 'Agriculture',
      },
      {
        id: 'LN_EQ_9921',
        productName: 'Solar Pump & Equipment Loan',
        amount: 50000,
        tenureMonths: 24,
        monthlyEmi: 2340,
        appliedDate: '02 May 2026',
        status: 'ACCEPTED',
        category: 'Equipment',
      },
    ],
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
    description: 'Predictable corporate salary with high disciplined savings.',
    loans: [
      {
        id: 'LN_PL_4420',
        productName: 'Pre-Approved Personal Loan',
        amount: 150000,
        tenureMonths: 36,
        monthlyEmi: 4950,
        appliedDate: '10 Nov 2025',
        status: 'ACCEPTED',
        category: 'Personal',
      },
      {
        id: 'LN_VL_3104',
        productName: 'Electric Vehicle Loan',
        amount: 80000,
        tenureMonths: 24,
        monthlyEmi: 3740,
        appliedDate: '18 Feb 2026',
        status: 'ACCEPTED',
        category: 'Vehicle',
      },
    ],
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
    description: 'Retail trading cash flows with daily QR and digital payments.',
    loans: [
      {
        id: 'LN_WC_7712',
        productName: 'Working Capital Merchant Overdraft',
        amount: 100000,
        tenureMonths: 12,
        monthlyEmi: 8850,
        appliedDate: '04 Mar 2026',
        status: 'ACCEPTED',
        category: 'Business',
      },
      {
        id: 'LN_EM_5091',
        productName: 'Inventory Expansion Loan',
        amount: 60000,
        tenureMonths: 18,
        monthlyEmi: 3640,
        appliedDate: '20 Aug 2026',
        status: 'PENDING',
        category: 'Business',
      },
    ],
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
    description: 'Weekly platform payouts with moderate discretionary spend.',
    loans: [
      {
        id: 'LN_TW_6615',
        productName: 'Two-Wheeler Vehicle Loan',
        amount: 45000,
        tenureMonths: 12,
        monthlyEmi: 3980,
        appliedDate: '12 Dec 2025',
        status: 'ACCEPTED',
        category: 'Vehicle',
      },
      {
        id: 'LN_MB_2209',
        productName: 'Instant Micro-Credit',
        amount: 15000,
        tenureMonths: 6,
        monthlyEmi: 2580,
        appliedDate: '01 Jul 2026',
        status: 'PENDING',
        category: 'Microfinance',
      },
    ],
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
    description: 'Elevated debt obligations. Protection rules active.',
    loans: [
      {
        id: 'LN_ST_1102',
        productName: 'Emergency Household Loan',
        amount: 30000,
        tenureMonths: 12,
        monthlyEmi: 2650,
        appliedDate: '14 Apr 2026',
        status: 'ACCEPTED',
        category: 'Personal',
      },
      {
        id: 'LN_AP_9043',
        productName: 'Additional Personal Credit',
        amount: 50000,
        tenureMonths: 24,
        monthlyEmi: 2340,
        appliedDate: '05 Sep 2026',
        status: 'REJECTED',
        category: 'Personal',
        reason: 'Ethical Guardrail: Stress score 72.00 exceeds safety threshold (50)',
      },
    ],
  },
  VIKRAM: {
    id: 'cust_demo_101',
    name: 'Vikram Mehta',
    email: 'vikram@demo.bankbuddy.in',
    segment: 'prudent_savers',
    displaySegment: 'Salaried Professional',
    language: 'en',
    languageName: 'English',
    stressScore: 15.42,
    status: 'GREEN',
    balance: 245000,
    monthlyIncome: 95000,
    savingsRate: 28,
    wellnessScore: 88,
    upcomingEmi: 24150,
    recommendedThemes: ['Growth SIP', 'Tax Saver ELSS', 'Health Insurance Top-Up'],
    description: 'Stable corporate salary with high savings discipline and long-term wealth building.',
    loans: [
      {
        id: 'LN_VM_2201',
        productName: 'Home Loan',
        amount: 2500000,
        tenureMonths: 240,
        monthlyEmi: 24150,
        appliedDate: '10 Aug 2025',
        status: 'ACCEPTED',
        category: 'Housing',
      },
      {
        id: 'LN_VM_2202',
        productName: 'Pre-Approved Personal Loan',
        amount: 100000,
        tenureMonths: 24,
        monthlyEmi: 4680,
        appliedDate: '18 Mar 2026',
        status: 'ACCEPTED',
        category: 'Personal',
      },
      {
        id: 'LN_VM_2203',
        productName: 'Education Loan (Child)',
        amount: 500000,
        tenureMonths: 60,
        monthlyEmi: 10250,
        appliedDate: '01 Sep 2026',
        status: 'PENDING',
        category: 'Education',
      },
    ],
  },
  ANITA: {
    id: 'cust_demo_102',
    name: 'Anita Joshi',
    email: 'anita@demo.bankbuddy.in',
    segment: 'digital_natives',
    displaySegment: 'Small Business Owner',
    language: 'hi',
    languageName: 'Hindi',
    stressScore: 38.75,
    status: 'YELLOW',
    balance: 67800,
    monthlyIncome: 55000,
    savingsRate: 10,
    wellnessScore: 61,
    upcomingEmi: 13280,
    recommendedThemes: ['Smart Overdraft', 'Shop Insurance', 'Merchant POS'],
    description: 'Daily UPI merchant payments with moderate working capital requirements.',
    loans: [
      {
        id: 'LN_AJ_3301',
        productName: 'Working Capital Overdraft',
        amount: 150000,
        tenureMonths: 12,
        monthlyEmi: 13280,
        appliedDate: '05 Jan 2026',
        status: 'ACCEPTED',
        category: 'Business',
      },
      {
        id: 'LN_AJ_3302',
        productName: 'Shop Renovation Loan',
        amount: 80000,
        tenureMonths: 18,
        monthlyEmi: 4860,
        appliedDate: '20 May 2026',
        status: 'ACCEPTED',
        category: 'Business',
      },
      {
        id: 'LN_AJ_3303',
        productName: 'Two-Wheeler Loan',
        amount: 60000,
        tenureMonths: 12,
        monthlyEmi: 5310,
        appliedDate: '12 Aug 2026',
        status: 'REJECTED',
        category: 'Vehicle',
        reason: 'Ethical AI Guardrail: Existing business loan obligations create elevated risk.',
      },
    ],
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
    const custIdLower = (customer.customer_id || '').toLowerCase()
    const demoIds = ['ramesh', 'priya', 'suresh', 'arjun', 'meena', 'cust_demo_101', 'cust_demo_102']
    const isDemoId = demoIds.includes(custIdLower)
    if (isDemoId) {
      const matched = Object.values(PROFILES).find((p) => p.id === custIdLower)
      if (matched) {
        set({ isDemoMode: true, activeProfile: matched })
        return
      }
    }

    set({
      isDemoMode: false,
      activeProfile: {
        id: customer.customer_id,
        name: customer.name || 'New Customer',
        email: customer.email || '',
        segment: customer.segment || 'prudent_savers',
        displaySegment: customer.segment ? customer.segment.replace('_', ' ').toUpperCase() : 'New Account',
        language: customer.language || 'en',
        languageName: 'English',
        stressScore: customer.stress_score ?? 0,
        status: customer.stress_level || 'GREEN',
        balance: customer.balance ?? 0,
        monthlyIncome: customer.income_monthly ?? 0,
        savingsRate: 0,
        wellnessScore: customer.wellness_score ?? 50,
        upcomingEmi: 0,
        recommendedThemes: ['Account Setup', 'Financial Literacy', 'Emergency Savings'],
        description: 'Newly registered customer account.',
        loans: [],
      },
    })
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
    return (profile?.stressScore ?? 0) <= 50
  },

  addLoanToActiveProfile: (loanRecord) => {
    set((state) => ({
      activeProfile: {
        ...state.activeProfile,
        loans: [loanRecord, ...(state.activeProfile.loans || [])],
      },
    }))
  },
}))
