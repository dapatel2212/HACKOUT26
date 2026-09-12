"""
Seed script: Inserts the 5 official demo accounts + 500 synthetic customers
and 6 months of transaction history into MongoDB Atlas/Local.

Run directly:
    python data/seed_demo_accounts.py
Or with manage.py:
    python manage.py runscript seed_demo_accounts
"""

import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Ensure backend root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_ai.settings')
import django
django.setup()

from django.contrib.auth.hashers import make_password
from utils.mongodb_helper import get_collection
from data.generate_synthetic import (
    generate_customers,
    generate_transactions_for_customer,
    generate_pan
)

DEMO_CUSTOMERS = [
    {
        'customer_id': 'CUST_DEMO_001',
        'name': 'Ramesh Kumar',
        'email': 'farmer@demo.com',
        'phone': '+91-9876543210',
        'dob': '1985-04-12',
        'pan': 'ABCDE1234F',
        'aadhaar_masked': 'XXXX-XXXX-1234',
        'language': 'hi',
        'tier': 3,
        'segment': 'seasonal_earners',
        'income_monthly': 18000,
        'existing_products': ['savings_account', 'kisan_credit'],
        'stress_score': 22,
        'stress_level': 'GREEN',
        'wellness_score': 61,
        'consent': {
            'transaction_analysis': True,
            'health_monitoring': True,
            'ai_chat': True,
            'life_events': True,
            'marketing': False,
        },
    },
    {
        'customer_id': 'CUST_DEMO_002',
        'name': 'Priya Sharma',
        'email': 'salaried@demo.com',
        'phone': '+91-9876543211',
        'dob': '1995-08-23',
        'pan': 'FGHIJ5678K',
        'aadhaar_masked': 'XXXX-XXXX-5678',
        'language': 'ta',
        'tier': 2,
        'segment': 'prudent_savers',
        'income_monthly': 65000,
        'existing_products': ['savings_account', 'fd'],
        'stress_score': 18,
        'stress_level': 'GREEN',
        'wellness_score': 82,
        'consent': {
            'transaction_analysis': True,
            'health_monitoring': True,
            'ai_chat': True,
            'life_events': False,
            'marketing': False,
        },
    },
    {
        'customer_id': 'CUST_DEMO_003',
        'name': 'Suresh Patel',
        'email': 'shop@demo.com',
        'phone': '+91-9876543212',
        'dob': '1982-11-05',
        'pan': 'KLMNO9012P',
        'aadhaar_masked': 'XXXX-XXXX-9012',
        'language': 'hi',
        'tier': 3,
        'segment': 'digital_natives',
        'income_monthly': 40000,
        'existing_products': ['savings_account', 'credit_card'],
        'stress_score': 45,
        'stress_level': 'YELLOW',
        'wellness_score': 58,
        'consent': {
            'transaction_analysis': True,
            'health_monitoring': True,
            'ai_chat': True,
            'life_events': True,
            'marketing': True,
        },
    },
    {
        'customer_id': 'CUST_DEMO_004',
        'name': 'Arjun Singh',
        'email': 'gig@demo.com',
        'phone': '+91-9876543213',
        'dob': '1998-02-17',
        'pan': 'PQRST3456U',
        'aadhaar_masked': 'XXXX-XXXX-3456',
        'language': 'en',
        'tier': 2,
        'segment': 'aspiring_spenders',
        'income_monthly': 22000,
        'existing_products': ['savings_account'],
        'stress_score': 30,
        'stress_level': 'GREEN',
        'wellness_score': 66,
        'consent': {
            'transaction_analysis': True,
            'health_monitoring': True,
            'ai_chat': True,
            'life_events': False,
            'marketing': False,
        },
    },
    {
        'customer_id': 'CUST_DEMO_005',
        'name': 'Meena Devi',
        'email': 'stressed@demo.com',
        'phone': '+91-9876543214',
        'dob': '1989-07-30',
        'pan': 'UVWXY7890Z',
        'aadhaar_masked': 'XXXX-XXXX-7890',
        'language': 'mr',
        'tier': 3,
        'segment': 'stressed_accounts',
        'income_monthly': 20000,
        'existing_products': ['savings_account', 'personal_loan'],
        'stress_score': 72,
        'stress_level': 'ORANGE',
        'wellness_score': 34,
        'consent': {
            'transaction_analysis': True,
            'health_monitoring': True,
            'ai_chat': True,
            'life_events': False,
            'marketing': False,
        },
    },
]


def seed_database(customer_count=500, clear_existing=True):
    customers_col = get_collection('customers')
    transactions_col = get_collection('transactions')

    if clear_existing:
        print("Clearing existing customers and transactions...")
        customers_col.delete_many({})
        transactions_col.delete_many({})

    # 1. Format Demo Customers
    now = datetime.now(timezone.utc).isoformat()
    demo_pw = make_password('Demo@123')
    prepared_demo = []

    for demo in DEMO_CUSTOMERS:
        doc = {**demo}
        doc['password'] = demo_pw
        doc['created_at'] = now
        doc['updated_at'] = now
        prepared_demo.append(doc)

    print(f"Preparing {len(prepared_demo)} demo accounts...")
    customers_col.insert_many(prepared_demo)

    # 2. Generate 500 Synthetic Customers
    print(f"Generating {customer_count} synthetic customers...")
    synthetic = generate_customers(customer_count)
    customers_col.insert_many(synthetic)

    # 3. Generate Transactions for all
    all_customers = prepared_demo + synthetic
    print(f"Generating 6 months of transactions for {len(all_customers)} accounts...")

    batch = []
    total_tx_count = 0

    for idx, cust in enumerate(all_customers, 1):
        txs = generate_transactions_for_customer(cust, days=180)
        batch.extend(txs)
        total_tx_count += len(txs)

        # Batch insert every 10,000 transactions to save memory
        if len(batch) >= 10000:
            transactions_col.insert_many(batch)
            batch = []
            print(f"  Processed {idx}/{len(all_customers)} customers ({total_tx_count} transactions)...")

    if batch:
        transactions_col.insert_many(batch)

    # Create indexes for fast queries
    print("Building database indexes...")
    customers_col.create_index('customer_id', unique=True)
    customers_col.create_index('email', sparse=True)
    customers_col.create_index('phone', sparse=True)
    transactions_col.create_index([('customer_id', 1), ('date', -1)])

    print(f"Seeding completed successfully!")
    print(f"  - Total Customers: {customers_col.count_documents({})}")
    print(f"  - Total Transactions: {transactions_col.count_documents({})}")


def run():
    """Entry point for django-extensions runscript."""
    seed_database(500)


if __name__ == '__main__':
    seed_database(500)
