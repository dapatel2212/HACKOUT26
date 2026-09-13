import React, { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useLoanStore } from '../store/useLoanStore'
import { useDemoStore } from '../store/useDemoStore'
import { useAuthStore } from '../store/authStore'
import { loanService } from '../services/loanService'

export const Route = createFileRoute('/_auth/loans')({
  component: LoansPage,
})

const LOAN_PRODUCTS = [
  { id: 'personal', name: 'Personal Loan', rate: 11.5, max: 200000, desc: 'Instant micro-credit for personal or family needs' },
  { id: 'home', name: 'Home Loan', rate: 8.4, max: 2500000, desc: 'Affordable housing finance with PMAY interest subsidy' },
  { id: 'car', name: 'Car Loan', rate: 9.2, max: 800000, desc: 'Vehicle financing with zero foreclosure penalties' },
  { id: 'education', name: 'Education Loan', rate: 8.8, max: 1500000, desc: 'Higher studies collateral-free vocational credit' },
  { id: 'kisan', name: 'Kisan Credit', rate: 4.0, max: 300000, desc: 'Subsidized crop-season liquidity for farmers' },
  { id: 'credit_card', name: 'Credit Card', rate: 14.0, max: 100000, desc: 'Zero annual fee RuPay card linked with UPI' },
  { id: 'credit_line', name: 'Credit Line', rate: 12.0, max: 150000, desc: 'Pre-approved revolving overdraft limit' },
]

