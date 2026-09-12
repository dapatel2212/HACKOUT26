import React, { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'
import { useDemoStore, PROFILES } from '../store/useDemoStore'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

const DEMO_ACCOUNTS = [
  { ...PROFILES.RAMESH, password: 'Demo@123' },
  { ...PROFILES.PRIYA, password: 'Demo@123' },
  { ...PROFILES.SURESH, password: 'Demo@123' },
  { ...PROFILES.ARJUN, password: 'Demo@123' },
  { ...PROFILES.MEENA, password: 'Demo@123' },
]

function LoginPage() {
  const navigate = useNavigate()
  const { login, loginDemo, loading, error } = useAuthStore()
  const { setActiveProfile } = useDemoStore()

  const [email, setEmail] = useState('farmer@demo.com')
  const [password, setPassword] = useState('Demo@123')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    setSubmitting(true)
    setLocalError('')

    try {
      await login(email, password)
      const matched = Object.values(PROFILES).find((p) => p.email.toLowerCase() === email.toLowerCase())
      if (matched) {
        setActiveProfile(matched.id)
      }
      navigate({ to: '/dashboard' })
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickDemoLogin = async (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setActiveProfile(account.id)
    setSubmitting(true)
    loginDemo(account)
    navigate({ to: '/dashboard' })
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full mx-auto space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Responsible AI Banking for Bharat
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            BANKBUDDY
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your Money. Your Language. Your Ethical AI.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sign in to your account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Access personalized banking recommendations and financial wellness</p>
          </div>

          {(error || localError) && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-semibold">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Email / Customer ID
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@demo.com"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline">
                  Default: Demo@123
                </span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-sm disabled:opacity-60"
            >
              {submitting || loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* 1-Click Demo Profiles for Hackathon Judging */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1-Click Demo Profiles
              </span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-semibold">
                Judging Ready
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {acc.name}{' '}
                      <span className="font-normal text-slate-500 dark:text-slate-400">
                        ({acc.displaySegment})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {acc.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        acc.status === 'GREEN'
                          ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                          : acc.status === 'YELLOW'
                          ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                      }`}
                    >
                      Stress: {acc.stressScore}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            Need an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create customer account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
