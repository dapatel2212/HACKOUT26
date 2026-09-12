import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';

export default function Layout() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: '📊' },
    { to: '/chat', label: t('nav.chat'), icon: '💬' },
    { to: '/loans', label: t('nav.loans'), icon: '💳' },
    { to: '/wellness', label: t('nav.wellness'), icon: '🌱' },
    { to: '/consent', label: t('nav.consent'), icon: '🛡️' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col md:flex-row py-6 gap-6">
        {/* Desktop Sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-green-50 text-green-800 border-l-4 border-green-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 text-xs text-green-900">
            <div className="font-bold flex items-center gap-1 mb-1">
              <span>🇮🇳</span>
              <span>100% Vernacular Banking</span>
            </div>
            <p className="text-green-800">
              Swadeshi AI protecting Bharat's financial future with consent-first privacy.
            </p>
          </div>
        </aside>

        {/* Main View Area */}
        <main className="flex-1 min-w-0 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
