"""
Synthetic banking data generator using Python stdlib (no Faker).
Generates Indian customers and 6 months of realistic transaction histories.
"""

import random
import string
from datetime import datetime, timedelta, timezone

from django.contrib.auth.hashers import make_password
from utils.constants import SEGMENTS, LANGUAGES

FIRST_NAMES = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kiara', 'Pari', 'Myra', 'Riya', 'Anushka', 'Meera',
    'Ramesh', 'Suresh', 'Dinesh', 'Mahesh', 'Rajesh', 'Priya', 'Sunita', 'Pooja', 'Kavita', 'Meena'
]

LAST_NAMES = [
    'Kumar', 'Sharma', 'Patel', 'Singh', 'Verma', 'Gupta', 'Yadav', 'Joshi', 'Mishra', 'Reddy',
    'Nair', 'Iyer', 'Choudhury', 'Banerjee', 'Chatterjee', 'Das', 'Kulkarni', 'Deshmukh', 'Patil', 'Pawar'
]

MERCHANTS = {
    'food': ['Swiggy', 'Zomato', 'D-Mart', 'BigBasket', 'Local Kirana', 'Blinkit', 'Chai Point'],
    'utilities': ['Electricity Board', 'Jio Fiber', 'Airtel Postpaid', 'Indane Gas', 'Water Supply'],
    'medical': ['Apollo Pharmacy', '1mg', 'MedPlus', 'Max Hospital', 'City Clinic'],
    'education': ['BYJUS', 'Allen Career Institute', 'Delhi Public School', 'Book Depot'],
    'entertainment': ['Netflix India', 'PVR Cinemas', 'BookMyShow', 'Hotstar'],
    'fuel': ['Indian Oil', 'Bharat Petroleum', 'HP Petrol Pump'],
    'investment': ['Zerodha Broking', 'Groww', 'Nippon Mutual Fund', 'SBI Mutual Fund'],
    'insurance_premium': ['LIC of India', 'HDFC ERGO', 'Star Health', 'ICICI Lombard'],
    'festival_spend': ['Amazon India', 'Flipkart', 'Tanishq Jewellers', 'FabIndia', 'Kalyan Jewellers'],
    'emi': ['HDFC Bank Loan', 'SBI Cards EMI', 'Bajaj Finance', 'ICICI Bank Home Loan']
}

CHANNELS = ['upi', 'nach', 'atm', 'net_banking', 'pos']


def generate_pan():
    letters = ''.join(random.choices(string.ascii_uppercase, k=5))
    digits = f"{random.randint(1000, 9999)}"
    letter = random.choice(string.ascii_uppercase)
    return f"{letters}{digits}{letter}"


