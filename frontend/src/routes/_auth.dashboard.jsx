import React, { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useDemoStore } from '../store/useDemoStore'
import { getDashboardData, getMoneyFlowTrends } from '../services/mockAdapters'
import { stressService } from '../services/stressService'
import { customerService } from '../services/customerService'

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPage,
})

const PIE_COLORS = ['#1a237e', '#0284c7', '#16a34a', '#f59e0b', '#8b5cf6', '#64748b']

const PIE_CATEGORIES = {
  seasonal_earners: [
    { name: 'Crop Inputs & Seeds', value: 38 },
    { name: 'Household & Ration', value: 24 },
    { name: 'Diesel & Machinery', value: 16 },
    { name: 'Healthcare', value: 12 },
    { name: 'Savings Buffer', value: 10 },
  ],
  prudent_savers: [
    { name: 'Mutual Fund SIPs', value: 32 },
    { name: 'Home Loan EMI', value: 25 },
    { name: 'Household Living', value: 18 },
    { name: 'Utilities & Bills', value: 15 },
    { name: 'Discretionary', value: 10 },
  ],
  digital_natives: [
    { name: 'Wholesale Inventory', value: 45 },
    { name: 'Business Loan EMI', value: 22 },
    { name: 'Store Rent & Power', value: 18 },
    { name: 'Personal Living', value: 10 },
    { name: 'Cash Reserves', value: 5 },
  ],
  aspiring_spenders: [
    { name: 'Bike Fuel & Transit', value: 28 },
    { name: 'Two-Wheeler EMI', value: 20 },
    { name: 'Dining & Discretionary', value: 25 },
    { name: 'Phone & Internet', value: 12 },
    { name: 'Emergency Savings', value: 15 },
  ],
  stressed_accounts: [
    { name: 'Loan EMI Obligations', value: 48 },
    { name: 'Essential Groceries', value: 28 },
    { name: 'Medical & Clinic', value: 14 },
    { name: 'School Fees', value: 8 },
    { name: 'Savings Margin', value: 2 },
  ],
}

