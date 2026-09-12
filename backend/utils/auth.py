"""
JWT Authentication for MongoDB.
No Django User model used.
"""

from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from utils.mongodb_helper import get_collection


class MongoUser:
    """Minimal user adapter for DRF request.user."""
    def __init__(self, data):
        self.data = data
        self.customer_id = data.get('customer_id')
        self.email = data.get('email')
        self.is_authenticated = True

    def __getitem__(self, key):
        return self.data.get(key)

    def get(self, key, default=None):
        return self.data.get(key, default)


class MongoJWTAuthentication(BaseAuthentication):
    """Authenticates Bearer token and attaches MongoUser to request."""
    def authenticate(self, request):
        auth = get_authorization_header(request).split()
        if not auth or auth[0].lower() != b'bearer':
            return None

        if len(auth) != 2:
            raise AuthenticationFailed('Invalid Authorization header')

        raw_token = auth[1].decode('utf-8')
        try:
            token = AccessToken(raw_token)
            customer_id = token.get('customer_id')
            if not customer_id:
                raise AuthenticationFailed('Token missing customer_id')

            customer = get_collection('customers').find_one(
                {'customer_id': customer_id},
                {'_id': 0, 'password': 0}
            )
            if not customer:
                raise AuthenticationFailed('Customer not found')

            return (MongoUser(customer), token)
        except Exception as e:
            raise AuthenticationFailed(str(e))


def get_tokens_for_customer(customer):
    """Generate access and refresh tokens with custom claims."""
    refresh = RefreshToken()
    refresh['customer_id'] = customer['customer_id']
    refresh['email'] = customer.get('email', '')
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def ensure_customer_access(request, customer_id):
    """Prevent an authenticated customer from accessing another customer's data."""
    if request.user.customer_id != customer_id:
        raise PermissionDenied('You may only access your own customer data.')
    return request.user.customer_id
