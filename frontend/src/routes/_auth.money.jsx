import React, { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { useDemoStore } from '../store/useDemoStore'
import { getTransactionsData, getMoneyFlowTrends } from '../services/mockAdapters'

export const Route = createFileRoute('/_auth/money')({
  component: MoneyPage,
})

function MoneyPage() {
  const { activeProfile } = useDemoStore()
  const { t } = useTranslation()
  const [range, setRange] = useState('3M')
  const [transactions, setTransactions] = useState([])
  const [trends, setTrends] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    getTransactionsData(activeProfile.id).then(setTransactions)
    const rawTrends = getMoneyFlowTrends(activeProfile.id, range)
    // Add netSurplus field for the liquidity trajectory line
    const enhancedTrends = rawTrends.map((item) => ({
      ...item,
      netSurplus: Math.max(0, item.income - item.expense),
    }))
    setTrends(enhancedTrends)
  }, [activeProfile.id, range])

  const monthlyIncome = activeProfile.monthlyIncome
  const monthlyExpense = Math.round(monthlyIncome * (1 - activeProfile.savingsRate / 100))
  const monthlySavings = monthlyIncome - monthlyExpense

  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === 'credit') return tx.type === 'credit'
    if (activeFilter === 'debit') return tx.type === 'debit'
    return true
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('money.title', 'My Money Analytics')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('money.subtitle', 'Cash Flow, Expenditure Insights & Transaction Records')}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl self-start">
          {['1M', '3M', '6M'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                range === r
                  ? 'bg-indigo-900 dark:bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {t('dashboard.totalInflow', 'Total Inflow (Monthly)')}
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            ₹{monthlyIncome.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 inline-block">
            {t('money.verifiedRegular', 'Verified Regular Cash Flow')}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            {t('dashboard.totalOutflow', 'Total Outflow (Monthly)')}
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            ₹{monthlyExpense.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 inline-block">
            {t('money.essentials', 'Essentials + Obligations')}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {t('dashboard.netSurplus', 'Net Monthly Surplus')}
          </span>
          <div className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-400 mt-2">
            ₹{monthlySavings.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 inline-block">
            {activeProfile.savingsRate}% {t('dashboard.savingsRate', 'Savings Ratio')}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {t('dashboard.activeEmi', 'Active EMI Total')}
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {activeProfile.upcomingEmi ? `₹${activeProfile.upcomingEmi.toLocaleString('en-IN')}` : '₹0'}
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 inline-block">
            {activeProfile.upcomingEmi ? 'Due by 10th of Month' : 'No Current Dues'}
          </span>
        </div>
      </div>

      {/* Modern Premium Dual-Axis Composed Financial Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('money.cumulativeTrend', 'Cash Flow & Net Liquidity Trajectory')}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                Audited Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparing Monthly Inflows (Income), Outflows (Expenses) & Liquidity Buffer
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
              {t('money.inflow', 'Inflow')}
            </span>
            <span className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span>
              {t('money.outflow', 'Outflow')}
            </span>
            <span className="flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400">
              <span className="w-2.5 h-0.5 bg-indigo-500 inline-block"></span>
              {t('money.netSurplus', 'Net Surplus')}
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trends} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="inflowBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.65} />
                </linearGradient>
                <linearGradient id="outflowBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0.65} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="period"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155', strokeWidth: 1 }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip
                formatter={(val, name) => [`₹${val.toLocaleString('en-IN')}`, name]}
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  color: '#f8fafc',
                  fontSize: '12px',
                  padding: '12px 16px',
                }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Bar
                dataKey="income"
                name={t('money.inflow', 'Inflow (Income)')}
                fill="url(#inflowBarGrad)"
                barSize={24}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name={t('money.outflow', 'Outflow (Expenses)')}
                fill="url(#outflowBarGrad)"
                barSize={24}
                radius={[6, 6, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="netSurplus"
                name={t('money.netSurplus', 'Net Surplus')}
                stroke="#818cf8"
                strokeWidth={3}
                dot={{ r: 5, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#818cf8', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions List & Upcoming Obligations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('money.verifiedTxns', 'Verified Transactions')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Categorized ledger with audit validation
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start">
              {['all', 'credit', 'debit'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                    activeFilter === f
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {f === 'all' ? t('money.filterAll', 'All') : f === 'credit' ? t('money.filterCredit', 'Credit') : t('money.filterDebit', 'Debit')}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {tx.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {t(`pie.${tx.category}`, tx.category)} &bull; {tx.date}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-xs font-mono font-bold ${
                      tx.type === 'credit'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'failed'
                        ? 'text-red-500'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      tx.status === 'Completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Obligations Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t('money.upcomingObligations', 'Upcoming Obligations')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Scheduled debits & calendar reminders
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                  <span>Mandatory Auto-Debit</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">
                    {activeProfile.upcomingEmi ? `₹${activeProfile.upcomingEmi.toLocaleString('en-IN')}` : 'None'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeProfile.upcomingEmi ? 'Scheduled for 10th of this month' : 'Zero outstanding EMI scheduled'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                  <span>Electricity & Utilities</span>
                  <span className="font-mono">₹1,250</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Due in 8 days &bull; BBPS Auto-Pay Active
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                  <span>Monthly Savings Target</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{monthlySavings.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allocated to liquid emergency buffer
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            Cash flows monitored under responsible banking compliance.
          </div>
        </div>
      </div>
    </div>
  )
}
