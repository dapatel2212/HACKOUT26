import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useOnboardingStore = create(
  persist(
    (set) => ({
      language: 'en',
      segment: null,
      consents: {
        dataUsage: false,
        location: false,
        financialAnalysis: false,
      },
      setLanguage: (lang) => set({ language: lang }),
      setSegment: (segment) => set({ segment }),
      toggleConsent: (key) => set((state) => ({ 
        consents: { ...state.consents, [key]: !state.consents[key] } 
      })),
      completeOnboarding: () => set({ isComplete: true }),
      isComplete: false,
    }),
    { name: 'onboarding-storage' }
  )
)
