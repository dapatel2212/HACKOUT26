import React, { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useDemoStore } from '../store/useDemoStore'

export const Route = createFileRoute('/_auth/literacy')({
  component: LiteracyPage,
})

const LESSONS = [
  {
    id: 'sip',
    title: 'What is a Systematic Investment Plan (SIP)?',
    duration: '60 Seconds',
    category: 'Wealth Creation',
    content: `A Systematic Investment Plan (SIP) is a disciplined way to invest fixed amounts regularly (e.g. ₹500 every month) into mutual funds.

Key Principles:
1. Rupee Cost Averaging: When markets dip, your ₹500 buys more units; when markets rise, your units are worth more.
2. Power of Compounding: Small monthly contributions accumulate significant wealth over 5 to 10 years.
3. No Need to Time the Market: You do not need deep market expertise to build a nest egg.`,
    quiz: [
      {
        question: 'What happens when you invest via SIP during a market dip?',
        options: [
          'You buy more units at lower prices',
          'Your investment automatically stops',
          'You are charged a penalty fee',
        ],
        correct: 0,
      },
      {
        question: 'What is the recommended minimum monthly amount to start an SIP?',
        options: ['₹50,000', '₹500', '₹10 Lakh'],
        correct: 1,
      },
    ],
  },
  {
    id: 'insurance',
    title: 'Why Do Families Need Health Insurance?',
    duration: '60 Seconds',
    category: 'Protection',
    content: `Medical emergencies are the number one cause of sudden debt spirals for middle-income and rural families in Bharat.

Key Principles:
1. Wealth Protection: Health insurance pays hospital bills directly so your hard-earned savings stay intact.
2. Cashless Network: Hospitalization costs at partnered hospitals are settled directly with the insurer.
3. Government Schemes: Ayushman Bharat and PM-JAY offer free coverage up to ₹5 Lakh for eligible families.`,
    quiz: [
      {
        question: 'What is the primary financial role of health insurance?',
        options: [
          'To double your money like a lottery',
          'To protect household savings from sudden medical expenses',
          'To earn tax evasion benefits',
        ],
        correct: 1,
      },
      {
        question: 'How do network hospitals handle verified health insurance claims?',
        options: [
          'Through cashless direct settlement with the insurer',
          'By demanding physical cash upfront only',
          'By converting the bill into high-interest gold debt',
        ],
        correct: 0,
      },
    ],
  },
  {
    id: 'emi',
    title: 'How Does an Equated Monthly Installment (EMI) Work?',
    duration: '60 Seconds',
    category: 'Borrowing',
    content: `An EMI is a fixed monthly payment made to a lender to repay a loan over a set tenure.

Key Principles:
1. Principal + Interest: Every EMI installment pays off a portion of the borrowed principal plus accrued interest.
2. Tenure Trade-Off: Longer tenures reduce monthly payments but increase the total interest paid over time.
3. Bounce Fees: If account balance is insufficient on the deduction date, banks charge ₹400-₹600 penalty plus damage to your credit score.`,
    quiz: [
      {
        question: 'What does each EMI payment consist of?',
        options: [
          'Principal repayment + interest charge',
          'Only bank administrative tax',
          'A deposit into your fixed deposit',
        ],
        correct: 0,
      },
      {
        question: 'What is the downside of extending your loan tenure from 12 to 36 months?',
        options: [
          'Monthly EMI goes higher',
          'Total interest paid over the loan increases',
          'The bank takes your land immediately',
        ],
        correct: 1,
      },
    ],
  },
  {
    id: 'cibil',
    title: 'What is a CIBIL / Credit Score?',
    duration: '60 Seconds',
    category: 'Credit Health',
    content: `A credit score is a 3-digit number between 300 and 900 that represents your trustworthiness as a borrower.

Key Principles:
1. 750+ Is Ideal: A score above 750 qualifies you for lowest interest rates and rapid loan sanctions.
2. On-Time Repayment: Paying UPI credit, credit cards, and EMIs on time is the single fastest way to boost your score.
3. Inquiries: Applying for multiple instant loan apps within a few days drops your credit rating.`,
    quiz: [
      {
        question: 'Which credit score range is considered excellent by Indian banks?',
        options: ['100 to 250', '300 to 450', '750 to 900'],
        correct: 2,
      },
      {
        question: 'What happens if you miss an EMI payment date?',
        options: [
          'Your credit score declines',
          'The score instantly resets to zero',
          'The government pays your debt',
        ],
        correct: 0,
      },
    ],
  },
  {
    id: 'budget',
    title: 'The 50-30-20 Practical Budgeting Rule',
    duration: '60 Seconds',
    category: 'Daily Budgeting',
    content: `The 50-30-20 rule is an intuitive benchmark to divide monthly earnings for healthy finances.

Key Principles:
1. 50% for Needs: Rent, groceries, school fees, utilities, and essential healthcare.
2. 30% for Discretionary: Festive shopping, family travel, celebrations, and dining out.
3. 20% for Savings & Debt Elimination: Dedicated SIPs, emergency buffer, and clearing outstanding loans.`,
    quiz: [
      {
        question: 'Under the 50-30-20 rule, what percentage is allocated to savings and debt reduction?',
        options: ['5%', '20%', '75%'],
        correct: 1,
      },
      {
        question: 'Which of the following belongs in the 50% "Needs" bucket?',
        options: [
          'Essential groceries, ration, and school fees',
          'Luxury jewelry and branded smartphones',
          'Speculative betting and lottery tickets',
        ],
        correct: 0,
      },
    ],
  },
]

