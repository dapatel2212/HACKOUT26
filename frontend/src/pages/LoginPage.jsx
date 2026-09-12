import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import LanguageSwitcher from '../components/Common/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();

  const [identifier, setIdentifier] = useState('farmer@demo.com');
  const [password, setPassword] = useState('Demo@123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(identifier, password);
      navigate('/');
    } catch {
      // handled by store
    }
  };

  const handleDemoSelect = async (email, demoLang = 'en') => {
    setIdentifier(email);
    setPassword('Demo@123');
    if (demoLang) {
      await i18n.changeLanguage(demoLang);
      localStorage.setItem('preferred_language', demoLang);
    }
    try {
      await login(email, 'Demo@123');
      navigate('/');
    } catch {
      // handled by store
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-2">
          <LanguageSwitcher />
        </div>
        <div className="text-4xl">🏦</div>
        <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
          {t('app.name')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t('app.tagline')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-2xl sm:px-10 border border-gray-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('auth.identifierPlaceholder')}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('auth.passwordPlaceholder')}
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : t('auth.loginButton')}
            </button>
          </form>

          {/* Quick Demo Accounts Switcher */}
          <div className="mt-6 border-t border-gray-200 pt-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('auth.quickDemo')}
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSelect('farmer@demo.com', 'hi')}
                className="text-left px-3 py-2 text-xs font-medium rounded-lg border border-green-200 bg-green-50 text-green-900 hover:bg-green-100 transition-colors flex items-center justify-between"
              >
                <span>🌾 <b>Ramesh</b> (Farmer / Seasonal)</span>
                <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded font-mono">Hindi (22)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('salaried@demo.com', 'ta')}
                className="text-left px-3 py-2 text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100 transition-colors flex items-center justify-between"
              >
                <span>💼 <b>Priya</b> (Prudent Saver)</span>
                <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-mono">Tamil (18)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('shop@demo.com', 'hi')}
                className="text-left px-3 py-2 text-xs font-medium rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-900 hover:bg-yellow-100 transition-colors flex items-center justify-between"
              >
                <span>🏪 <b>Suresh</b> (Kirana / Digital Native)</span>
                <span className="text-[10px] bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded font-mono">Hindi (45)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('gig@demo.com', 'en')}
                className="text-left px-3 py-2 text-xs font-medium rounded-lg border border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100 transition-colors flex items-center justify-between"
              >
                <span>🛵 <b>Arjun</b> (Gig Worker)</span>
                <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-mono">English (30)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('stressed@demo.com', 'mr')}
                className="text-left px-3 py-2 text-xs font-medium rounded-lg border border-red-200 bg-red-50 text-red-900 hover:bg-red-100 transition-colors flex items-center justify-between"
              >
                <span>⚠️ <b>Meena</b> (Stressed Account)</span>
                <span className="text-[10px] bg-red-200 text-red-800 px-1.5 py-0.5 rounded font-bold font-mono">Marathi (72)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