function DashboardPage() {
  const { activeProfile } = useDemoStore()
  const { t } = useTranslation()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [trendRange, setTrendRange] = useState('3M')
  const [trendData, setTrendData] = useState([])

  useEffect(() => {
    setLoading(true)
    const loadDashboard = async () => {
      const localData = await getDashboardData(activeProfile.id)
      const token = localStorage.getItem('access_token')
      if (token && activeProfile.id?.startsWith('CUST_')) {
        const [profile, stress] = await Promise.all([
          customerService.getCustomer(activeProfile.id),
          stressService.getStatus(activeProfile.id),
        ])
        setData({
          ...localData,
          name: profile.name,
          segment: profile.segment || localData.segment,
          balance: profile.balance ?? localData.balance,
          monthlyIncome: profile.income_monthly ?? localData.monthlyIncome,
          stressScore: stress.stress_score,
          status: stress.stress_level,
        })
      } else {
        setData(localData)
      }
      setTrendData(getMoneyFlowTrends(activeProfile.id, trendRange))
      setLoading(false)
    }
    loadDashboard().catch(() => {
      setData(null)
      setLoading(false)
    })
  }, [activeProfile.id, trendRange])

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse"></div>
          <div className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse"></div>
          <div className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse"></div>
        </div>
      </div>
    )
  }

  const isStressed = data.stressScore > 30
  const rawPieBreakdown = PIE_CATEGORIES[data.segment] || PIE_CATEGORIES.seasonal_earners
  const pieBreakdown = rawPieBreakdown.map((item) => ({
    ...item,
    name: t(`pie.${item.name}`, item.name),
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. Ethical AI Financial Stress Protection Banner (Stress > 50) */}
      {isStressed && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 mb-1">
                Ethical AI Guardrail Active
              </div>
              <h2 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Let's strengthen your finances first.
              </h2>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 max-w-2xl leading-relaxed">
                Your current financial stress score is {data.stressScore}/100. To prevent unsustainable debt accumulation, new borrowing recommendations are paused. We offer zero-cost relief options instead.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                to="/loans"
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-900 dark:bg-amber-700 text-white hover:bg-amber-800 transition"
              >
                Restructure EMI
              </Link>
              <Link
                to="/ai"
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
              >
                Talk to Counselor
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Primary Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className="bg-indigo-900 dark:bg-slate-900 text-white rounded-3xl p-6 border border-indigo-800 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 dark:text-slate-400">
              {t('dashboard.availableBalance', 'Available Balance')}
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-[11px] font-bold text-indigo-200 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {showBalance ? t('dashboard.hideBalance', 'Hide balance') : t('dashboard.showBalance', 'Show balance')}
            </button>
          </div>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {showBalance ? `₹${data.balance.toLocaleString('en-IN')}` : '••••••••'}
            </div>
            <div className="text-xs text-indigo-200 dark:text-slate-400 mt-1">
              Main Primary Account &bull; Verified
            </div>
          </div>
          <div className="pt-3 border-t border-indigo-800 dark:border-slate-800 flex justify-between text-xs">
            <span className="text-indigo-200 dark:text-slate-400">{t('dashboard.monthlyIncome', 'Monthly Income')}</span>
            <span className="font-bold">₹{data.monthlyIncome.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Financial Wellness Score */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('dashboard.wellnessIndex', 'Wellness Index')}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {data.status} Status
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {data.wellnessScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  data.wellnessScore >= 70
                    ? 'bg-green-600'
                    : data.wellnessScore >= 45
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${data.wellnessScore}%` }}
              ></div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Savings Rate</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.savingsRate}% of Income</span>
          </div>
        </div>

        {/* Stress & Risk Guardrail Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('dashboard.stressDiagnostic', 'Stress Diagnostic')}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                !isStressed
                  ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
              }`}
            >
              {!isStressed ? 'Low Risk' : 'Elevated Stress'}
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {data.stressScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {!isStressed
                ? 'Healthy buffer. Low vulnerability to unexpected expenses.'
                : 'Ethical guardrails active to protect your financial health.'}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Status</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {!isStressed ? 'STABLE' : 'PROTECTED'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Analytics & Spending Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Money Flow Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('dashboard.moneyFlow', 'Money Flow Analytics')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Income vs Expenses ({trendRange})
              </p>
            </div>
            {/* Period Range Toggles */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start">
              {['1M', '3M', '6M'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTrendRange(range)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    trendRange === range
                      ? 'bg-white dark:bg-slate-700 text-indigo-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="period"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value, name) => [`₹${value.toLocaleString('en-IN')}`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="income" name={t('money.inflow', 'Inflow (Income)')} fill="#1a237e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name={t('money.outflow', 'Outflow (Expenses)')} fill="#ff6f00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending Category Pie Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Spending Patterns
              </h2>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Segmented
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Category Distribution
            </p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieBreakdown.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Share']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {pieBreakdown.slice(0, 3).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  ></span>
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[130px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. AI-Powered Personalized Recommendations Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Personalized Financial Recommendations
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                Ethical AI Filtered
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Curated specifically for {activeProfile.name} ({activeProfile.displaySegment}) based on financial profile
            </p>
          </div>
          <Link
            to="/recommendations"
            className="text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline"
          >
            View All Recommendations &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.recommendedThemes.map((themeName, idx) => (
            <div
              key={themeName}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    0{idx + 1}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400">
                    Matched
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                  {themeName}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tailored based on cash flow cycles and protection requirements.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <Link
                  to="/recommendations"
                  className="text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline"
                >
                  Why this?
                </Link>
                {isStressed && themeName.toLowerCase().includes('credit') ? (
                  <span className="text-[11px] font-bold text-slate-400 px-3 py-1 rounded bg-slate-200 dark:bg-slate-800">
                    Paused
                  </span>
                ) : (
                  <Link
                    to="/recommendations"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-900 dark:bg-indigo-600 text-white hover:bg-indigo-800 dark:hover:bg-indigo-500 transition"
                  >
                    Explore
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
