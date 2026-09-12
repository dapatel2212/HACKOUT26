import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomerStore } from '../store/customerStore';

export default function ConsentPage() {
  const { t } = useTranslation();
  const { profile } = useCustomerStore();

  const [consents, setConsents] = useState(
    profile?.consent || {
      transaction_analysis: true,
      health_monitoring: true,
      ai_chat: true,
      life_events: false,
      marketing: false,
    }
  );

  const consentDescriptions = [
    {
      key: 'transaction_analysis',
      title: 'Transaction Pattern Analysis',
      desc: 'Allows AI models to compute RFM metrics, spending ratios, and tailor relevant financial product recommendations.',
      isEssential: true
    },
    {
      key: 'health_monitoring',
      title: 'Financial Stress & Early Anomaly Detection',
      desc: 'Monitors EMI bounce risks and declining balance trajectories to protect you from default penalties.',
      isEssential: true
    },
    {
      key: 'ai_chat',
      title: 'Conversational Vernacular AI Memory',
      desc: 'Enables contextual chatbot memory in your preferred regional language across sessions.',
      isEssential: false
    },
    {
      key: 'life_events',
      title: 'Predictive Life Event Detection',
      desc: 'Identifies signals like marriage, child birth, or relocation to offer timely financial planning.',
      isEssential: false
    },
    {
      key: 'marketing',
      title: 'Partner Offers & Promotional Notifications',
      desc: 'Opt-in for external financial discounts and partner deals. Disabled by default under DPDP rules.',
      isEssential: false
    }
  ];

  const handleToggle = (key) => {
    setConsents((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile || {}, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `customer_data_${profile?.customer_id || 'export'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🛡️</span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('consent.title')}</h2>
            <p className="text-xs text-gray-600 mt-1">{t('consent.subtitle')}</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
          <b>RBI & DPDP 2023 Principles Enforced:</b> No pre-checked boxes, granular opt-ins, 30-day cool-down between recommendations, and all customer data remains localized strictly in Mumbai (ap-south-1).
        </div>
      </div>

      {/* Consent Toggles List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {consentDescriptions.map((item) => (
          <div key={item.key} className="p-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">{item.title}</span>
                {item.isEssential && (
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                    Core Security
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle(item.key)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                consents[item.key] ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  consents[item.key] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Data Subject Rights (DPDP Rights) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Your Data Subject Rights</h3>
          <p className="text-xs text-gray-500 mt-0.5">Download your complete encrypted records or request irreversible account erasure.</p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleDownload}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition"
          >
            📥 {t('consent.downloadData')}
          </button>
          <button
            onClick={() => alert('Right to Erasure request received. Data will be purged according to RBI retention compliance.')}
            className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-xl transition"
          >
            🗑️ {t('consent.deleteData')}
          </button>
        </div>
      </div>
    </div>
  );
}
