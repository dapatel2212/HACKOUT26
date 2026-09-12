import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useCustomerStore } from '../../store/customerStore'
import { useAuthStore } from '../../store/authStore'
import { useDemoStore } from '../../store/useDemoStore'

const SUPPORTED_LANGUAGES = [
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
]

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation()
  const { customer } = useAuthStore()
  const { updateProfile } = useCustomerStore()

  const [currentLang, setCurrentLang] = useState(
    (i18n.language || localStorage.getItem('preferred_language') || 'en').split('-')[0]
  )

  useEffect(() => {
    const active = (i18n.language || localStorage.getItem('preferred_language') || 'en').split('-')[0]
    setCurrentLang(active)
  }, [i18n.language])

  const handleLanguageChange = async (e) => {
    const lang = e.target.value
    setCurrentLang(lang)
    await i18n.changeLanguage(lang)
    localStorage.setItem('preferred_language', lang)
    useDemoStore.getState().updateActiveProfileLanguage(lang)

    if (customer?.customer_id) {
      try {
        await updateProfile(customer.customer_id, { language: lang })
      } catch {
        // ignore background profile sync error
      }
    }
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Lang</span>
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-600 dark:focus:ring-indigo-400 outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  )
}
