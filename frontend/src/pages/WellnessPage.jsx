import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomerStore } from '../store/customerStore';

export default function WellnessPage() {
  const { t } = useTranslation();
  const { profile } = useCustomerStore();
  const [completedLessons, setCompletedLessons] = useState([1]);

  const score = profile?.wellness_score || 68;

  const dimensions = [
    { name: 'Emergency Fund Coverage', score: 75, status: '3.5 Months Expenses Saved', target: '6 Months' },
    { name: 'Debt Burden Health', score: 62, status: 'EMI is 28% of monthly income', target: '< 35%' },
    { name: 'Savings Rate', score: 70, status: 'Saving 22% of salary monthly', target: '> 20%' },
    { name: 'Insurance Adequacy', score: 50, status: 'Life cover active, Health needed', target: 'Life + Health' },
    { name: 'Financial Literacy', score: 85, status: 'Completed 3 micro-modules', target: '5 modules' }
  ];

  const lessons = [
    { id: 1, title: 'What is a Mutual Fund SIP?', duration: '2 mins', reward: '50 Coins', lang: 'हिंदी / English' },
    { id: 2, title: 'How to Protect Yourself from UPI Fraud', duration: '3 mins', reward: '75 Coins', lang: '12 Languages' },
    { id: 3, title: 'Kisan Credit Card Subsidy Explained', duration: '2 mins', reward: '50 Coins', lang: 'हिंदी / English' },
    { id: 4, title: 'Why You Need Health Insurance Early', duration: '3 mins', reward: '100 Coins', lang: 'हिंदी / English' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
            {t('nav.wellness')}
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Family Financial Wellness Score</h2>
          <p className="text-xs text-emerald-100 max-w-md">
            Our multi-factor health index measures emergency funds, debt safety, and insurance adequacy to protect your family's future.
          </p>
          <div className="pt-2 flex items-center justify-center md:justify-start gap-2">
            <span className="text-xs bg-emerald-500/40 text-emerald-100 px-3 py-1 rounded-full font-medium">
              Badge: {score >= 80 ? '🌟 Excellent' : (score >= 60 ? '🌱 Good' : '⚠️ Attention Needed')}
            </span>
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center bg-white/10 rounded-full border-4 border-emerald-400/60 shrink-0 shadow-inner">
          <div className="text-center">
            <span className="text-4xl font-extrabold">{score}</span>
            <span className="text-xs block text-emerald-200 uppercase font-semibold">/ 100</span>
          </div>
        </div>
      </div>

      {/* 5 Health Dimensions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Financial Pillar Breakdown</h3>
        <div className="space-y-4">
          {dimensions.map((dim, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-800">{dim.name}</span>
                <span className="text-gray-500">{dim.status}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${dim.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Literacy Micro-Lessons */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">{t('nav.literacy')}</h3>
            <p className="text-xs text-gray-500">60-second interactive lessons in your vernacular language</p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full">
            🪙 125 Bharat Coins Earned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lessons.map((lesson) => {
            const isDone = completedLessons.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                className="p-4 rounded-xl border border-gray-200 bg-slate-50/60 hover:bg-white transition flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{lesson.title}</h4>
                  <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2">
                    <span>⏱️ {lesson.duration}</span>
                    <span>•</span>
                    <span className="text-amber-700 font-semibold">{lesson.reward}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isDone) {
                      setCompletedLessons([...completedLessons, lesson.id]);
                      alert(`Lesson completed! You earned ${lesson.reward}.`);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    isDone
                      ? 'bg-green-100 text-green-800 cursor-default'
                      : 'bg-green-700 hover:bg-green-800 text-white'
                  }`}
                >
                  {isDone ? '✓ Completed' : 'Start Lesson'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
