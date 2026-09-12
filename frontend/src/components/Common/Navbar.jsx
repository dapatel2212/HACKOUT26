import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useCustomerStore } from '../../store/customerStore';
import { SEGMENTS, STRESS_COLORS } from '../../constants';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { customer, logout } = useAuthStore();
  const { segment, stressLevel } = useCustomerStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const segInfo = segment ? SEGMENTS[segment] : null;
  const stressInfo = stressLevel ? STRESS_COLORS[stressLevel] : null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🏦</span>
              <div>
                <span className="font-bold text-xl text-green-700 tracking-tight">BankBuddy</span>
                <span className="ml-1.5 text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full uppercase">
                  Bharat
                </span>
              </div>
            </Link>

            {segInfo && (
              <span className="hidden md:inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                <span className="mr-1">{segInfo.emoji}</span>
                {segInfo.label}
              </span>
            )}

            {stressInfo && (
              <span className={`hidden md:inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${stressInfo.bg} ${stressInfo.text} ${stressInfo.border} font-medium`}>
                <span className={`w-2 h-2 mr-1.5 rounded-full ${stressInfo.dot}`}></span>
                {stressInfo.label}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            {customer && (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                  <div className="text-xs text-gray-500">{customer.customer_id}</div>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