function LoansPage() {
  const { step, loanDetails, nextStep, prevStep, updateLoanDetails, resetLoan } = useLoanStore()
  const { activeProfile, canApplyForLoan, addLoanToActiveProfile } = useDemoStore()
  const { customer } = useAuthStore()

  // Dedicated interactive EMI calculator state
  const [calcAmount, setCalcAmount] = useState(loanDetails.amount || 50000)
  const [calcTenure, setCalcTenure] = useState(loanDetails.tenureMonths || 12)
  const [calcRate, setCalcRate] = useState(11.5)
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [supportMessage, setSupportMessage] = useState('')
  const panInput = 'ABCDE1234F'
  const aadhaarInput = 'XXXX-XXXX-8921'
  const [appId, setAppId] = useState(loanDetails.applicationId || '')

  // Helper to completely clear old loan info so it does not affect new loan requests
  const handleResetLoan = () => {
    resetLoan()
    setAppId('')
    setCalcAmount(50000)
    setCalcTenure(12)
    setCalcRate(11.5)
    setSupportModalOpen(false)
    setSupportMessage('')
  }

  // Clear previous loan state when profile changes
  React.useEffect(() => {
    handleResetLoan()
  }, [activeProfile.id])

  // Compute EMI
  const monthlyRate = calcRate / (12 * 100)
  const emiVal = Math.round(
    (calcAmount * monthlyRate * Math.pow(1 + monthlyRate, calcTenure)) /
    (Math.pow(1 + monthlyRate, calcTenure) - 1)
  )
  const totalPayable = emiVal * calcTenure
  const totalInterest = totalPayable - calcAmount

  // 1. Stress Guardrail Blocking (stress score above 50 threshold)
  const userStressScore = customer ? Number(customer.stress_score || 0) : Number(activeProfile.stressScore || 0)
  const isBlockedByGuardrail = userStressScore > 50

  if (isBlockedByGuardrail) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-amber-300 dark:border-amber-800 shadow-sm text-center space-y-4">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
            Responsible Lending Guardrail Active
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Let's strengthen your finances first.
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Your current financial stress score is <b>{Number(activeProfile.stressScore || 0).toFixed(2)}/100</b>. Under BankBuddy's ethical AI commitment, a new loan could add pressure right now. We do not promote debt that could destabilize your household.
          </p>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-left max-w-lg mx-auto text-xs text-amber-950 dark:text-amber-200 space-y-2">
            <div className="font-bold uppercase tracking-wider text-[11px]">
              We can help reduce your current payments instead:
            </div>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>&bull; <b>Restructure EMI:</b> Extend tenure by 12 months to reduce monthly outflow.</li>
              <li>&bull; <b>Shift EMI Date:</b> Move deduction dates to align with actual income days.</li>
              <li>&bull; <b>Vernacular Counselor:</b> Free 1-on-1 confidential advice in {activeProfile.languageName}.</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSupportMessage('EMI Restructuring application initiated. Our support desk will call you to confirm your revised schedule.')
                setSupportModalOpen(true)
              }}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-900 dark:bg-amber-700 text-white hover:bg-amber-800 transition shadow-sm"
            >
              Restructure EMI
            </button>
            <button
              onClick={() => {
                setSupportMessage('EMI Date Shift request submitted. Due date shifted from 5th to 15th of each month.')
                setSupportModalOpen(true)
              }}
              className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Shift EMI Date
            </button>
            <Link
              to="/ai"
              className="px-5 py-2.5 text-xs font-bold rounded-xl border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition"
            >
              Talk to Counselor
            </Link>
          </div>

          {supportModalOpen && (
            <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-xs font-semibold">
              {supportMessage}
            </div>
          )}
        </div>
      </div>
    )
  }

  const steps = [
    { num: 1, title: 'Product' },
    { num: 2, title: 'Amount' },
    { num: 3, title: 'Tenure' },
    { num: 4, title: 'Details' },
    { num: 5, title: 'Income' },
    { num: 6, title: 'KYC' },
    { num: 7, title: 'Confirm' },
  ]

  const handleProductSelect = (product) => {
    updateLoanDetails({
      product: product.name,
      interestRate: product.rate,
      maxLimit: product.max,
    })
    setCalcRate(product.rate)
    nextStep()
  }

  const PROFILE_TO_CUST_ID = {
    ramesh: 'CUST_DEMO_001',
    priya: 'CUST_DEMO_002',
    suresh: 'CUST_DEMO_003',
    arjun: 'CUST_DEMO_004',
    meena: 'CUST_DEMO_005',
    cust_demo_101: 'CUST_DEMO_101',
    cust_demo_102: 'CUST_DEMO_102',
  }

  const handleSubmitApplication = async () => {
    let finalAppId = ''
    let finalStatus = 'PENDING'
    let rejectionReason = ''

    const targetCustId = customer?.customer_id || PROFILE_TO_CUST_ID[activeProfile.id] || activeProfile.id

    try {
      const application = await loanService.applyLoan({
        customer_id: targetCustId,
        product_name: loanDetails.product || 'Personal Loan',
        amount: calcAmount,
        tenure_months: calcTenure,
      })
      finalAppId = application.application_id || `LN_${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      finalStatus = application.status || 'PENDING'
      setAppId(finalAppId)
      updateLoanDetails({ applicationId: finalAppId, status: finalStatus })
    } catch (err) {
      finalAppId = `LN_${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      finalStatus = 'REJECTED'
      rejectionReason = err?.response?.data?.error || 'Ethical AI Guardrail: Financial stress score exceeds safety threshold (50).'
      setAppId(finalAppId)
      updateLoanDetails({ applicationId: finalAppId, status: finalStatus })
    }

    addLoanToActiveProfile({
      id: finalAppId,
      productName: loanDetails.product || 'Personal Loan',
      amount: calcAmount,
      tenureMonths: calcTenure,
      monthlyEmi: emiVal,
      appliedDate: 'Just Now',
      status: finalStatus,
      rejection_reason: rejectionReason,
      category: 'Credit Facility',
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Loan & Credit Application
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent, zero-hidden-fee digital lending for {activeProfile.name}
          </p>
        </div>
        <button
          onClick={handleResetLoan}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
        >
          Reset Application
        </button>
      </div>

      {/* 7-Step Numbered Stepper */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[500px]">
          {steps.map((s, idx) => {
            const isCompleted = step > s.num
            const isCurrent = step === s.num
            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isCurrent
                        ? 'bg-indigo-900 dark:bg-indigo-600 text-white ring-2 ring-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓' : `0${s.num}`}
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      isCurrent
                        ? 'text-indigo-900 dark:text-indigo-400'
                        : isCompleted
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step > idx + 1 ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Interactive Step Content Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* STEP 1: Product Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 1: Select Loan Product
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a product tailored to your specific financial objective
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {LOAN_PRODUCTS.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleProductSelect(prod)}
                  className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 transition flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {prod.name}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-indigo-700 dark:text-indigo-400">
                      {prod.rate}% p.a.
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {prod.desc}
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Limit up to ₹{prod.max.toLocaleString('en-IN')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Loan Amount */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 2: Choose Loan Amount
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selected Product: <b>{loanDetails.product || 'Personal Loan'}</b> (Rate: {loanDetails.interestRate || 11.5}% p.a.)
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Desired Amount
              </span>
              <div className="text-4xl font-extrabold text-indigo-900 dark:text-indigo-400 font-mono">
                ₹{calcAmount.toLocaleString('en-IN')}
              </div>

              <input
                type="range"
                min="5000"
                max={loanDetails.maxLimit || 200000}
                step="5000"
                value={calcAmount}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setCalcAmount(val)
                  updateLoanDetails({ amount: val })
                }}
                className="w-full accent-indigo-900 dark:accent-indigo-500 cursor-pointer"
              />

              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>Min: ₹5,000</span>
                <span>Max: ₹{(loanDetails.maxLimit || 200000).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={prevStep}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-indigo-900 dark:bg-indigo-600 text-white hover:bg-indigo-800 transition"
              >
                Continue to Tenure
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Tenure Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 3: Choose Repayment Tenure
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select your preferred repayment duration
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[6, 12, 18, 24, 36].map((months) => {
                const isSelected = calcTenure === months
                return (
                  <button
                    key={months}
                    type="button"
                    onClick={() => {
                      setCalcTenure(months)
                      updateLoanDetails({ tenureMonths: months })
                    }}
                    className={`p-4 rounded-2xl border text-center transition ${
                      isSelected
                        ? 'border-indigo-900 bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {months}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Months</div>
                  </button>
                )
              })}
            </div>

            {/* Live EMI Preview Widget */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                  Estimated EMI
                </span>
                <span className="font-mono font-extrabold text-sm text-indigo-900 dark:text-indigo-400">
                  ₹{emiVal.toLocaleString('en-IN')}/mo
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                  Total Interest
                </span>
                <span className="font-mono font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  ₹{totalInterest.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                  Total Payable
                </span>
                <span className="font-mono font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  ₹{totalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={prevStep}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-indigo-900 dark:bg-indigo-600 text-white hover:bg-indigo-800 transition"
              >
                Continue to Personal Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Personal Details */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 4: Personal & Identification Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify your customer information according to RBI Know-Your-Customer standards
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Applicant Name
                </label>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={activeProfile.name}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Income Segment
                </label>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={activeProfile.displaySegment}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Permanent Account Number (PAN)
                </label>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={panInput}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Masked Aadhaar Number
                </label>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={aadhaarInput}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              Identity information validated through NPCI / UIDAI authorized e-Sign gateway.
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={prevStep}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <button
                onClick={() => {
                  updateLoanDetails({ pan: panInput, aadhaar: aadhaarInput, personalDetailsCompleted: true })
                  nextStep()
                }}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-indigo-900 dark:bg-indigo-600 text-white hover:bg-indigo-800 transition"
              >
                Continue to Income Proof
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Income Proof */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 5: Income Proof Verification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect Account Aggregator or verify statement
              </p>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center bg-slate-50 dark:bg-slate-850 space-y-3">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
                Account Aggregator (AA) Auto-Fetch
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                BankBuddy automatically retrieved 3 months verified cash-flows for <b>{activeProfile.name}</b> with an estimated average monthly inflow of <b>₹{activeProfile.monthlyIncome.toLocaleString('en-IN')}</b>.
              </p>
              <div className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400">
                Income Verified &bull; AA Consent Token #AA-9982
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={prevStep}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <button
                onClick={() => {
                  updateLoanDetails({ incomeProofUploaded: true })
                  nextStep()
                }}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-indigo-900 dark:bg-indigo-600 text-white hover:bg-indigo-800 transition"
              >
                Proceed to KYC
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Video KYC / Verification */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 6: Real-Time Digital KYC
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Regulatory mandatory verification under RBI Digital Lending Guidelines
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Video Liveness & Verification Agent
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400">
                  Agent Ready
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Verification officer is connected. In this demo session, digital verification checks face match, location geo-tag (Mumbai, India), and PAN card OCR authenticity.
              </p>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-1">
                <div className="text-green-600 dark:text-green-400">[OK] Facial Geometry Match: 99.4%</div>
                <div className="text-green-600 dark:text-green-400">[OK] Geo-location inside Bharat (ap-south-1)</div>
                <div className="text-green-600 dark:text-green-400">[OK] Aadhaar OTP Authenticated</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={prevStep}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <button
                onClick={() => {
                  updateLoanDetails({ kycCompleted: true })
                  nextStep()
                }}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-indigo-900 dark:bg-indigo-600 text-white hover:bg-indigo-800 transition"
              >
                Confirm & Review Application
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Final Confirmation & Submission */}
        {step === 7 && (
          <div className="space-y-6">
            {!appId ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Step 7: Final Loan Review & Sanction
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review your application summary before formal submission
                  </p>
                </div>

                {/* Clean Summary Table */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="p-3.5 flex justify-between">
                    <span className="text-slate-500">Selected Product</span>
                    <span className="font-bold text-slate-900 dark:text-white">{loanDetails.product || 'Personal Loan'}</span>
                  </div>
                  <div className="p-3.5 flex justify-between">
                    <span className="text-slate-500">Loan Principal</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">₹{calcAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-3.5 flex justify-between">
                    <span className="text-slate-500">Repayment Duration</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{calcTenure} Months</span>
                  </div>
                  <div className="p-3.5 flex justify-between">
                    <span className="text-slate-500">Interest Rate</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{calcRate}% p.a.</span>
                  </div>
                  <div className="p-3.5 flex justify-between">
                    <span className="text-slate-500">Estimated Monthly EMI</span>
                    <span className="font-bold text-indigo-900 dark:text-indigo-400 font-mono">₹{emiVal.toLocaleString('en-IN')} / month</span>
                  </div>
                  <div className="p-3.5 flex justify-between">
                    <span className="text-slate-500">Applicant</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeProfile.name} ({activeProfile.displaySegment})</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 text-[11px] text-slate-500 dark:text-slate-400">
                  Note: This application is processed in simulated demonstration mode. No credit bureau pulls or real debits will be executed.
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={prevStep}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    className="px-6 py-2.5 text-xs font-bold rounded-xl bg-green-700 hover:bg-green-800 text-white transition shadow-sm"
                  >
                    Submit Loan Application
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4 animate-in fade-in">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400">
                  Application Submitted for Review
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Thank you, {activeProfile.name}.
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Your loan application for <b>₹{calcAmount.toLocaleString('en-IN')}</b> has been processed with Application ID <b>{appId}</b>.
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <div>First EMI Date: 10th of Next Month</div>
                  <div>Monthly Deduction: ₹{emiVal.toLocaleString('en-IN')}</div>
                  <div className="text-slate-400 text-[10px]">Simulated Demo Submission &bull; No Real Bureau Record</div>
                </div>

                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleResetLoan}
                    className="px-5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50"
                  >
                    Apply for Another Loan
                  </button>
                  <Link
                    to="/profile"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm"
                  >
                    View Status in Profile Ledger
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={handleResetLoan}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-900 text-white hover:bg-indigo-800"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Standalone Interactive EMI Calculator Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Dynamic EMI Estimator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate exact monthly obligations with dynamic updates
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400">
            {calcRate}% Interest Rate
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Monthly EMI
            </span>
            <span className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-400 font-mono">
              ₹{emiVal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Interest Payable
            </span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 font-mono">
              ₹{totalInterest.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Repayment
            </span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 font-mono">
              ₹{totalPayable.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