function LiteracyPage() {
  const { activeProfile } = useDemoStore()
  const [activeLessonId, setActiveLessonId] = useState(LESSONS[0].id)
  const [quizState, setQuizState] = useState({})
  const [totalPoints, setTotalPoints] = useState(45)

  const activeLesson = LESSONS.find((l) => l.id === activeLessonId) || LESSONS[0]
  const currentQuizData = quizState[activeLesson.id] || { answers: {}, completed: false, score: 0 }

  const handleSelectAnswer = (qIndex, optionIndex) => {
    if (currentQuizData.completed) return

    const newAnswers = { ...currentQuizData.answers, [qIndex]: optionIndex }
    setQuizState((prev) => ({
      ...prev,
      [activeLesson.id]: {
        ...prev[activeLesson.id],
        answers: newAnswers,
      },
    }))
  }

  const handleEvaluateQuiz = () => {
    let score = 0
    activeLesson.quiz.forEach((q, idx) => {
      if (currentQuizData.answers[idx] === q.correct) {
        score += 1
      }
    })

    setQuizState((prev) => ({
      ...prev,
      [activeLesson.id]: {
        answers: currentQuizData.answers,
        completed: true,
        score,
      },
    }))
    setTotalPoints((prev) => prev + score * 10)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Learn Money in 60 Seconds
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Vernacular bite-sized financial literacy for {activeProfile.name}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#0D162B] p-2.5 px-4 rounded-2xl border border-slate-200 dark:border-white/10 self-start shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Points:</span>
          <span className="font-mono font-extrabold text-sm text-indigo-900 dark:text-indigo-400">
            {totalPoints} Pts
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lessons List Column - NO NUMBERS, NO WHITE CARDS */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
            Micro Lessons
          </span>
          {LESSONS.map((l) => {
            const isSelected = activeLessonId === l.id
            const isCompleted = quizState[l.id]?.completed

            return (
              <button
                key={l.id}
                onClick={() => setActiveLessonId(l.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-indigo-900 bg-indigo-900 text-white dark:bg-indigo-600 dark:border-indigo-500 shadow-sm dark:shadow-[0_0_18px_rgba(79,70,229,0.35)]'
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D162B] text-slate-800 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                    {l.category}
                  </span>
                  {isCompleted ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
                      Passed
                    </span>
                  ) : (
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {l.duration}
                    </span>
                  )}
                </div>

                <div className={`text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                  {l.title}
                </div>
              </button>
            )
          })}
        </div>

        {/* Lesson & Quiz Viewer Column - DARK NAVY DESIGN SYSTEM */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lesson Content Card */}
          <div className="bg-white dark:bg-[#0D162B] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 dark:bg-[#111D35] text-slate-700 dark:text-indigo-300 font-mono">
                {activeLesson.category}
              </span>
              <span className="text-xs font-mono text-slate-400">{activeLesson.duration} Read</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {activeLesson.title}
            </h2>

            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
              {activeLesson.content}
            </div>
          </div>

          {/* Interactive Micro Quiz Card */}
          <div className="bg-white dark:bg-[#0D162B] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Quick Knowledge Check
              </h3>
              {currentQuizData.completed && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
                  Score: {currentQuizData.score} / {activeLesson.quiz.length} Correct (+{currentQuizData.score * 10} pts)
                </span>
              )}
            </div>

            <div className="space-y-6">
              {activeLesson.quiz.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Question {qIdx + 1}: {q.question}
                  </div>

                  {/* Dark Selectable Options with Circle Indicator */}
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = currentQuizData.answers[qIdx] === oIdx
                      const isCorrect = q.correct === oIdx

                      let optStyles =
                        'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111D35] text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-white/30'

                      if (currentQuizData.completed) {
                        if (isCorrect) {
                          optStyles =
                            'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950/60 text-green-950 dark:text-green-300 font-bold'
                        } else if (isSelected) {
                          optStyles =
                            'border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-950/60 text-red-950 dark:text-red-300'
                        }
                      } else if (isSelected) {
                        optStyles =
                          'border-indigo-900 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-white font-semibold'
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={currentQuizData.completed}
                          onClick={() => handleSelectAnswer(qIdx, oIdx)}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all duration-150 flex items-center gap-3 cursor-pointer ${optStyles}`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-400'
                                : 'border-slate-400 dark:border-slate-500'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!currentQuizData.completed ? (
              <button
                onClick={handleEvaluateQuiz}
                disabled={Object.keys(currentQuizData.answers).length < activeLesson.quiz.length}
                className="px-6 py-3 text-xs font-bold rounded-xl bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white disabled:opacity-40 transition shadow-sm cursor-pointer"
              >
                Submit Answers & Earn Points
              </button>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-[#111D35] border border-slate-200 dark:border-white/10">
                Lesson completed. Select another micro-lesson from the left column to keep building your financial literacy and wellness score.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
