"""
Management command: seed_demo_accounts
Creates 2 fully-detailed demo customer accounts in MongoDB.

Demo Account 1 — Vikram Mehta (Salaried Professional)
  Email:    vikram@demo.bankbuddy.in
  Password: Demo@1234

Demo Account 2 — Anita Joshi (Small Business Owner)
  Email:    anita@demo.bankbuddy.in
  Password: Demo@5678
"""

from datetime import datetime, timezone
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from utils.mongodb_helper import get_collection


DEMO_CUSTOMERS = [
    {
        'customer_id': 'CUST_DEMO_101',
        'name': 'Vikram Mehta',
        'email': 'vikram@demo.bankbuddy.in',
        'phone': '9876500101',
        'password': make_password('Demo@1234'),
        'language': 'en',
        'tier': 2,
        'segment': 'prudent_savers',
        'other_income': '',
        'income_monthly': 95000,
        'balance': 245000,
        'existing_products': ['savings_account', 'credit_card', 'mutual_fund_sip', 'health_insurance'],
        'stress_score': 15.42,
        'stress_level': 'GREEN',
        'wellness_score': 88,
        'consent': {
            'transaction_analysis': True,
            'health_monitoring': True,
            'ai_chat': True,
            'life_events': True,
            'marketing': False,
        },
        'created_at': '2025-06-15T10:30:00Z',
        'updated_at': datetime.now(timezone.utc).isoformat(),
    },
    {
        'customer_id': 'CUST_DEMO_102',
        'name': 'Anita Joshi',
        'email': 'anita@demo.bankbuddy.in',
        'phone': '9876500102',
        'password': make_password('Demo@5678'),
        'language': 'hi',
        'tier': 3,
        'segment': 'digital_natives',
        'other_income': '',
        'income_monthly': 55000,
        'balance': 67800,
        'existing_products': ['savings_account', 'pos_device', 'working_capital_od'],
        'stress_score': 38.75,
        'stress_level': 'YELLOW',
        'wellness_score': 61,
        'consent': {
            'transaction_analysis': True,
            'health_monitoring': True,
            'ai_chat': True,
            'life_events': False,
            'marketing': True,
        },
        'created_at': '2025-09-22T14:15:00Z',
        'updated_at': datetime.now(timezone.utc).isoformat(),
    },
]

DEMO_LOANS = [
    # Vikram's loans
    {
        'application_id': 'LN_VM_2201',
        'customer_id': 'CUST_DEMO_101',
        'product_name': 'Home Loan',
        'amount': 2500000,
        'tenure_months': 240,
        'monthly_emi': 24150,
        'status': 'ACCEPTED',
        'stress_score': 15.42,
        'created_at': '2025-08-10T09:00:00Z',
        'category': 'Housing',
    },
    {
        'application_id': 'LN_VM_2202',
        'customer_id': 'CUST_DEMO_101',
        'product_name': 'Pre-Approved Personal Loan',
        'amount': 100000,
        'tenure_months': 24,
        'monthly_emi': 4680,
        'status': 'ACCEPTED',
        'stress_score': 15.42,
        'created_at': '2026-03-18T11:20:00Z',
        'category': 'Personal',
    },
    {
        'application_id': 'LN_VM_2203',
        'customer_id': 'CUST_DEMO_101',
        'product_name': 'Education Loan (Child)',
        'amount': 500000,
        'tenure_months': 60,
        'monthly_emi': 10250,
        'status': 'PENDING',
        'stress_score': 15.42,
        'created_at': '2026-09-01T16:40:00Z',
        'category': 'Education',
    },
    # Anita's loans
    {
        'application_id': 'LN_AJ_3301',
        'customer_id': 'CUST_DEMO_102',
        'product_name': 'Working Capital Overdraft',
        'amount': 150000,
        'tenure_months': 12,
        'monthly_emi': 13280,
        'status': 'ACCEPTED',
        'stress_score': 38.75,
        'created_at': '2026-01-05T10:45:00Z',
        'category': 'Business',
    },
    {
        'application_id': 'LN_AJ_3302',
        'customer_id': 'CUST_DEMO_102',
        'product_name': 'Shop Renovation Loan',
        'amount': 80000,
        'tenure_months': 18,
        'monthly_emi': 4860,
        'status': 'ACCEPTED',
        'stress_score': 38.75,
        'created_at': '2026-05-20T14:30:00Z',
        'category': 'Business',
    },
    {
        'application_id': 'LN_AJ_3303',
        'customer_id': 'CUST_DEMO_102',
        'product_name': 'Two-Wheeler Loan',
        'amount': 60000,
        'tenure_months': 12,
        'monthly_emi': 5310,
        'status': 'REJECTED',
        'rejection_reason': 'Ethical AI Guardrail: Existing business loan obligations create elevated risk.',
        'stress_score': 38.75,
        'created_at': '2026-08-12T09:15:00Z',
        'category': 'Vehicle',
    },
]


class Command(BaseCommand):
    help = 'Seed 2 fully-detailed demo customer accounts into MongoDB'

    def handle(self, *args, **options):
        customers_col = get_collection('customers')
        loans_col = get_collection('loans')

        for cust in DEMO_CUSTOMERS:
            existing = customers_col.find_one({'customer_id': cust['customer_id']})
            if existing:
                customers_col.replace_one({'customer_id': cust['customer_id']}, cust)
                self.stdout.write(self.style.WARNING(
                    f"  Updated existing: {cust['name']} ({cust['email']})"
                ))
            else:
                customers_col.insert_one(cust)
                self.stdout.write(self.style.SUCCESS(
                    f"  Created: {cust['name']} ({cust['email']})"
                ))

        for loan in DEMO_LOANS:
            existing = loans_col.find_one({'application_id': loan['application_id']})
            if existing:
                loans_col.replace_one({'application_id': loan['application_id']}, loan)
            else:
                loans_col.insert_one(loan)

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 55))
        self.stdout.write(self.style.SUCCESS('  Demo accounts seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('=' * 55))
        self.stdout.write('')
        self.stdout.write('  Account 1 - Vikram Mehta (Salaried Professional)')
        self.stdout.write(f'    Email:    vikram@demo.bankbuddy.in')
        self.stdout.write(f'    Password: Demo@1234')
        self.stdout.write(f'    Segment:  Prudent Saver | Income: Rs.95,000/mo')
        self.stdout.write(f'    Stress:   15.42 (GREEN) | Wellness: 88')
        self.stdout.write(f'    Loans:    3 (2 Accepted, 1 Pending)')
        self.stdout.write('')
        self.stdout.write('  Account 2 - Anita Joshi (Small Business Owner)')
        self.stdout.write(f'    Email:    anita@demo.bankbuddy.in')
        self.stdout.write(f'    Password: Demo@5678')
        self.stdout.write(f'    Segment:  Digital Native | Income: Rs.55,000/mo')
        self.stdout.write(f'    Stress:   38.75 (YELLOW) | Wellness: 61')
        self.stdout.write(f'    Loans:    3 (2 Accepted, 1 Rejected)')
        self.stdout.write('')
