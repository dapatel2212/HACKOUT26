import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';

export default function ChatbotPage() {
  const { t, i18n } = useTranslation();
  const { customer } = useAuthStore();
  const { messages, loading, sendMessage } = useChatStore();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const customerId = customer?.customer_id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || !customerId) return;
    sendMessage(customerId, text, i18n.language || 'hi');
    setInputText('');
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please type your query.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[75vh]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center text-lg shadow-sm">
            🤖
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">{t('chat.title')}</h2>
            <div className="flex items-center space-x-1.5 text-xs text-green-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>12 Indian Languages • IndicBERT NLU</span>
            </div>
          </div>
        </div>

        <div className="text-xs bg-green-100 text-green-800 font-semibold px-2.5 py-1 rounded-full">
          Voice + Text
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm ${
                msg.role === 'user'
                  ? 'bg-green-700 text-white rounded-br-none'
                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
              }`}
            >
              <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>

              {/* Quick action card in chat */}
              {msg.product_card && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200 text-xs text-gray-900">
                  <div className="font-bold text-green-900">{msg.product_card.product}</div>
                  <div className="mt-1">Pre-approved: ₹{msg.product_card.amount}</div>
                  <div className="text-gray-600">EMI: ₹{msg.product_card.emi}/month</div>
                  <a
                    href={msg.action_link || '/loans'}
                    className="inline-block mt-2 px-3 py-1 bg-green-700 text-white rounded-md font-semibold text-xs"
                  >
                    Proceed with Application
                  </a>
                </div>
              )}

              {/* Quick Replies chips */}
              {msg.quick_replies && msg.quick_replies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                  {msg.quick_replies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(reply)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-green-100 text-gray-700 hover:text-green-800 rounded-full text-[11px] font-medium transition"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2 text-xs text-gray-500 shadow-sm flex items-center space-x-2">
              <span className="animate-spin text-sm">⏳</span>
              <span>AI is thinking in your language...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-xl border transition-colors ${
              isListening
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'bg-slate-100 text-gray-700 border-gray-300 hover:bg-slate-200'
            }`}
            title="Speak in your language"
          >
            🎤
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? t('chat.listening') : t('chat.placeholder')}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-green-800 transition disabled:opacity-50"
          >
            {t('chat.send')}
          </button>
        </form>
      </div>
    </div>
  );
}
