import React, { useState, useEffect } from 'react'
import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/authStore'
import { useDemoStore, PROFILES } from '../store/useDemoStore'
import LanguageSwitcher from '../components/Common/LanguageSwitcher'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

const navItems = [
  { path: '/dashboard', key: 'dashboard', label: 'Dashboard' },
  { path: '/money', key: 'money', label: 'My Money' },
  { path: '/recommendations', key: 'recommendations', label: 'Recommendations' },
  { path: '/loans', key: 'loans', label: 'Loans & Credit' },
  { path: '/wellness', key: 'wellness', label: 'Financial Health' },
  { path: '/literacy', key: 'literacy', label: 'Learn & Earn' },
  { path: '/ai', key: 'chat', label: 'BankBuddy AI' },
  { path: '/consent', key: 'consent', label: 'Privacy & Consent' },
  { path: '/profile', key: 'profile', label: 'Profile' },
]

function AuthLayout() {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const { t, i18n } = useTranslation()

  const { logout, isAuthenticated } = useAuthStore()
  const { activeProfile, setActiveProfile } = useDemoStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login', replace: true })
    }
  }, [isAuthenticated, navigate])



  const handleLogout = () => {
    logout()
    navigate({ to: '/login', replace: true })
  }

  const currentDate = new Date().toLocaleDateString(i18n.language || 'en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#050A1A] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Desktop Persistent Left Sidebar - Dark Navy Aesthetic */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#080E1E] border-r border-slate-200 dark:border-white/10 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <div className="text-sm font-extrabold uppercase tracking-widest text-indigo-900 dark:text-indigo-400">
            {t('app.name', 'BANKBUDDY')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {t('app.tagline', 'AI Banking for Bharat')}
          </div>
        </div>

        {/* Navigation - Dynamic Translated Labels */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 flex flex-col justify-center">
          {navItems.map((item) => {
            const isActive = currentPath === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-900 text-white dark:bg-indigo-600 dark:text-white shadow-sm dark:shadow-[0_0_16px_rgba(79,70,229,0.35)]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span>{t(`nav.${item.key}`, item.label)}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-saffron dark:bg-white"></span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logged-in Customer Card at Sidebar Bottom */}
        <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#050A1A]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('header.activeCustomer', 'Active Customer')}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                activeProfile.status === 'GREEN'
                  ? 'bg-green-100 dark:bg-green-950/70 text-green-700 dark:text-green-400'
                  : activeProfile.status === 'YELLOW'
                  ? 'bg-yellow-100 dark:bg-yellow-950/70 text-yellow-700 dark:text-yellow-400'
                  : 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400'
              }`}
            >
              {t('header.stress', 'Stress')} {activeProfile.stressScore}
            </span>
          </div>

          <div className="space-y-0.5 mb-3">
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {activeProfile.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t(`segments.${activeProfile.segment}`, activeProfile.displaySegment)} &bull; {activeProfile.languageName}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-white/10 text-xs">
            <Link
              to="/profile"
              className="font-bold text-indigo-700 dark:text-indigo-400 hover:underline"
            >
              {t('nav.profile', 'Profile')}
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 hover:underline font-bold cursor-pointer"
            >
              {t('nav.logout', 'Logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-[#080E1E] border-b border-slate-200 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="lg:hidden font-extrabold text-sm tracking-tight text-indigo-900 dark:text-indigo-400">
              {t('app.name', 'BANKBUDDY')}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {currentDate} &bull; {t('header.personalBankingFor', 'Personal Banking for')} <span className="font-bold text-slate-800 dark:text-slate-200">{t(`segments.${activeProfile.segment}`, activeProfile.displaySegment)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Persona Switcher for Hackathon Judging */}
            <select
              value={activeProfile.id}
              onChange={(e) => setActiveProfile(e.target.value)}
              aria-label="Demo Customer Persona Switcher"
              className="text-xs bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-600 outline-none cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition"
            >
              {Object.values(PROFILES).map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-[#080E1E]">
                  {t('header.persona', 'Persona')}: {p.name} ({t(`segments.${p.segment}`, p.displaySegment)})
                </option>
              ))}
            </select>

            <LanguageSwitcher />
            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-xs font-bold border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 bg-slate-50 dark:bg-[#0D162B] text-slate-800 dark:text-slate-200"
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-[#080E1E] border-b border-slate-200 dark:border-white/10 p-4 space-y-2 z-20 shadow-md">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl text-xs font-bold border ${
                    currentPath === item.path
                      ? 'bg-indigo-900 text-white border-indigo-900 dark:bg-indigo-600'
                      : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0D162B]'
                  }`}
                >
                  {t(`nav.${item.key}`, item.label)}
                </Link>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Logged as: {activeProfile.name}</span>
              <button onClick={handleLogout} className="text-red-600 font-bold">{t('nav.logout', 'Logout')}</button>
            </div>
          </div>
        )}

        {/* Outlet Scroll Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (< lg screens) - NO NUMBERS, CLEAN TEXT LABELS */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-[#080E1E] border-t border-slate-200 dark:border-white/10 flex items-center justify-around px-2 z-20">
          {navItems.slice(0, 5).map((item) => {
            const isActive = currentPath === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-center px-1 rounded-md transition-colors ${
                  isActive
                    ? 'text-indigo-900 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 font-medium'
                }`}
              >
                <span className="text-[11px] leading-tight truncate max-w-[64px]">{t(`nav.${item.key}`, item.label)}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-saffron dark:bg-indigo-400 mt-0.5"></span>}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle Theme"
      className="text-xs font-bold border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 bg-slate-50 dark:bg-[#0D162B] text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-white/20 transition cursor-pointer"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}
