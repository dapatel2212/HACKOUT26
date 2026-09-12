"""
Customer views: Auth endpoints and profile.
Uses MongoDB directly via pymongo.
"""

import uuid
from datetime import datetime, timezone

from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from utils.mongodb_helper import get_collection
from utils.auth import get_tokens_for_customer
from utils.auth import ensure_customer_access


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/auth/register/
    Create customer in MongoDB and return JWT tokens.
    """
    data = request.data
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    name = data.get('name', '').strip()

    if not (email or phone) or not password:
        return Response(
            {'error': 'Email or phone and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    customers_col = get_collection('customers')

    query = []
    if email:
        query.append({'email': email})
    if phone:
        query.append({'phone': phone})
    if customers_col.find_one({'$or': query}):
        return Response(
            {'error': 'Customer with this email or phone already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    now = datetime.now(timezone.utc).isoformat()
    customer_id = f"CUST_{uuid.uuid4().hex[:8].upper()}"

    new_customer = {
        'customer_id': customer_id,
        'name': name or 'Customer',
        'email': email,
        'phone': phone,
        'password': make_password(password),
        'language': data.get('language', 'hi'),
        'tier': data.get('tier', 3),
        'segment': data.get('segment', 'prudent_savers'),
        'income_monthly': data.get('income_monthly', 25000),
        'existing_products': ['savings_account'],
        'stress_score': 0,
        'stress_level': 'GREEN',
        'wellness_score': 50,
        'consent': {
            'transaction_analysis': True,
            'health_monitoring': True,
            'ai_chat': True,
            'life_events': False,
            'marketing': False,
        },
        'created_at': now,
        'updated_at': now,
    }

    customers_col.insert_one(new_customer)

    # Clean response
    customer_profile = {k: v for k, v in new_customer.items() if k not in ('_id', 'password')}
    tokens = get_tokens_for_customer(new_customer)

    return Response(
        {
            'tokens': tokens,
            'customer': customer_profile
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    POST /api/auth/login/
    Verify password and return JWT tokens.
    Accepts email or phone in 'email', 'phone', or 'username'.
    """
    data = request.data
    identifier = data.get('email') or data.get('phone') or data.get('username') or ''
    identifier = identifier.strip()
    password = data.get('password', '')

    if not identifier or not password:
        return Response(
            {'error': 'Identifier (email/phone) and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    customers_col = get_collection('customers')
    customer = customers_col.find_one({
        '$or': [
            {'email': identifier.lower()},
            {'phone': identifier}
        ]
    })

    if not customer or not check_password(password, customer.get('password', '')):
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    customer_profile = {k: v for k, v in customer.items() if k not in ('_id', 'password')}
    tokens = get_tokens_for_customer(customer)

    return Response({
        'tokens': tokens,
        'customer': customer_profile
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh(request):
    """
    POST /api/auth/token/refresh/
    Refresh simplejwt access token.
    """
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response(
            {'error': 'Refresh token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        token = RefreshToken(refresh_token)
        return Response({
            'access': str(token.access_token)
        })
    except Exception:
        return Response(
            {'error': 'Invalid or expired refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    GET /api/auth/profile/
    Return current authenticated customer profile.
    """
    return Response(request.user.data)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def customer_detail(request, customer_id):
    """
    GET /api/customers/{id}/ — full profile from MongoDB
    PUT /api/customers/{id}/ — update language, preferences
    """
    customers_col = get_collection('customers')
    ensure_customer_access(request, customer_id)

    if request.method == 'GET':
        customer = customers_col.find_one(
            {'customer_id': customer_id},
            {'_id': 0, 'password': 0}
        )
        if not customer:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(customer)

    elif request.method == 'PUT':
        update_data = {k: v for k, v in request.data.items() if k not in ('_id', 'password', 'customer_id')}
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()

        res = customers_col.update_one(
            {'customer_id': customer_id},
            {'$set': update_data}
        )
        if res.matched_count == 0:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

        updated = customers_col.find_one(
            {'customer_id': customer_id},
            {'_id': 0, 'password': 0}
        )
        return Response(updated)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_segment(request, customer_id):
    """
    GET /api/customers/{id}/segment/ — current segment + description text
    """
    from utils.constants import SEGMENT_NAMES, SEGMENT_DESCRIPTIONS
    ensure_customer_access(request, customer_id)

    customer = get_collection('customers').find_one(
        {'customer_id': customer_id},
        {'_id': 0, 'segment': 1, 'customer_id': 1}
    )
    if not customer:
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

    segment_key = customer.get('segment', 'prudent_savers')
    return Response({
        'customer_id': customer_id,
        'segment': segment_key,
        'name': SEGMENT_NAMES.get(segment_key, segment_key.replace('_', ' ').title()),
        'description': SEGMENT_DESCRIPTIONS.get(segment_key, '')
    })
