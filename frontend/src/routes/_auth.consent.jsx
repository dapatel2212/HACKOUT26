import React, { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useDemoStore } from '../store/useDemoStore'
import { useAuthStore } from '../store/authStore'
import { consentService } from '../services/consentService'

export const Route = createFileRoute('/_auth/consent')({
  component: ConsentPage,
})

const CONSENT_ITEMS = [
  {
    key: 'transaction_analysis',
    title: 'Transaction Pattern Analysis',
    what: 'Raw UPI, NEFT, and debit transaction histories across savings accounts.',
    why: 'Enables our algorithms to categorize cash flows, seasonal crop spend, and compute liquidity surplus.',
    how: 'AES-256 encrypted at rest inside AWS Mumbai (ap-south-1). Never shared with external advertisers.',
    essential: false,
  },
  {
    key: 'health_monitoring',
    title: 'Financial Health & Stress Monitoring',
    what: 'EMI payment consistency, account balance volatility, and bounce alerts.',
    why: 'Triggers responsible lending protections to lock predatory high-interest borrowing when stress rises.',
    how: 'Processed via client-side privacy preserved embeddings without third-party exposure.',
    essential: false,
  },
  {
    key: 'ai_chat',
    title: 'BankBuddy Vernacular AI Memory',
    what: 'Chat transcripts and conversation context in regional languages (Hindi, Tamil, Marathi, etc.).',
    why: 'Allows the assistant to remember your financial context across distinct chat sessions.',
    how: 'Sanitized with automatic PII masking for PAN, Aadhaar, and account numbers.',
    essential: false,
  },
  {
    key: 'life_events',
    title: 'Predictive Life Event Detection',
    what: 'Inferred signals of child schooling, crop harvesting, or business expansion.',
    why: 'Offers timely insurance or savings support before major capital expenditures occur.',
    how: 'Consent-gated inferencing; purged automatically after 30 days.',
    essential: false,
  },
  {
    key: 'marketing',
    title: 'Partner Offers & Promotional Notifications',
    what: 'Contact preferences for subsidized tractor, fertilizer, or merchant POS discounts.',
    why: 'Informs you about government subventions and retail banking partner discounts.',
    how: 'Strictly opt-in under DPDP Act 2023. Zero pre-checked boxes.',
    essential: false,
  },
]

function ConsentPage() {
  const { activeProfile } = useDemoStore()
  const { customer } = useAuthStore()
  const { t } = useTranslation()

  // STRICT RULE: Every consent must default to OFF (false).
  const [consents, setConsents] = useState({
    transaction_analysis: false,
    health_monitoring: false,
    ai_chat: false,
    life_events: false,
    marketing: false,
  })

  const [_auditLog, setAuditLog] = useState([])
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [erasureRequested, setErasureRequested] = useState(false)
  const customerId = customer?.customer_id || activeProfile.id
  const isBackendCustomer = customerId?.startsWith('CUST_')

  const toggleConsent = async (key) => {
    const updatedState = !consents[key]
    if (isBackendCustomer && updatedState) {
      await consentService.grantConsent(customerId, key)
    } else if (isBackendCustomer) {
      await consentService.revokeConsent(customerId, key)
    }
    setConsents((prev) => ({ ...prev, [key]: updatedState }))

    const newLogItem = {
      timestamp: new Date().toISOString(),
      action: updatedState ? 'GRANTED' : 'REVOKED',
      itemKey: key,
      legalBasis: 'DPDP Act 2023 Section 6(1) Explicit Consent',
    }

    setAuditLog((prev) => [newLogItem, ...prev])
  }

  const handleDownloadData = async () => {
    const data = isBackendCustomer
      ? await consentService.downloadData(customerId)
      : { profile: activeProfile, consent: consents, exported_at: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `bankbuddy-${customerId}-data.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setDownloadSuccess(true)
    setTimeout(() => setDownloadSuccess(false), 4000)
  }

  const handleErasure = async () => {
    if (isBackendCustomer) {
      await consentService.requestDelete(customerId)
    }
    setErasureRequested(true)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('consent.title', 'Consent & Data Privacy Manager')}
          </h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
            DPDP Act 2023 Compliant
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('consent.subtitle', 'Under the Digital Personal Data Protection (DPDP) Act 2023, you have full control over your data.')}
        </p>
      </div>

      {/* Primary Consent Toggles List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          Explicit Permission Toggles
        </h2>

        <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
          {CONSENT_ITEMS.map((item) => {
            const isGranted = consents[item.key]
            return (
              <div key={item.key} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        isGranted
                          ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isGranted ? t('consent.active', 'Active') : t('consent.disabled', 'Disabled')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <b>What is collected:</b> {item.what}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <b>Why it is used:</b> {item.why}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    <b>Security:</b> {item.how}
                  </p>
                </div>

                <button
                  onClick={() => toggleConsent(item.key)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition shrink-0 ${
                    isGranted
                      ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100'
                      : 'bg-indigo-900 dark:bg-indigo-600 text-white hover:bg-indigo-800'
                  }`}
                >
                  {isGranted ? t('consent.revoke', 'Revoke Consent') : t('consent.grant', 'Grant Permission')}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* DPDP Data Rights Actions (Export & Erasure) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Data Portability
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Download a machine-readable JSON copy of your profile, cash flow inferences, and consent records.
            </p>
          </div>

          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 text-green-800 text-xs font-semibold">
              Data package compiled and downloaded successfully!
            </div>
          )}

          <button
            onClick={handleDownloadData}
            className="w-full py-3 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {t('consent.downloadData', 'Download My Data (JSON)')}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Right to Erasure ("Right to be Forgotten")
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Request immediate deletion of all non-statutory personal data and AI inference logs.
            </p>
          </div>

          {erasureRequested && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-800 text-xs font-semibold">
              Data erasure request registered under Ticket #DPDP-ERASE-9081. Audit confirmation will be sent within 72 hours.
            </div>
          )}

          <button
            onClick={handleErasure}
            disabled={erasureRequested}
            className="w-full py-3 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60"
          >
            {t('consent.deleteData', 'Request Data Erasure')}
          </button>
        </div>
      </div>
    </div>
  )
}
