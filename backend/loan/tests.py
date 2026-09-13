from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken


class LoanEndpointsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer_id = 'CUST_DEMO_001'
        token = AccessToken()
        token['customer_id'] = self.customer_id
        token['email'] = 'farmer@demo.com'
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    @patch('utils.auth.get_collection')
    @patch('loan.views.get_collection')
    @patch('loan.views.predict_stress')
    def test_loan_eligibility_success(self, mock_predict, mock_views_coll, mock_auth_coll):
        mock_auth_coll.return_value.find_one.return_value = {'customer_id': self.customer_id}
        mock_views_coll.return_value.find_one.return_value = {'customer_id': self.customer_id, 'income_monthly': 30000}
        mock_predict.return_value = 22.50

        response = self.client.get(f'/api/loan/eligibility/{self.customer_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('is_eligible'))
        self.assertEqual(response.data.get('pre_approved_amount'), 120000)

    @patch('utils.auth.get_collection')
    def test_emi_calculate(self, mock_auth_coll):
        mock_auth_coll.return_value.find_one.return_value = {'customer_id': self.customer_id}
        response = self.client.post('/api/loan/emi-calculate/', {
            'amount': 50000,
            'tenure_months': 12,
            'interest_rate': 11.5
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('monthly_emi', response.data)
        self.assertIn('total_payable', response.data)

    @patch('utils.auth.get_collection')
    @patch('loan.views.get_collection')
    def test_customer_loans_history(self, mock_views_coll, mock_auth_coll):
        mock_auth_coll.return_value.find_one.return_value = {'customer_id': self.customer_id}
        mock_views_coll.return_value.find.return_value.sort.return_value = []

        response = self.client.get(f'/api/loan/my-loans/{self.customer_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('loans', response.data)
        loans = response.data['loans']
        self.assertGreater(len(loans), 0)
        # Check that statuses are normalized to ACCEPTED, PENDING, or REJECTED
        for loan in loans:
            self.assertIn(loan['status'], ['ACCEPTED', 'PENDING', 'REJECTED'])
