"""
Consent views (DPDP Act 2023 compliant).
Granular consent management, audit trail logging, and data export.
"""

from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from utils.mongodb_helper import get_collection
from utils.audit import log_decision
from utils.auth import ensure_customer_access


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_consent(request, customer_id):
    ensure_customer_access(request, customer_id)
    cust = get_collection('customers').find_one({'customer_id': customer_id})
    if not cust:
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({
        'customer_id': customer_id,
        'consent': cust.get('consent', {})
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def grant_consent(request, customer_id):
    ensure_customer_access(request, customer_id)
    data_type = request.data.get('data_type')
    if not data_type:
        return Response({'error': 'data_type is required'}, status=status.HTTP_400_BAD_REQUEST)

    get_collection('customers').update_one(
        {'customer_id': customer_id},
        {'$set': {f'consent.{data_type}': True, 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )

    get_collection('consent_logs').insert_one({
        'customer_id': customer_id,
        'data_type': data_type,
        'action': 'grant',
        'timestamp': datetime.now(timezone.utc).isoformat()
    })

    log_decision(customer_id, 'consent_granted', {'data_type': data_type})
    return Response({'status': 'granted', 'data_type': data_type})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revoke_consent(request, customer_id):
    ensure_customer_access(request, customer_id)
    data_type = request.data.get('data_type')
    if not data_type:
        return Response({'error': 'data_type is required'}, status=status.HTTP_400_BAD_REQUEST)

    get_collection('customers').update_one(
        {'customer_id': customer_id},
        {'$set': {f'consent.{data_type}': False, 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )

    get_collection('consent_logs').insert_one({
        'customer_id': customer_id,
        'data_type': data_type,
        'action': 'revoke',
        'timestamp': datetime.now(timezone.utc).isoformat()
    })

    log_decision(customer_id, 'consent_revoked', {'data_type': data_type})
    return Response({'status': 'revoked', 'data_type': data_type})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def data_download(request):
    customer_id = request.query_params.get('customer_id') or request.user.customer_id
    ensure_customer_access(request, customer_id)
    cust = get_collection('customers').find_one({'customer_id': customer_id}, {'_id': 0, 'password': 0})
    txs = list(get_collection('transactions').find({'customer_id': customer_id}, {'_id': 0}).limit(100))
    logs = list(get_collection('consent_logs').find({'customer_id': customer_id}, {'_id': 0}))

    log_decision(customer_id, 'data_download_export', {})
    return Response({
        'profile': cust,
        'recent_transactions': txs,
        'consent_audit_history': logs,
        'exported_at': datetime.now(timezone.utc).isoformat()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_delete(request):
    customer_id = request.data.get('customer_id') or request.user.customer_id
    ensure_customer_access(request, customer_id)
    if not get_collection('customers').find_one({'customer_id': customer_id}):
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

    now = datetime.now(timezone.utc).isoformat()
    request_doc = {
        'customer_id': customer_id,
        'status': 'PENDING',
        'requested_at': now,
    }
    get_collection('deletion_requests').insert_one(request_doc)
    log_decision(customer_id, 'data_erasure_requested', {})
    return Response(request_doc, status=status.HTTP_202_ACCEPTED)
