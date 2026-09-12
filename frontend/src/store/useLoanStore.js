import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const initialLoanDetails = {
  product: '',
  amount: 50000,
  tenureMonths: 12,
  interestRate: 11.5,
  maxLimit: 200000,
  applicationId: '',
  personalDetailsCompleted: false,
  incomeProofUploaded: false,
  kycCompleted: false,
}

export const useLoanStore = create(
  persist(
    (set) => ({
      step: 1, // 1: product, 2: amount, 3: tenure, 4: details, 5: income, 6: kyc, 7: confirmation
      loanDetails: initialLoanDetails,
      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 7) })),
      prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
      updateLoanDetails: (updates) => set((state) => ({ 
        loanDetails: { ...state.loanDetails, ...updates } 
      })),
      resetLoan: () => set({ 
        step: 1, 
        loanDetails: { ...initialLoanDetails } 
      }),
    }),
    { name: 'bankbuddy-loan-storage' }
  )
)