def generate_customers(count=500):
    customers = []
    default_pw_hash = make_password('Demo@123')

    # Income distributions per segment
    income_brackets = {
        'prudent_savers': (45000, 95000),
        'aspiring_spenders': (25000, 60000),
        'family_builders': (35000, 75000),
        'digital_natives': (20000, 50000),
        'seasonal_earners': (12000, 30000),
        'stressed_accounts': (15000, 35000),
    }

    for i in range(1, count + 1):
        segment = random.choice(SEGMENTS)
        min_inc, max_inc = income_brackets[segment]
        income = random.randint(min_inc // 1000, max_inc // 1000) * 1000

        fname = random.choice(FIRST_NAMES)
        lname = random.choice(LAST_NAMES)
        name = f"{fname} {lname}"
        customer_id = f"CUST_{i:04d}"
        email = f"{fname.lower()}.{lname.lower()}{i}@example.com"
        phone = f"+91-{random.randint(6000000000, 9999999999)}"

        if segment == 'stressed_accounts':
            stress_score = random.randint(65, 95)
            stress_level = 'ORANGE' if stress_score <= 80 else 'RED'
            wellness = random.randint(25, 45)
        elif segment == 'seasonal_earners':
            stress_score = random.randint(15, 45)
            stress_level = 'GREEN' if stress_score <= 30 else 'YELLOW'
            wellness = random.randint(45, 65)
        else:
            stress_score = random.randint(5, 35)
            stress_level = 'GREEN' if stress_score <= 30 else 'YELLOW'
            wellness = random.randint(60, 90)

        existing_products = ['savings_account']
        if segment in ('prudent_savers', 'family_builders'):
            existing_products.append(random.choice(['fd', 'health_insurance', 'sip']))
        elif segment == 'seasonal_earners':
            existing_products.append('kisan_credit')
        elif segment == 'digital_natives':
            existing_products.append('credit_card')
        elif segment == 'stressed_accounts':
            existing_products.append('personal_loan')

        cust = {
            'customer_id': customer_id,
            'name': name,
            'email': email,
            'phone': phone,
            'password': default_pw_hash,
            'dob': f"{random.randint(1965, 2004)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            'pan': generate_pan(),
            'aadhaar_masked': f"XXXX-XXXX-{random.randint(1000, 9999)}",
            'language': random.choice(LANGUAGES),
            'tier': random.choices([1, 2, 3, 4], weights=[20, 30, 35, 15])[0],
            'segment': segment,
            'income_monthly': income,
            'existing_products': existing_products,
            'stress_score': stress_score,
            'stress_level': stress_level,
            'wellness_score': wellness,
            'consent': {
                'transaction_analysis': True,
                'health_monitoring': True,
                'ai_chat': True,
                'life_events': random.choice([True, False]),
                'marketing': False,
            },
            'created_at': (datetime.now(timezone.utc) - timedelta(days=200)).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat(),
        }
        customers.append(cust)

    return customers


def generate_transactions_for_customer(customer, days=180):
    transactions = []
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)

    income = customer['income_monthly']
    segment = customer['segment']
    is_stressed = segment == 'stressed_accounts'
    balance = float(income * random.uniform(0.5, 2.5))

    current_date = start_date

    # Monthly salary dates (around 1st of month)
    salary_dates = []
    d = start_date
    while d <= end_date:
        if d.day == 1:
            salary_dates.append(d)
        d += timedelta(days=1)

    while current_date <= end_date:
        # 1. Salary Credit
        if any(current_date.year == sd.year and current_date.month == sd.month and current_date.day == sd.day for sd in salary_dates):
            salary_amt = float(income * random.uniform(0.98, 1.02))
            balance += salary_amt
            transactions.append({
                'customer_id': customer['customer_id'],
                'date': current_date.isoformat(),
                'amount': round(salary_amt, 2),
                'type': 'credit',
                'category': 'salary',
                'description': 'Salary Credit - Employer NACH',
                'channel': 'nach',
                'merchant': 'Corporate Employer',
                'balance_after': round(balance, 2),
                'is_salary': True,
                'is_emi': False,
                'is_bounced': False
            })

        # 2. Monthly EMI Debit (around 5th-10th)
        if current_date.day == 7 and 'personal_loan' in customer.get('existing_products', []) or (is_stressed and current_date.day == 7):
            emi_amt = round(income * random.uniform(0.25, 0.45), 2)
            bounced = is_stressed and random.random() < 0.35  # Stressed accounts have bounces
            if not bounced:
                balance -= emi_amt
            transactions.append({
                'customer_id': customer['customer_id'],
                'date': current_date.isoformat(),
                'amount': emi_amt,
                'type': 'debit',
                'category': 'emi',
                'description': 'Loan EMI Auto-Debit' + (' (BOUNCED)' if bounced else ''),
                'channel': 'nach',
                'merchant': random.choice(MERCHANTS['emi']),
                'balance_after': round(balance, 2),
                'is_salary': False,
                'is_emi': True,
                'is_bounced': bounced
            })

        # 3. Discretionary Daily Transactions (0 to 3 per day)
        num_tx = random.choices([0, 1, 2, 3], weights=[40, 35, 15, 10])[0]
        for _ in range(num_tx):
            category = random.choice(list(MERCHANTS.keys()))
            if category in ('salary', 'emi'):
                continue
            merchant = random.choice(MERCHANTS[category])

            if category in ('festival_spend', 'investment'):
                amount = float(random.randint(1500, 12000))
            elif category == 'utilities':
                amount = float(random.randint(300, 2500))
            else:
                amount = float(random.randint(50, 1200))

            balance = max(0.0, balance - amount)
            tx_time = current_date.replace(
                hour=random.randint(8, 22),
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )

            transactions.append({
                'customer_id': customer['customer_id'],
                'date': tx_time.isoformat(),
                'amount': round(amount, 2),
                'type': 'debit',
                'category': category,
                'description': f"UPI Payment to {merchant}",
                'channel': random.choice(['upi', 'upi', 'pos', 'atm']),
                'merchant': merchant,
                'balance_after': round(balance, 2),
                'is_salary': False,
                'is_emi': False,
                'is_bounced': False
            })

        current_date += timedelta(days=1)

    return transactions
