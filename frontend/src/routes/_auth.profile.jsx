import React, { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useDemoStore } from '../store/useDemoStore'
import { useAuthStore } from '../store/authStore'
import { loanService } from '../services/loanService'

export const Route = createFileRoute('/_auth/profile')({
  component: ProfilePage,
})

const PROFILE_METADATA = {
  ramesh: { location: 'Karnal, Haryana', dob: '14 May 1982', occupation: 'Agriculture & Grain Farming', kycDate: '12 Jan 2024' },
  priya: { location: 'Coimbatore, Tamil Nadu', dob: '22 Aug 1994', occupation: 'Senior Software Engineer', kycDate: '05 Mar 2023' },
  suresh: { location: 'Ahmedabad, Gujarat', dob: '03 Nov 1978', occupation: 'Retail Kirana Merchant', kycDate: '19 Jul 2023' },
  arjun: { location: 'Bengaluru, Karnataka', dob: '19 Jan 1999', occupation: 'Platform Delivery Partner', kycDate: '11 Oct 2024' },
  meena: { location: 'Solapur, Maharashtra', dob: '08 Feb 1986', occupation: 'Apparel Stitching & Tailoring', kycDate: '02 Feb 2023' },
  cust_demo_101: { location: 'Pune, Maharashtra', dob: '25 Mar 1990', occupation: 'IT Project Manager', kycDate: '15 Jun 2025' },
  cust_demo_102: { location: 'Jaipur, Rajasthan', dob: '12 Jul 1988', occupation: 'Boutique & Garment Retail', kycDate: '22 Sep 2025' },
}

function ProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { activeProfile, isDemoMode } = useDemoStore()
  const isAssumed = !isDemoMode
  const assumedStyle = isAssumed ? { opacity: 0.5 } : {}
  const AssumedBadge = () => isAssumed ? (
    <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">Assumed</span>
  ) : null
  const { logout, customer } = useAuthStore()

  const [loans, setLoans] = useState([])
  const [loadingLoans, setLoadingLoans] = useState(true)

  const meta = PROFILE_METADATA[activeProfile.id] || PROFILE_METADATA.ramesh

  const PROFILE_TO_CUST_ID = {
    ramesh: 'CUST_DEMO_001',
    priya: 'CUST_DEMO_002',
    suresh: 'CUST_DEMO_003',
    arjun: 'CUST_DEMO_004',
    meena: 'CUST_DEMO_005',
    cust_demo_101: 'CUST_DEMO_101',
    cust_demo_102: 'CUST_DEMO_102',
  }

  useEffect(() => {
    let isMounted = true
    const fetchLoanRecords = async () => {
      setLoadingLoans(true)
      const custId = customer?.customer_id || PROFILE_TO_CUST_ID[activeProfile.id] || activeProfile.id
      let fetchedLoans = []
      try {
        const res = await loanService.getCustomerLoans(custId)
        if (res && res.loans) {
          fetchedLoans = res.loans
        }
      } catch {
        // Fallback to local profile demo loans
      }

      const localLoans = activeProfile.loans || []
      const fetchedAppIds = new Set(fetchedLoans.map((l) => l.application_id || l.id))
      const extraLocal = localLoans.filter((l) => !fetchedAppIds.has(l.id || l.application_id))

      if (isMounted) {
        setLoans([...extraLocal, ...fetchedLoans])
        setLoadingLoans(false)
      }
    }

    fetchLoanRecords()
    return () => {
      isMounted = false
    }
  }, [activeProfile.id, customer?.customer_id, activeProfile.loans])

  const handleLogout = () => {
    logout()
    navigate({ to: '/login', replace: true })
  }

  const renderStatusBadge = (rawStatus) => {
    const s = (rawStatus || 'PENDING').toUpperCase()
    if (s === 'ACCEPTED' || s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          ACCEPTED
        </span>
      )
    }
    if (s === 'REJECTED' || s === 'BLOCKED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          REJECTED
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        PENDING
      </span>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('profile.title', 'Customer Profile & Account Details')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t('profile.subtitle', 'Verified Banking Credentials & Demographic Records')}
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-900 text-white font-extrabold text-2xl flex items-center justify-center font-mono shrink-0 shadow-sm">
            {activeProfile.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {activeProfile.name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400">
                KYC Level 3 Verified
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {activeProfile.displaySegment} &bull; {meta.occupation}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {activeProfile.email}
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Wellness / Stress Ratio
          </span>
          <div className="text-base font-extrabold font-mono text-slate-800 dark:text-slate-200" style={assumedStyle}>
            {activeProfile.wellnessScore} / {Number(activeProfile.stressScore || 0).toFixed(2)}<AssumedBadge />
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-1 ${
              activeProfile.status === 'GREEN'
                ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                : activeProfile.status === 'YELLOW'
                ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400'
                : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
            }`}
          >
            {activeProfile.status} Health
          </span>
        </div>
      </div>

      {/* NEW: Loan Applications & Loans Taken Section (Read-Only) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Loans & Credit Applications Ledger</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical record of credit facility requests and sanction decisions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              🔒 Read-Only Record
            </span>
          </div>
        </div>

        {loadingLoans ? (
          <div className="space-y-3 py-4">
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
            No loan applications recorded for this customer account.
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan, idx) => {
              const amountVal = Number(loan.amount || 0)
              const emiVal = Number(loan.monthly_emi || loan.monthlyEmi || 0)
              const tenureVal = loan.tenure_months || loan.tenureMonths || 12
              const appCode = loan.application_id || loan.id || `LN_${idx + 100}`
              const prodName = loan.product_name || loan.productName || 'Personal Loan'
              const dateStr = loan.created_at || loan.appliedDate || 'Recent'

              return (
                <div
                  key={appCode + idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {prodName}
                        </span>
                        {loan.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {loan.category}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Application ID: <span className="font-bold text-indigo-600 dark:text-indigo-400">{appCode}</span>
                      </div>
                    </div>

                    <div>{renderStatusBadge(loan.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Amount
                      </span>
                      <span className="font-extrabold font-mono text-slate-900 dark:text-white">
                        ₹{amountVal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Tenure
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {tenureVal} Months
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Monthly EMI
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {emiVal > 0 ? `₹${emiVal.toLocaleString('en-IN')}/mo` : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Application Date
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {typeof dateStr === 'string' && dateStr.includes('T')
                          ? new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : dateStr}
                      </span>
                    </div>
                  </div>

                  {loan.rejection_reason && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200">
                      <span className="font-bold">Rejection Reason: </span>
                      {loan.rejection_reason}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Account & Identification Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          {t('profile.personalInfo', 'Identification & Demographic Data')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
              Masked Aadhaar Number
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              XXXX XXXX 1234
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
              Permanent Account Number (PAN)
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              ABCDE****F
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
              Registered Geographic Location
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {meta.location}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
              Date of Birth
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {meta.dob}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
              {t('profile.preferredLanguage', 'Preferred Banking Language')}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {activeProfile.languageName} ({activeProfile.language.toUpperCase()})
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850">
            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
              Re-KYC Verification Schedule
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Completed on {meta.kycDate}
            </span>
          </div>
        </div>
      </div>

      {/* Security & Session Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Security & Authentication Session
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            End active session and clear local authorization keys
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-6 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
        >
          {t('nav.logout', 'Sign Out of BankBuddy')}
        </button>
      </div>
    </div>
  )
}
