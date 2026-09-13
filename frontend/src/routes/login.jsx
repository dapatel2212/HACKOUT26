import React, { useState, useEffect } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'
import { useDemoStore, PROFILES } from '../store/useDemoStore'
import { authService } from '../services/authService'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

const DEMO_ACCOUNTS = [
  { ...PROFILES.RAMESH, password: 'Demo@123' },
  { ...PROFILES.PRIYA, password: 'Demo@123' },
  { ...PROFILES.SURESH, password: 'Demo@123' },
  { ...PROFILES.ARJUN, password: 'Demo@123' },
  { ...PROFILES.MEENA, password: 'Demo@123' },
  { ...PROFILES.VIKRAM, password: 'Demo@1234' },
  { ...PROFILES.ANITA, password: 'Demo@5678' },
]

function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithOtp, loginDemo, loading, error, clearError } = useAuthStore()
  const { setActiveProfile } = useDemoStore()

  // Tab: 'password' | 'otp'
  const [activeTab, setActiveTab] = useState('password')

  // Password Login State
  const [email, setEmail] = useState('farmer@demo.com')
  const [password, setPassword] = useState('Demo@123')

  // Mail OTP Login State
  const [otpEmail, setOtpEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Feedback State
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')
  const [localSuccess, setLocalSuccess] = useState('')

  // Resend Countdown
  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // Clear errors when switching tabs or typing
  useEffect(() => {
    setLocalError('')
    setLocalSuccess('')
    if (error) clearError()
  }, [activeTab, email, password, otpEmail, otp])

  const handlePasswordLogin = async (e) => {
    if (e) e.preventDefault()
    setSubmitting(true)
    setLocalError('')

    try {
      await login(email.trim(), password)
      const matched = Object.values(PROFILES).find(
        (p) => p.email.toLowerCase() === email.trim().toLowerCase()
      )
      if (matched) {
        setActiveProfile(matched.id)
      }
      navigate({ to: '/dashboard' })
    } catch (err) {
      setLocalError(err.response?.data?.error || err.message || 'Login failed. Please check credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendLoginOtp = async () => {
    if (!otpEmail || !otpEmail.includes('@')) {
      setLocalError('Please enter a valid email address.')
      return
    }
    setSendingOtp(true)
    setLocalError('')
    setLocalSuccess('')

    try {
      const res = await authService.sendOtp(otpEmail.trim().toLowerCase(), 'login')
      setOtpSent(true)
      setLocalSuccess(res.message || `OTP sent to ${otpEmail}`)
      if (res.dev_otp) {
        setDevOtp(res.dev_otp)
      }
      setCountdown(60)
    } catch (err) {
      setLocalError(err.response?.data?.error || err.message || 'Failed to send OTP. Check if email is registered.')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleAutoFillDevOtp = () => {
    if (devOtp) {
      setOtp(devOtp)
      setLocalError('')
    }
  }

  const handleOtpLogin = async (e) => {
    if (e) e.preventDefault()
    if (!otp || otp.length < 4) {
      setLocalError('Please enter the OTP sent to your email.')
      return
    }

    setVerifyingOtp(true)
    setLocalError('')

    try {
      await loginWithOtp(otpEmail.trim().toLowerCase(), otp.trim())
      const matched = Object.values(PROFILES).find(
        (p) => p.email.toLowerCase() === otpEmail.trim().toLowerCase()
      )
      if (matched) {
        setActiveProfile(matched.id)
      }
      navigate({ to: '/dashboard' })
    } catch (err) {
      setLocalError(err.response?.data?.error || err.message || 'OTP verification failed. Please try again.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleQuickDemoLogin = (account) => {
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Access personalized banking recommendations and financial wellness
            </p>
          </div>

          {/* Login Method Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'password'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('otp')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'otp'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Mail OTP Login</span>
              <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded-full font-semibold">
                New
              </span>
            </button>
          </div>

          {/* Error Banner */}
          {(error || localError) && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center justify-between">
              <span>{error || localError}</span>
              <button
                type="button"
                onClick={() => {
                  setLocalError('')
                  clearError()
                }}
                className="text-red-500 hover:text-red-700 text-sm ml-2 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Success Banner */}
          {localSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between">
              <span>✓ {localSuccess}</span>
              <button
                type="button"
                onClick={() => setLocalSuccess('')}
                className="text-emerald-500 hover:text-emerald-700 text-sm ml-2 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Tab 1: Password Login Form */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Email / Phone / Customer ID
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@demo.com or 9876543210"
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
                className="w-full bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting || loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  'Sign In with Password'
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Mail OTP Login Form */}
          {activeTab === 'otp' && (
            <form onSubmit={handleOtpLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Registered Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="farmer@demo.com"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                  />
                  <button
                    type="button"
                    onClick={handleSendLoginOtp}
                    disabled={sendingOtp || countdown > 0 || !otpEmail}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    {sendingOtp
                      ? 'Sending...'
                      : countdown > 0
                      ? `${countdown}s`
                      : otpSent
                      ? 'Resend'
                      : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                      Enter 6-Digit OTP
                    </label>
                    {devOtp && (
                      <button
                        type="button"
                        onClick={handleAutoFillDevOtp}
                        className="text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded hover:bg-indigo-200 transition"
                        title="Click to auto-fill development OTP"
                      >
                        Dev Code: <span className="font-mono font-bold">{devOtp}</span> (Fill)
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    className="w-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3 text-base font-mono tracking-widest text-center text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    A verification code has been dispatched to {otpEmail}.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={verifyingOtp || !otpSent || otp.length < 4}
                className="w-full bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {verifyingOtp ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Verifying OTP & Logging In...
                  </>
                ) : (
                  'Verify OTP & Enter Dashboard'
                )}
              </button>
            </form>
          )}

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
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition flex items-center justify-between cursor-pointer"
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
                      Stress: {Number(acc.stressScore || 0).toFixed(2)}
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
