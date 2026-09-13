"""
Unit tests for Auth endpoints.
"""

from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient
from utils.auth import get_tokens_for_customer


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('customers.views.get_collection')
    def test_register_success(self, mock_get_coll):
        mock_coll = MagicMock()
        mock_coll.find_one.return_value = None  # User does not exist
        mock_get_coll.return_value = mock_coll

        res = self.client.post('/api/auth/register/', {
            'email': 'farmer@demo.com',
            'password': 'password123',
            'name': 'Ramesh Kumar',
            'phone': '+919876543210'
        }, format='json')

        self.assertEqual(res.status_code, 201)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])
        self.assertIn('refresh', res.data['tokens'])
        self.assertEqual(res.data['customer']['email'], 'farmer@demo.com')
        mock_coll.insert_one.assert_called_once()

    @patch('customers.views.get_collection')
    def test_register_other_income_segment(self, mock_get_coll):
        mock_coll = MagicMock()
        mock_coll.find_one.return_value = None
        mock_get_coll.return_value = mock_coll

        res = self.client.post('/api/auth/register/', {
            'email': 'other@demo.com',
            'password': 'password123',
            'name': 'Other Income User',
            'phone': '+919876543211',
            'segment': 'other',
            'other_income': 'Freelance consulting',
        }, format='json')

        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['customer']['segment'], 'other')
        mock_coll.insert_one.assert_called_once()

    @patch('customers.views.get_collection')
    def test_register_other_income_requires_description(self, mock_get_coll):
        mock_get_coll.return_value = MagicMock()

        res = self.client.post('/api/auth/register/', {
            'email': 'missing-description@demo.com',
            'password': 'password123',
            'segment': 'other',
        }, format='json')

        self.assertEqual(res.status_code, 400)
        self.assertIn('describe', res.data['error'])

    @patch('customers.views.get_collection')
    def test_login_success(self, mock_get_coll):
        mock_coll = MagicMock()
        mock_coll.find_one.return_value = {
            'customer_id': 'CUST_123',
            'email': 'farmer@demo.com',
            'phone': '+919876543210',
            'password': make_password('password123'),
            'name': 'Ramesh Kumar',
        }
        mock_get_coll.return_value = mock_coll

        res = self.client.post('/api/auth/login/', {
            'email': 'farmer@demo.com',
            'password': 'password123'
        }, format='json')

        self.assertEqual(res.status_code, 200)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])

    @patch('customers.views.get_collection')
    def test_login_invalid_password(self, mock_get_coll):
        mock_coll = MagicMock()
        mock_coll.find_one.return_value = {
            'customer_id': 'CUST_123',
            'email': 'farmer@demo.com',
            'password': make_password('correct_password'),
        }
        mock_get_coll.return_value = mock_coll

        res = self.client.post('/api/auth/login/', {
            'email': 'farmer@demo.com',
            'password': 'wrong_password'
        }, format='json')

        self.assertEqual(res.status_code, 401)

    def test_token_refresh(self):
        customer = {'customer_id': 'CUST_123', 'email': 'test@demo.com'}
        tokens = get_tokens_for_customer(customer)

        res = self.client.post('/api/auth/token/refresh/', {
            'refresh': tokens['refresh']
        }, format='json')

        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)

    @patch('customers.views.send_mail')
    @patch('customers.views.get_collection')
    def test_send_otp_success(self, mock_get_coll, mock_send_mail):
        mock_coll = MagicMock()
        mock_coll.find_one.return_value = None  # user doesn't exist for register
        mock_get_coll.return_value = mock_coll

        res = self.client.post('/api/auth/otp/send/', {
            'email': 'newuser@demo.com',
            'purpose': 'register'
        }, format='json')

        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['success'])
        self.assertIn('dev_otp', res.data)
        mock_coll.insert_one.assert_called_once()

    @patch('customers.views.get_collection')
    def test_verify_otp_success(self, mock_get_coll):
        from datetime import datetime, timezone, timedelta
        mock_coll = MagicMock()
        now = datetime.now(timezone.utc)
        mock_coll.find_one.return_value = {
            'email': 'user@demo.com',
            'otp': '123456',
            'purpose': 'register',
            'expires_at': (now + timedelta(minutes=10)).isoformat(),
            '_id': 'mock_id'
        }
        mock_get_coll.return_value = mock_coll

        res = self.client.post('/api/auth/otp/verify/', {
            'email': 'user@demo.com',
            'otp': '123456',
            'purpose': 'register'
        }, format='json')

        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['success'])

    @patch('customers.views.get_collection')
    def test_login_with_otp_success(self, mock_get_coll):
        from datetime import datetime, timezone, timedelta
        mock_coll = MagicMock()
        now = datetime.now(timezone.utc)

        def mock_find_one(query, *args, **kwargs):
            if 'otp' in str(query) or 'purpose' in str(query):
                return {
                    'email': 'farmer@demo.com',
                    'otp': '654321',
                    'purpose': 'login',
                    'expires_at': (now + timedelta(minutes=10)).isoformat(),
                    '_id': 'mock_id'
                }
            return {
                'customer_id': 'CUST_123',
                'email': 'farmer@demo.com',
                'name': 'Ramesh Kumar',
            }

        mock_coll.find_one.side_effect = mock_find_one
        mock_get_coll.return_value = mock_coll

        res = self.client.post('/api/auth/login-otp/', {
            'email': 'farmer@demo.com',
            'otp': '654321'
        }, format='json')

        self.assertEqual(res.status_code, 200)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])
        self.assertEqual(res.data['customer']['email'], 'farmer@demo.com')

    @patch('utils.auth.get_collection')
    def test_profile_with_jwt(self, mock_get_coll):
        customer = {
            'customer_id': 'CUST_123',
            'email': 'test@demo.com',
            'name': 'Test User',
            'segment': 'prudent_savers',
        }
        mock_coll = MagicMock()
        mock_coll.find_one.return_value = customer
        mock_get_coll.return_value = mock_coll

        tokens = get_tokens_for_customer(customer)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

        res = self.client.get('/api/auth/profile/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['customer_id'], 'CUST_123')
        self.assertEqual(res.data['name'], 'Test User')

    @patch('utils.auth.get_collection')
    @patch('customers.views.get_collection')
    def test_get_customer_detail(self, mock_views_coll, mock_auth_coll):
        customer = {
            'customer_id': 'CUST_001',
            'name': 'Ramesh Kumar',
            'language': 'hi',
            'segment': 'seasonal_earners'
        }
        mock_auth_coll.return_value.find_one.return_value = customer
        mock_views_coll.return_value.find_one.return_value = customer

        tokens = get_tokens_for_customer(customer)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

        res = self.client.get('/api/customers/CUST_001/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['customer_id'], 'CUST_001')
        self.assertEqual(res.data['name'], 'Ramesh Kumar')

    @patch('utils.auth.get_collection')
    @patch('customers.views.get_collection')
    def test_update_customer(self, mock_views_coll, mock_auth_coll):
        customer = {
            'customer_id': 'CUST_001',
            'name': 'Ramesh Kumar',
            'language': 'hi',
            'segment': 'seasonal_earners'
        }
        updated_customer = {**customer, 'language': 'ta'}
        mock_auth_coll.return_value.find_one.return_value = customer
        mock_views = MagicMock()
        mock_views.update_one.return_value.matched_count = 1
        mock_views.find_one.return_value = updated_customer
        mock_views_coll.return_value = mock_views

        tokens = get_tokens_for_customer(customer)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

        res = self.client.put('/api/customers/CUST_001/', {'language': 'ta'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['language'], 'ta')

    @patch('utils.auth.get_collection')
    @patch('customers.views.get_collection')
    def test_get_customer_segment(self, mock_views_coll, mock_auth_coll):
        customer = {
            'customer_id': 'CUST_001',
            'segment': 'seasonal_earners'
        }
        mock_auth_coll.return_value.find_one.return_value = customer
        mock_views_coll.return_value.find_one.return_value = customer

        tokens = get_tokens_for_customer(customer)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

        res = self.client.get('/api/customers/CUST_001/segment/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['segment'], 'seasonal_earners')
        self.assertIn('Seasonal Earners', res.data['name'])
        self.assertTrue(len(res.data['description']) > 0)
