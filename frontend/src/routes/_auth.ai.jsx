import React, { useState, useEffect, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useDemoStore } from '../store/useDemoStore'
import api from '../services/api'

export const Route = createFileRoute('/_auth/ai')({
  component: AIPage,
})

function AIPage() {
  const navigate = useNavigate()
  const { activeProfile, canApplyForLoan } = useDemoStore()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef(null)
  const chatEndRef = useRef(null)

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = activeProfile.language === 'hi' ? 'hi-IN' : 'en-IN'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        handleUserMessage(transcript)
      }
      recognitionRef.current = recognition
    }
  }, [activeProfile.language])

  // Reset or load initial personalized conversation
  useEffect(() => {
    setMessages([
      {
        id: 'init-1',
        sender: 'bot',
        text: `Namaste ${activeProfile.name.split(' ')[0]} ji.\n\nI understand your complete financial picture as a ${activeProfile.displaySegment} with a stress index of ${activeProfile.stressScore}/100. How can I assist you today?`,
        quickReplies: [
          'Check my balance',
          'I need a loan',
          'Check my EMI',
          'Show recommendations',
          'Help me save money',
        ],
      },
    ])
  }, [activeProfile.id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.start()
      } catch {
        setIsListening(false)
      }
    }
  }

  // Normalized AI Engine: Handles backend call with intelligent local ethical banking fallback
  const processAIResponse = async (userText) => {
    const textLower = userText.toLowerCase()
    const isLoanQuery = ['loan', 'karz', 'credit', 'paise chahiye', 'कर्ज', 'लोन', 'हप्ता', 'borrow'].some((w) =>
      textLower.includes(w)
    )

    // Check Ethical Guardrail: Stress Score > 50 (e.g. Meena Devi)
    if (isLoanQuery && !canApplyForLoan()) {
      return {
        text: `I understand that managing payments can feel difficult right now.\n\nA new loan may add pressure, so under BankBuddy's responsible banking commitment, I won't push you toward more borrowing.\n\nI can help you with safe relief alternatives:`,
        quickReplies: [
          'Restructure EMI',
          'Change EMI date',
          'Talk to counselor',
          'Review my finances',
        ],
        blocked: true,
        reason: 'Stress score above responsible threshold (50)',
      }
    }

    // Try Backend API First
    try {
      const res = await api.post('/chat/message/', {
        customer_id: activeProfile.id,
        message: userText,
        language: activeProfile.language,
      })

      if (res.data && res.data.response) {
        return {
          text: res.data.response,
          quickReplies: res.data.quick_replies || [],
          action: res.data.action_link,
          productCard: res.data.product_card,
        }
      }
    } catch {
      // Gracefully fall back to local intelligent banking response engine
    }

    // Intelligent Local Engine Fallbacks
    if (textLower.includes('balance')) {
      return {
        text: `Your current verified account balance is ₹${activeProfile.balance.toLocaleString('en-IN')}.\n\nYour monthly cash inflow is ₹${activeProfile.monthlyIncome.toLocaleString('en-IN')} with an active savings rate of ${activeProfile.savingsRate}%.`,
        quickReplies: ['Show recommendations', 'Check my EMI', 'Help me save money'],
      }
    }

    if (isLoanQuery) {
      return {
        text: `Based on your verified cash-flow stability and stress index of ${activeProfile.stressScore}/100, you are eligible for pre-approved credit.\n\nI can help you estimate the monthly EMI and guide you through transparent application steps.`,
        quickReplies: ['Calculate EMI', 'Show loan options', 'Apply now', 'Tell me more'],
        showEmiTool: true,
      }
    }

    if (textLower.includes('emi') || textLower.includes('calculate')) {
      return {
        text: `Here is our transparent EMI estimator. For a loan of ₹50,000 for 12 months at 11.5% interest, your estimated monthly deduction will be approx ₹4,430/month.`,
        quickReplies: ['Apply now', 'Show loan options', 'Check my balance'],
        showEmiTool: true,
      }
    }

    if (textLower.includes('recommend') || textLower.includes('save') || textLower.includes('advice')) {
      return {
        text: `For your ${activeProfile.displaySegment} profile, we recommend exploring:\n\n1. ${activeProfile.recommendedThemes[0]}\n2. ${activeProfile.recommendedThemes[1]}\n3. ${activeProfile.recommendedThemes[2]}\n\nEvery recommendation has passed our algorithmic fairness review.`,
        quickReplies: ['View all recommendations', 'I need a loan', 'Check my balance'],
        action: '/recommendations',
      }
    }

    if (textLower.includes('restructure') || textLower.includes('date') || textLower.includes('counselor')) {
      return {
        text: `We have scheduled a call with our vernacular financial advisor in ${activeProfile.languageName}. Your EMI date shift request has also been queued to avoid bounce charges.`,
        quickReplies: ['Review my finances', 'Check my balance'],
      }
    }

    return {
      text: `I am your BankBuddy financial companion. I can assist you with your balance, checking upcoming EMIs, ethical loan options, and personalized wealth recommendations in your language.`,
      quickReplies: ['Check my balance', 'I need a loan', 'Show recommendations', 'Help me save money'],
    }
  }

  const handleUserMessage = async (text) => {
    if (!text.trim()) return

    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: text.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate natural thinking delay
    setTimeout(async () => {
      const response = await processAIResponse(text)
      setIsTyping(false)
      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: response.text,
        quickReplies: response.quickReplies,
        showEmiTool: response.showEmiTool,
        action: response.action,
        blocked: response.blocked,
      }
      setMessages((prev) => [...prev, botMsg])
    }, 600)
  }

  const handleQuickReply = (reply) => {
    if (reply === 'Apply now') {
      navigate({ to: '/loans' })
      return
    }
    if (reply === 'View all recommendations') {
      navigate({ to: '/recommendations' })
      return
    }
    handleUserMessage(reply)
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">
              BankBuddy AI Assistant
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
              Personalized &bull; {activeProfile.displaySegment}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Speaking in {activeProfile.languageName} &bull; Ethical AI Protected
          </p>
        </div>

        <div className="flex items-center gap-2">
          {speechSupported && (
            <button
              onClick={toggleVoiceInput}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                isListening
                  ? 'bg-red-600 text-white border-red-600 animate-pulse'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isListening ? 'Listening...' : 'Voice Input'}
            </button>
          )}
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-100/60 dark:bg-slate-950">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user'

          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-900 text-white rounded-tr-sm shadow-sm'
                    : msg.blocked
                    ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 rounded-tl-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Inline Working EMI Tool Widget */}
                {msg.showEmiTool && (
                  <InlineEmiWidget onApplyClick={() => navigate({ to: '/loans' })} />
                )}
              </div>

              {/* Text Quick Replies Buttons */}
              {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-w-[90%] pt-1">
                  {msg.quickReplies.map((qr) => (
                    <button
                      key={qr}
                      onClick={() => handleQuickReply(qr)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-400 text-slate-700 dark:text-slate-200 transition"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-28 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400">Thinking...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Message Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleUserMessage(input)
        }}
        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask BankBuddy in ${activeProfile.languageName} or English (e.g. "I need a loan", "Check my balance")...`}
          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-5 py-3 rounded-xl bg-indigo-900 dark:bg-indigo-600 text-white font-bold text-xs disabled:opacity-50 hover:bg-indigo-800 transition"
        >
          Send
        </button>
      </form>
    </div>
  )
}

function InlineEmiWidget({ onApplyClick }) {
  const [amt, setAmt] = useState(50000)
  const [tenure, setTenure] = useState(12)
  const rate = 11.5

  const monthlyRate = rate / (12 * 100)
  const emi = Math.round(
    (amt * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1)
  )

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
      <div className="font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        Instant EMI Calculator Widget
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label className="text-[10px] text-slate-400 block mb-0.5">Amount: ₹{amt.toLocaleString('en-IN')}</label>
          <input
            type="range"
            min="10000"
            max="150000"
            step="5000"
            value={amt}
            onChange={(e) => setAmt(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 block mb-0.5">Tenure: {tenure} Months</label>
          <input
            type="range"
            min="6"
            max="36"
            step="6"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] text-slate-400 block">Calculated Monthly EMI</span>
          <span className="font-mono font-extrabold text-sm text-indigo-700 dark:text-indigo-400">
            ₹{emi.toLocaleString('en-IN')}/mo
          </span>
        </div>
        <button
          type="button"
          onClick={onApplyClick}
          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-900 dark:bg-indigo-600 text-white hover:bg-indigo-800"
        >
          Apply Now
        </button>
      </div>
    </div>
  )
}
