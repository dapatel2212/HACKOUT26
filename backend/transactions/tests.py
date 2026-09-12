"""
Unit tests for Transaction endpoints.
"""

from unittest.mock import patch, MagicMock
from django.test import TestCase
from rest_framework.test import APIClient
from utils.auth import get_tokens_for_customer


class TransactionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = {
            'customer_id': 'CUST_001',
            'name': 'Ramesh Kumar',
            'email': 'farmer@demo.com',
        }
        tokens = get_tokens_for_customer(self.customer)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

    @patch('utils.auth.get_collection')
    @patch('transactions.views.get_collection')
    def test_transaction_list_paginated(self, mock_tx_coll, mock_auth_coll):
        mock_auth_coll.return_value.find_one.return_value = self.customer
        mock_col = MagicMock()
        mock_col.count_documents.return_value = 2
        mock_col.find.return_value.sort.return_value.skip.return_value.limit.return_value = [
            {'customer_id': 'CUST_001', 'amount': 1500, 'type': 'debit', 'category': 'food'},
            {'customer_id': 'CUST_001', 'amount': 25000, 'type': 'credit', 'category': 'salary'},
        ]
        mock_tx_coll.return_value = mock_col

        res = self.client.get('/api/transactions/?customer_id=CUST_001&page=1&page_size=10')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['count'], 2)
        self.assertEqual(len(res.data['results']), 2)

    @patch('utils.auth.get_collection')
    @patch('transactions.views.get_collection')
    def test_transaction_insights(self, mock_tx_coll, mock_auth_coll):
        mock_auth_coll.return_value.find_one.return_value = self.customer
        mock_col = MagicMock()
        mock_col.aggregate.return_value = [
            {
                'monthly_spend': [{'month': '2024-03', 'amount': 15000.0}],
                'totals': [{'total': 25000.0, '_id': 'credit'}, {'total': 15000.0, '_id': 'debit'}],
                'category_spend': [{'amount': 5000.0, '_id': 'food'}, {'amount': 10000.0, '_id': 'emi'}],
                'monthly_income': [{'amount': 25000.0, '_id': '2024-03'}]
            }
        ]
        mock_tx_coll.return_value = mock_col

        res = self.client.get('/api/transactions/insights/CUST_001/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('monthly_spend', res.data)
        self.assertIn('category_breakdown', res.data)
        self.assertEqual(res.data['category_breakdown']['food'], 0.3333)
        self.assertEqual(res.data['savings_rate'], 0.4)
        self.assertEqual(res.data['income_trend'], 'stable')

    @patch('utils.auth.get_collection')
    @patch('transactions.views.get_collection')
    def test_spending_categories(self, mock_tx_coll, mock_auth_coll):
        mock_auth_coll.return_value.find_one.return_value = self.customer
        mock_col = MagicMock()
        mock_col.aggregate.return_value = [
            {'_id': 'food', 'amount': 3000.0},
            {'_id': 'utilities', 'amount': 1000.0}
        ]
        mock_tx_coll.return_value = mock_col

        res = self.client.get('/api/transactions/spending-categories/CUST_001/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['total_spend'], 4000.0)
        self.assertEqual(res.data['category_breakdown']['food'], 0.75)
        self.assertEqual(res.data['category_breakdown']['utilities'], 0.25)
