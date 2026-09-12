export const SEGMENTS = {
  prudent_savers:    { label: 'Prudent Saver',    emoji: '💰', color: 'green', desc: 'Consistent salary, high savings rate' },
  aspiring_spenders: { label: 'Aspiring Spender', emoji: '🛒', color: 'blue', desc: 'Young, rising income, high discretionary spend' },
  family_builders:   { label: 'Family Builder',   emoji: '👨‍👩‍👧', color: 'purple', desc: 'Married with children, education + health spends' },
  digital_natives:   { label: 'Digital Native',   emoji: '📱', color: 'cyan', desc: 'Heavy UPI usage, subscription services' },
  seasonal_earners:  { label: 'Farmer / Seasonal', emoji: '🌾', color: 'yellow', desc: 'Irregular income, crop-cycle patterns' },
  stressed_accounts: { label: 'Needs Support',     emoji: '⚠️', color: 'red', desc: 'EMI bounces, declining balance' }
};

export const STRESS_COLORS = {
  GREEN:  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'Financially Healthy', dot: 'bg-green-500' },
  YELLOW: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', label: 'Monitor Closely', dot: 'bg-yellow-500' },
  ORANGE: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', label: 'Needs Attention', dot: 'bg-orange-500' },
  RED:    { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', label: 'Critical Support Needed', dot: 'bg-red-500' }
};

export const LANGUAGES = [
  { code: 'hi', name: 'हिंदी', english: 'Hindi' },
  { code: 'en', name: 'English', english: 'English' },
  { code: 'ta', name: 'தமிழ்', english: 'Tamil' },
  { code: 'bn', name: 'বাংলা', english: 'Bengali' },
  { code: 'te', name: 'తెలుగు', english: 'Telugu' },
  { code: 'mr', name: 'मराठी', english: 'Marathi' },
  { code: 'gu', name: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'kn', name: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ml', name: 'മലയാളം', english: 'Malayalam' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { code: 'or', name: 'ଓଡ଼ିଆ', english: 'Odia' },
  { code: 'as', name: 'অসমীয়া', english: 'Assamese' }
];

export const PRODUCTS = [
  { id: 'savings_account', name: 'Savings Account', category: 'savings' },
  { id: 'fd', name: 'Fixed Deposit', category: 'deposit' },
  { id: 'credit_card', name: 'Credit Card', category: 'credit' },
  { id: 'personal_loan', name: 'Personal Loan', category: 'loan' },
  { id: 'home_loan', name: 'Home Loan', category: 'loan' },
  { id: 'car_loan', name: 'Car Loan', category: 'loan' },
  { id: 'health_insurance', name: 'Health Insurance', category: 'insurance' },
  { id: 'life_insurance', name: 'Life Insurance', category: 'insurance' },
  { id: 'sip', name: 'Systematic Investment Plan (SIP)', category: 'investment' },
  { id: 'mutual_fund', name: 'Mutual Fund', category: 'investment' },
  { id: 'education_loan', name: 'Education Loan', category: 'loan' },
  { id: 'kisan_credit', name: 'Kisan Credit Card', category: 'loan' },
  { id: 'weather_insurance', name: 'Weather Insurance', category: 'insurance' },
];
