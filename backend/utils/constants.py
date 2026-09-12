"""
Central constants. Import from here — never hardcode these values.
"""

SEGMENTS = [
    'prudent_savers', 'aspiring_spenders', 'family_builders',
    'digital_natives', 'seasonal_earners', 'stressed_accounts',
]

SEGMENT_NAMES = {
    'prudent_savers': 'Prudent Savers',
    'aspiring_spenders': 'Aspiring Spenders',
    'family_builders': 'Family Builders',
    'digital_natives': 'Digital Natives',
    'seasonal_earners': 'Seasonal Earners (Farmers)',
    'stressed_accounts': 'Stressed Accounts',
}

SEGMENT_DESCRIPTIONS = {
    'prudent_savers': 'Consistent salary, high savings rate, low spend',
    'aspiring_spenders': 'Young, rising income, high discretionary spend',
    'family_builders': 'Married with children, education + health spends',
    'digital_natives': 'Heavy UPI usage, subscription services, tech spend',
    'seasonal_earners': 'Irregular income, crop-cycle patterns, rural',
    'stressed_accounts': 'EMI bounces, declining balance, salary delays',
}

STRESS_LEVELS = ['GREEN', 'YELLOW', 'ORANGE', 'RED']
STRESS_THRESHOLDS = {'GREEN': 30, 'YELLOW': 60, 'ORANGE': 80}

PRODUCTS = [
    'savings_account', 'fd', 'credit_card', 'personal_loan',
    'home_loan', 'car_loan', 'health_insurance', 'life_insurance',
    'sip', 'mutual_fund', 'education_loan', 'kisan_credit',
    'weather_insurance',
]

LOAN_PRODUCTS = [
    'personal_loan', 'home_loan', 'car_loan', 'education_loan',
    'kisan_credit', 'credit_card',
]

LANGUAGES = ['hi', 'en', 'ta', 'bn', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as']

INTENTS = [
    'check_balance', 'apply_loan', 'track_application', 'report_fraud',
    'get_recommendation', 'emi_calculator', 'product_info',
    'restructure_emi', 'general_query',
]

CONSENT_TYPES = [
    'transaction_analysis', 'health_monitoring', 'ai_chat',
    'life_events', 'marketing',
]

MONGO_COLLECTIONS = [
    'customers', 'transactions', 'recommendations', 'chat_sessions',
    'stress_alerts', 'consent_logs', 'audit_trail',
]

# Guardrail thresholds
MAX_RECS_PER_SESSION = 3
COOLDOWN_DAYS = 30
STRESS_LOAN_BLOCK_THRESHOLD = 30
