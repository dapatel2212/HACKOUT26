import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomerStore } from '../store/customerStore';

export default function LoanPage() {
  const { t } = useTranslation();
  const { profile, stressLevel, stressScore } = useCustomerStore();

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(50000);
  const [tenure, setTenure] = useState(12);

  const isStressed = stressLevel === 'ORANGE' || stressLevel === 'RED' || (stressScore && stressScore > 50);

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const interestRate = 11.5;
  const monthlyRate = interestRate / (12 * 100);
  const emi = Math.round(
    (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1)
  );

  const handleApply = async () => {
    setStep(4);
  };

  if (isStressed) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 max-w-2xl mx-auto text-center">
        <div className="text-5xl mb-4">🛡️</div>
        <h2 className="text-xl font-bold text-red-800">Responsible Lending Protection Active</h2>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Based on our ethical banking guardrails, high-interest loans are locked when your financial stress score is elevated.
          We will never burden vulnerable families with debt spirals.
        </p>
        <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200 text-xs text-orange-900 text-left">
          <div className="font-bold mb-1">Recommended Alternatives Available:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Existing EMI date postponement (up to 30 days)</li>
            <li>Tenure extension to lower current monthly payments by 25-40%</li>
            <li>Free consultation with certified vernacular financial counselor</li>
          </ul>
        </div>
        <button
          onClick={() => alert('Support request submitted. A Relationship Manager will call you within 2 hours.')}
          className="mt-6 px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold text-sm shadow transition"
        >
          Request Free Debt Restructuring Support
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          <span>{t('loan.title')}</span>
          <span>{t('loan.step')} {step} of 4</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">{t('loan.selectAmount')}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Pre-approved limit up to ₹2,00,000 based on cash flows.</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200 text-center">
            <div className="text-3xl font-extrabold text-green-800 font-mono">
              ₹{amount.toLocaleString('en-IN')}
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full mt-6 accent-green-600 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
              <span>₹10,000</span>
              <span>₹1,00,000</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-semibold transition"
            >
              Continue to Tenure →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">{t('loan.selectTenure')}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Select a repayment period that suits your cash flows.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[6, 12, 24, 36].map((tMonths) => (
              <button
                key={tMonths}
                type="button"
                onClick={() => setTenure(tMonths)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  tenure === tMonths
                    ? 'border-green-600 bg-green-50/80 text-green-900 ring-2 ring-green-600 font-bold'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-lg font-bold">{tMonths} Mo</div>
                <div className="text-[11px] text-gray-500 mt-1">@ 11.5% p.a.</div>
              </button>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-800 font-semibold">{t('loan.calculatedEmi')}</span>
              <div className="text-2xl font-black text-emerald-900 mt-0.5">
                ₹{emi.toLocaleString('en-IN')}<span className="text-xs font-normal">/month</span>
              </div>
            </div>
            <div className="text-right text-xs text-emerald-800">
              <div>Total Interest: ₹{((emi * tenure) - amount).toLocaleString('en-IN')}</div>
              <div className="font-semibold text-emerald-900">Zero Processing Fee</div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-semibold transition"
            >
              Confirm & Verify KYC →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">{t('loan.kycVerify')}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Instant paperless verification with Aadhaar OTP and DigiLocker.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Applicant:</span>
              <span className="font-semibold text-gray-900">{profile?.name || 'Customer'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Aadhaar Linked:</span>
              <span className="font-mono text-gray-900">{profile?.aadhaar_masked || 'XXXX-XXXX-1234'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Loan Amount:</span>
              <span className="font-bold text-green-700">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly EMI:</span>
              <span className="font-bold text-gray-900">₹{emi.toLocaleString('en-IN')}/mo ({tenure} months)</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
            <span>🛡️</span>
            <span>Video KYC simulation ready: camera & microphone permission verified.</span>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-semibold transition shadow-sm"
            >
              {t('loan.submit')}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm">
            ✓
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('loan.congrats')}</h2>
          <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            Your pre-approved personal loan of <b>₹{amount.toLocaleString('en-IN')}</b> has been sanctioned.
            Disbursement directly to your registered bank account will occur in 15 minutes.
          </p>

          <div className="pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2 text-xs font-semibold text-green-800 bg-green-100 hover:bg-green-200 rounded-lg transition"
            >
              Back to Loan Options
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
