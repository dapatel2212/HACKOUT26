import React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { useDemoStore } from '../store/useDemoStore'

export const Route = createFileRoute('/_auth/wellness')({
  component: WellnessPage,
})

const RADAR_DATA_SETS = {
  seasonal_earners: [
    { subject: 'Savings', score: 65, fullMark: 100 },
    { subject: 'Debt Safety', score: 78, fullMark: 100 },
    { subject: 'Cash Flow', score: 60, fullMark: 100 },
    { subject: 'Protection', score: 55, fullMark: 100 },
    { subject: 'Planning', score: 70, fullMark: 100 },
  ],
  prudent_savers: [
    { subject: 'Savings', score: 95, fullMark: 100 },
    { subject: 'Debt Safety', score: 88, fullMark: 100 },
    { subject: 'Cash Flow', score: 92, fullMark: 100 },
    { subject: 'Protection', score: 85, fullMark: 100 },
    { subject: 'Planning', score: 90, fullMark: 100 },
  ],
  digital_natives: [
    { subject: 'Savings', score: 58, fullMark: 100 },
    { subject: 'Debt Safety', score: 65, fullMark: 100 },
    { subject: 'Cash Flow', score: 75, fullMark: 100 },
    { subject: 'Protection', score: 50, fullMark: 100 },
    { subject: 'Planning', score: 62, fullMark: 100 },
  ],
  aspiring_spenders: [
    { subject: 'Savings', score: 60, fullMark: 100 },
    { subject: 'Debt Safety', score: 70, fullMark: 100 },
    { subject: 'Cash Flow', score: 68, fullMark: 100 },
    { subject: 'Protection', score: 45, fullMark: 100 },
    { subject: 'Planning', score: 65, fullMark: 100 },
  ],
  stressed_accounts: [
    { subject: 'Savings', score: 25, fullMark: 100 },
    { subject: 'Debt Safety', score: 28, fullMark: 100 },
    { subject: 'Cash Flow', score: 35, fullMark: 100 },
    { subject: 'Protection', score: 30, fullMark: 100 },
    { subject: 'Planning', score: 40, fullMark: 100 },
  ],
}

const HISTORICAL_TREND = [
  { month: 'Apr', score: 68 },
  { month: 'May', score: 71 },
  { month: 'Jun', score: 73 },
  { month: 'Jul', score: 70 },
  { month: 'Aug', score: 75 },
  { month: 'Sep', score: 78 },
]

function WellnessPage() {
  const { activeProfile } = useDemoStore()
  const { t } = useTranslation()
  const rawRadarData = RADAR_DATA_SETS[activeProfile.segment] || RADAR_DATA_SETS.seasonal_earners
  const radarData = rawRadarData.map((item) => ({
    ...item,
    subject: t(`wellness.radar.${item.subject}`, item.subject),
  }))
  const isStressed = activeProfile.stressScore > 50

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('wellness.title', 'Financial Wellness & Resilience Index')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t('wellness.subtitle', 'Comprehensive 5-dimension diagnostic for')} {activeProfile.name} ({t(`segments.${activeProfile.segment}`, activeProfile.displaySegment)})
        </p>
      </div>

      {/* Top Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('wellness.wellnessScore', 'Wellness Index')}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                activeProfile.wellnessScore >= 70
                  ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                  : activeProfile.wellnessScore >= 45
                  ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400'
                  : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
              }`}
            >
              {activeProfile.status} Health
            </span>
          </div>

          <div className="my-4">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
              {activeProfile.wellnessScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Based on savings buffer, debt obligations, and cash volatility.
            </p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                activeProfile.wellnessScore >= 70 ? 'bg-green-600' : 'bg-amber-500'
              }`}
              style={{ width: `${activeProfile.wellnessScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('wellness.stressScore', 'Stress Score')}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                !isStressed
                  ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
              }`}
            >
              {!isStressed ? 'Low Risk' : 'Elevated Stress'}
            </span>
          </div>

          <div className="my-4">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
              {activeProfile.stressScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {!isStressed
                ? 'Safe financial position. Cash flows are in equilibrium.'
                : 'Protective lending locks active. Debt relief support recommended.'}
            </p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                isStressed ? 'bg-red-500' : 'bg-green-600'
              }`}
              style={{ width: `${activeProfile.stressScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('wellness.emergencyBuffer', 'Emergency Buffer Runway')}
          </span>

          <div className="my-4">
            <div className="text-4xl font-extrabold text-indigo-900 dark:text-indigo-400 font-mono">
              {isStressed ? '0.4 Months' : '3.8 Months'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ideal benchmark: 6.0 months of mandatory recurring expenses.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
            <span className="text-slate-400">{t('wellness.targetFund', 'Target Fund')}</span>
            <span className="font-bold font-mono">₹1,50,000</span>
          </div>
        </div>
      </div>

      {/* Radar Chart & Historical Trend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5-Axis Radar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('wellness.radarTitle', '5-Axis Financial Health Radar')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluating balance across core financial foundations
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Diagnostic
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#94a3b8" strokeOpacity={0.3} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#1a237e"
                  fill="#1a237e"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6-Month Wellness Trend */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Wellness Score Trajectory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                6-month rolling resilience index
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 font-bold">Past 6M</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICAL_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`${val}/100`, 'Wellness']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#16a34a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations & Badges */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Targeted Wellness Improvement Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <div className="flex justify-between items-center text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
              <span>Automate Emergency Buffer</span>
              <span className="text-green-600 dark:text-green-400">+12 pts</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set aside ₹1,000 monthly into an auto-sweep deposit.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <div className="flex justify-between items-center text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
              <span>Protection & Insurance Cover</span>
              <span className="text-indigo-600 dark:text-indigo-400">+18 pts</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ensure weather or health insurance cover is activated to insulate from debt spirals.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <div className="flex justify-between items-center text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
              <span>Financial Literacy Module</span>
              <span className="text-green-600 dark:text-green-400">+5 pts</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete a 60-second micro-lesson to unlock wellness reward points.
            </p>
            <Link
              to="/literacy"
              className="mt-2 inline-block text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline"
            >
              Start Lesson &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
