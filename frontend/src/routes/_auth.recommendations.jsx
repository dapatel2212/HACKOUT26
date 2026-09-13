import React, { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useDemoStore } from '../store/useDemoStore'
import { getRecommendationsData } from '../services/mockAdapters'
import { recommendationService } from '../services/recommendationService'
import { useAuthStore } from '../store/authStore'

export const Route = createFileRoute('/_auth/recommendations')({
  component: RecommendationsPage,
})

function RecommendationsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { activeProfile, canApplyForLoan } = useDemoStore()
  const { customer } = useAuthStore()
  const [recommendations, setRecommendations] = useState([])
  const [dismissedIds, setDismissedIds] = useState([])
  const [expandedWhyId, setExpandedWhyId] = useState(null)
  const [actionSuccessMessage, setActionSuccessMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    const loadRecommendations = async () => {
      const token = localStorage.getItem('access_token')
      const customerId = customer?.customer_id
      const isBackendCustomer = Boolean(token && customerId)
      const data = isBackendCustomer
        ? await recommendationService.getRecommendations(customerId)
        : { recommendations: getRecommendationsData(activeProfile.id) }
      const normalized = (data.recommendations || []).map((item) => ({
        id: item.product_id || item.id,
        title: item.product_name || item.title,
        category: item.category || 'Financial product',
        matchScore: item.match_score_pct || item.matchScore || 0,
        benefit: item.description || item.benefit || '',
        explanation: item.description || item.explanation || '',
        positiveFactors: (item.shap_explanation || item.positiveFactors || []).map((factor) =>
          typeof factor === 'string' ? factor : `${factor.text} ${factor.contribution || ''}`.trim()
        ),
        negativeFactors: item.negativeFactors || [],
        actionType: item.category === 'loan' ? 'apply' : 'explore',
        actionLabel: item.category === 'loan' ? 'Apply now' : 'Explore',
      }))
      if (!cancelled) {
        setRecommendations(normalized.slice(0, 3))
        setDismissedIds([])
        setExpandedWhyId(null)
        setActionSuccessMessage('')
      }
    }
    loadRecommendations().catch(() => {
      if (!cancelled) setRecommendations(getRecommendationsData(activeProfile.id).slice(0, 3))
    })
    return () => {
      cancelled = true
    }
  }, [activeProfile.id, customer?.customer_id])

  const handleDismiss = (id) => {
    setDismissedIds((prev) => [...prev, id])
  }

  const handleAction = (rec) => {
    if (rec.actionType === 'apply' && rec.id.includes('kcc')) {
      navigate({ to: '/loans' })
    } else if (rec.actionType === 'support') {
      setActionSuccessMessage(`Your request for "${rec.title}" has been registered. A relationship counselor will reach out within 2 hours.`)
    } else if (!canApplyForLoan() && rec.title.toLowerCase().includes('credit')) {
      setActionSuccessMessage('Borrowing products are currently locked by ethical guardrails. Please explore debt relief options.')
    } else {
      setActionSuccessMessage(`Exploration initiated for "${rec.title}". Details have been queued to your registered mobile and regional vernacular voice portal.`)
    }
  }

  const visibleRecs = recommendations.filter((r) => !dismissedIds.includes(r.id))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('recommendations.title', 'AI Recommendations')}
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
              {t('recommendations.maxSession', 'Max 3 / Session')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('recommendations.subtitle', 'Explainable & ethical financial recommendations for')} {activeProfile.name} ({t(`segments.${activeProfile.segment}`, activeProfile.displaySegment)})
          </p>
        </div>
      </div>

      {/* Fairness & Ethics Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="font-bold mb-0.5">{t('recommendations.fairnessTitle', 'Algorithmic Fairness Verification')}</div>
          <div className="text-indigo-800 dark:text-indigo-300">
            {t('recommendations.fairnessMessage', 'Passed fairness checks. Caste, gender, religion, and sensitive traits are strictly excluded from recommendation weights. Modeled entirely on cash flows, liquidity buffers, and stated goals.')}
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 shrink-0">
          {t('recommendations.responsibleAi', 'Responsible AI Certified')}
        </span>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-xs font-semibold">
          {actionSuccessMessage}
        </div>
      )}

      {visibleRecs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {t('recommendations.noActive', 'No active recommendations for this session')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('recommendations.noActiveSub', 'You have dismissed or actioned all recommendations. Switch profiles in the header to preview other customer recommendations.')}
          </p>
          <button
            onClick={() => setDismissedIds([])}
            className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-900 text-white"
          >
            {t('recommendations.resetDismissed', 'Reset Dismissed Items')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleRecs.map((rec, index) => {
            const isExpanded = expandedWhyId === rec.id
            const translatedTitle = t(`recommendations.items.${rec.id}.title`, rec.title)
            const translatedCategory = t(`recommendations.categories.${rec.category}`, rec.category)
            const translatedBenefit = t(`recommendations.items.${rec.id}.benefit`, rec.benefit)
            const translatedExplanation = t(`recommendations.items.${rec.id}.explanation`, rec.explanation)
            const translatedActionLabel = t(`recommendations.items.${rec.id}.actionLabel`, rec.actionLabel)

            return (
              <div
                key={rec.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        0{index + 1}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {translatedCategory}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {translatedTitle}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400">
                      {rec.matchScore}% {t('recommendations.matchScore', 'Match')}
                    </span>
                    <button
                      onClick={() => handleDismiss(rec.id)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-2 py-1"
                    >
                      {t('recommendations.dismiss', 'Dismiss')}
                    </button>
                  </div>
                </div>

                {/* Benefit & Explanation */}
                <div className="mt-4 space-y-2 text-xs leading-relaxed">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {t('recommendations.primaryBenefit', 'Primary Benefit:')}{' '}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">{translatedBenefit}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {translatedExplanation}
                  </p>
                </div>

                {/* "Why this?" Factor Breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-in fade-in">
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[10px] text-green-700 dark:text-green-400 block mb-2">
                        {t('recommendations.positiveFactors', 'Positive Contributing Factors')}
                      </span>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                        {rec.positiveFactors.map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="font-bold text-green-600">+</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400 block mb-2">
                        {t('recommendations.negativeFactors', 'Considerations & Risk Notes')}
                      </span>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                        {rec.negativeFactors.map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="font-bold text-amber-600">&bull;</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedWhyId(isExpanded ? null : rec.id)}
                    className="text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline"
                  >
                    {isExpanded ? 'Hide Factor Breakdown' : t('recommendations.whyThis', 'Why this recommendation?')}
                  </button>

                                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
