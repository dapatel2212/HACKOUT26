"""
Loan endpoints: Eligibility check with ethical guardrails,
EMI calculation, and application submission.
"""

import uuid
from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from utils.mongodb_helper import get_collection
from utils.audit import log_decision
from utils.constants import STRESS_LOAN_BLOCK_THRESHOLD
from utils.auth import ensure_customer_access
from banking_ai.ml_registry import customer_features_for_customer, predict_stress


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def loan_eligibility(request, customer_id):
    """
    GET /api/loan/eligibility/{customer_id}/
    Ethical check: blocks if stress_score > 50.
    """
    ensure_customer_access(request, customer_id)
    cust = get_collection('customers').find_one({'customer_id': customer_id})
    if not cust:
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

    stress_score = predict_stress(customer_features_for_customer(cust))
    get_collection('customers').update_one(
        {'customer_id': customer_id},
        {'$set': {'stress_score': stress_score}}
    )
    income = cust.get('income_monthly', 25000)

    if stress_score > STRESS_LOAN_BLOCK_THRESHOLD:
        return Response({
            'customer_id': customer_id,
            'is_eligible': False,
            'reason': 'Responsible Lending Lock: Financial stress score exceeds safety threshold.',
            'stress_score': stress_score,
            'alternative_offered': 'emi_restructure'
        })

    max_amount = min(200000, income * 4)

    return Response({
        'customer_id': customer_id,
        'is_eligible': True,
        'pre_approved_amount': max_amount,
        'interest_rate': 11.5,
        'max_tenure_months': 36
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def emi_calculate(request):
    """
    POST /api/loan/emi-calculate/
    Formula: P * r * (1+r)^n / ((1+r)^n - 1)
    """
    data = request.data
    try:
        amount = float(data.get('amount', 50000))
        tenure = int(data.get('tenure_months', 12))
        annual_rate = float(data.get('interest_rate', 11.5))
    except (TypeError, ValueError):
        return Response({'error': 'amount, tenure_months, and interest_rate must be numeric'}, status=status.HTTP_400_BAD_REQUEST)
    if amount <= 0 or tenure <= 0 or annual_rate < 0:
        return Response({'error': 'Loan amount and tenure must be positive; interest rate cannot be negative'}, status=status.HTTP_400_BAD_REQUEST)

    monthly_rate = annual_rate / (12 * 100)
    pow_val = (1 + monthly_rate) ** tenure
    emi = (amount * monthly_rate * pow_val) / (pow_val - 1)

    total_payment = emi * tenure
    total_interest = total_payment - amount

    return Response({
        'amount': amount,
        'tenure_months': tenure,
        'interest_rate': annual_rate,
        'monthly_emi': round(emi, 2),
        'total_interest': round(total_interest, 2),
        'total_payable': round(total_payment, 2)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def loan_apply(request):
    """
    POST /api/loan/apply/
    Submits loan application with guardrail check.
    """
    data = request.data
    customer_id = data.get('customer_id') or request.user.customer_id
    ensure_customer_access(request, customer_id)
    try:
        amount = float(data.get('amount', 50000))
        tenure = int(data.get('tenure_months', 12))
    except (TypeError, ValueError):
        return Response({'error': 'amount and tenure_months must be numeric'}, status=status.HTTP_400_BAD_REQUEST)
    if amount <= 0 or tenure <= 0:
        return Response({'error': 'Loan amount and tenure must be positive'}, status=status.HTTP_400_BAD_REQUEST)

    cust = get_collection('customers').find_one({'customer_id': customer_id})
    if cust:
        stress_score = predict_stress(customer_features_for_customer(cust))
    else:
        # New customer with no data — default to 0 stress (no blocking)
        stress_score = 0
    if stress_score > STRESS_LOAN_BLOCK_THRESHOLD:
        app_id = f"LN_{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc).isoformat()
        rejected_doc = {
            'application_id': app_id,
            'customer_id': customer_id,
            'product_name': data.get('product_name', 'Personal Loan'),
            'amount': amount,
            'tenure_months': tenure,
            'monthly_emi': round((amount * 0.00958 * (1.00958**tenure)) / ((1.00958**tenure) - 1), 2) if tenure > 0 else 0,
            'status': 'REJECTED',
            'rejection_reason': 'Ethical AI Guardrail: Financial stress score exceeds safety threshold.',
            'stress_score': stress_score,
            'created_at': now
        }
        get_collection('loans').insert_one(rejected_doc)
        log_decision(customer_id, 'loan_application_blocked_guardrail', {'stress_score': stress_score})
        return Response({
            'error': 'Application blocked by ethical AI guardrail due to elevated financial stress.'
        }, status=status.HTTP_403_FORBIDDEN)

    app_id = f"LN_{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()

    loan_doc = {
        'application_id': app_id,
        'customer_id': customer_id,
        'product_name': data.get('product_name', 'Personal Loan'),
        'amount': amount,
        'tenure_months': tenure,
        'monthly_emi': round((amount * 0.00958 * (1.00958**tenure)) / ((1.00958**tenure) - 1), 2) if tenure > 0 else 0,
        'status': 'PENDING',
        'stress_score': stress_score,
        'created_at': now
    }
    get_collection('loans').insert_one(loan_doc)
    log_decision(customer_id, 'loan_submitted', {'application_id': app_id, 'amount': amount})

    loan_doc.pop('_id', None)
    return Response(loan_doc, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def loan_status(request, application_id):
    loan = get_collection('loans').find_one({'application_id': application_id}, {'_id': 0})
    if not loan:
        return Response({'error': 'Loan application not found'}, status=status.HTTP_404_NOT_FOUND)
    ensure_customer_access(request, loan.get('customer_id'))
    return Response(loan)


DEFAULT_DEMO_LOANS = {
    'CUST_DEMO_001': [
        {
            'application_id': 'LN_KCC_8810',
            'customer_id': 'CUST_DEMO_001',
            'product_name': 'Kisan Crop Credit Loan',
            'amount': 75000,
            'tenure_months': 12,
            'monthly_emi': 6640,
            'status': 'ACCEPTED',
            'created_at': '2026-01-15T10:00:00Z',
            'category': 'Agriculture'
        },
        {
            'application_id': 'LN_EQ_9921',
            'customer_id': 'CUST_DEMO_001',
            'product_name': 'Solar Pump & Equipment Loan',
            'amount': 50000,
            'tenure_months': 24,
            'monthly_emi': 2340,
            'status': 'ACCEPTED',
            'created_at': '2026-05-02T14:30:00Z',
            'category': 'Equipment'
        }
    ],
    'CUST_DEMO_002': [
        {
            'application_id': 'LN_PL_4420',
            'customer_id': 'CUST_DEMO_002',
            'product_name': 'Pre-Approved Personal Loan',
            'amount': 150000,
            'tenure_months': 36,
            'monthly_emi': 4950,
            'status': 'ACCEPTED',
            'created_at': '2025-11-10T09:15:00Z',
            'category': 'Personal'
        },
        {
            'application_id': 'LN_VL_3104',
            'customer_id': 'CUST_DEMO_002',
            'product_name': 'Electric Vehicle Loan',
            'amount': 80000,
            'tenure_months': 24,
            'monthly_emi': 3740,
            'status': 'ACCEPTED',
            'created_at': '2026-02-18T11:45:00Z',
            'category': 'Vehicle'
        }
    ],
    'CUST_DEMO_003': [
        {
            'application_id': 'LN_WC_7712',
            'customer_id': 'CUST_DEMO_003',
            'product_name': 'Working Capital Merchant Overdraft',
            'amount': 100000,
            'tenure_months': 12,
            'monthly_emi': 8850,
            'status': 'ACCEPTED',
            'created_at': '2026-03-04T16:20:00Z',
            'category': 'Business'
        },
        {
            'application_id': 'LN_EM_5091',
            'customer_id': 'CUST_DEMO_003',
            'product_name': 'Inventory Expansion Loan',
            'amount': 60000,
            'tenure_months': 18,
            'monthly_emi': 3640,
            'status': 'PENDING',
            'created_at': '2026-08-20T13:10:00Z',
            'category': 'Business'
        }
    ],
    'CUST_DEMO_004': [
        {
            'application_id': 'LN_TW_6615',
            'customer_id': 'CUST_DEMO_004',
            'product_name': 'Two-Wheeler Vehicle Loan',
            'amount': 45000,
            'tenure_months': 12,
            'monthly_emi': 3980,
            'status': 'ACCEPTED',
            'created_at': '2025-12-12T08:30:00Z',
            'category': 'Vehicle'
        },
        {
            'application_id': 'LN_MB_2209',
            'customer_id': 'CUST_DEMO_004',
            'product_name': 'Instant Micro-Credit',
            'amount': 15000,
            'tenure_months': 6,
            'monthly_emi': 2580,
            'status': 'PENDING',
            'created_at': '2026-07-01T15:00:00Z',
            'category': 'Microfinance'
        }
    ],
    'CUST_DEMO_005': [
        {
            'application_id': 'LN_ST_1102',
            'customer_id': 'CUST_DEMO_005',
            'product_name': 'Emergency Household Loan',
            'amount': 30000,
            'tenure_months': 12,
            'monthly_emi': 2650,
            'status': 'ACCEPTED',
            'created_at': '2026-04-14T10:30:00Z',
            'category': 'Personal'
        },
        {
            'application_id': 'LN_AP_9043',
            'customer_id': 'CUST_DEMO_005',
            'product_name': 'Additional Personal Credit',
            'amount': 50000,
            'tenure_months': 24,
            'monthly_emi': 2340,
            'status': 'REJECTED',
            'rejection_reason': 'Ethical AI Guardrail: Stress score 72.00 exceeds threshold (50)',
            'created_at': '2026-09-05T17:40:00Z',
            'category': 'Personal'
        }
    ]
}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_loans(request, customer_id):
    """
    GET /api/loan/my-loans/{customer_id}/
    Returns list of loan applications and historical loans for the customer.
    """
    ensure_customer_access(request, customer_id)
    db_loans = list(get_collection('loans').find({'customer_id': customer_id}, {'_id': 0}).sort('created_at', -1))
    
    defaults = DEFAULT_DEMO_LOANS.get(customer_id, [])
    db_app_ids = {l['application_id'] for l in db_loans if 'application_id' in l}
    combined = db_loans + [d for d in defaults if d['application_id'] not in db_app_ids]
    
    for loan in combined:
        if loan.get('status') == 'PENDING_REVIEW':
            loan['status'] = 'PENDING'
        elif loan.get('status') == 'APPROVED':
            loan['status'] = 'ACCEPTED'

    return Response({'customer_id': customer_id, 'loans': combined})

