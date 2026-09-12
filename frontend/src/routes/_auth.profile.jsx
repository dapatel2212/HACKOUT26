import React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useDemoStore } from '../store/useDemoStore'
import { useAuthStore } from '../store/authStore'

export const Route = createFileRoute('/_auth/profile')({
  component: ProfilePage,
})

const PROFILE_METADATA = {
  ramesh: { location: 'Karnal, Haryana', dob: '14 May 1982', occupation: 'Agriculture & Grain Farming', kycDate: '12 Jan 2024' },
  priya: { location: 'Coimbatore, Tamil Nadu', dob: '22 Aug 1994', occupation: 'Senior Software Engineer', kycDate: '05 Mar 2023' },
  suresh: { location: 'Ahmedabad, Gujarat', dob: '03 Nov 1978', occupation: 'Retail Kirana Merchant', kycDate: '19 Jul 2023' },
  arjun: { location: 'Bengaluru, Karnataka', dob: '19 Jan 1999', occupation: 'Platform Delivery Partner', kycDate: '11 Oct 2024' },
  meena: { location: 'Solapur, Maharashtra', dob: '08 Feb 1986', occupation: 'Apparel Stitching & Tailoring', kycDate: '02 Feb 2023' },
}

function ProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { activeProfile } = useDemoStore()
  const { logout } = useAuthStore()

  const meta = PROFILE_METADATA[activeProfile.id] || PROFILE_METADATA.ramesh

  const handleLogout = () => {
    logout()
    navigate({ to: '/login', replace: true })
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
          {/* Typography-First Customer Badge (No Icons) */}
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
          <div className="text-base font-extrabold font-mono text-slate-800 dark:text-slate-200">
            {activeProfile.wellnessScore} / {activeProfile.stressScore}
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
