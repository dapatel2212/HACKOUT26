"""
Recommendation views: Segment-aware recommendations with SHAP explanations
and ethical guardrails.
"""

from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from utils.mongodb_helper import get_collection
from utils.audit import log_decision
from utils.constants import STRESS_LOAN_BLOCK_THRESHOLD
from banking_ai.ml_registry import (
    apply_ethical_gate,
    customer_features_for_customer,
    predict_segment,
    predict_stress,
    stress_model_source,
    rank_recommendations,
)
from utils.auth import ensure_customer_access

RECOMMENDATIONS_CATALOG = {
    'seasonal_earners': [
        {
            'product_id': 'weather_insurance',
            'product_name': 'Weather & Crop Insurance',
            'category': 'insurance',
            'score': 0.92,
            'match_score_pct': 92,
            'description': 'Protect your crop yield against unseasonal rainfall, drought, and temperature shocks.',
            'shap_explanation': [
                {'text': 'Seasonal crop-cycle spend pattern detected', 'contribution': '+28%', 'direction': 'positive'},
                {'text': 'Zero active insurance policies on account', 'contribution': '+22%', 'direction': 'positive'},
                {'text': 'Agricultural input purchase frequency', 'contribution': '+15%', 'direction': 'positive'}
            ]
        },
        {
            'product_id': 'kisan_credit',
            'product_name': 'Kisan Credit Card (KCC)',
            'category': 'loan',
            'score': 0.85,
            'match_score_pct': 85,
            'description': 'Subsidized 4% interest crop loan with flexible repayments tied to your harvest season.',
            'shap_explanation': [
                {'text': 'Regular fertilizer and seed merchant debits', 'contribution': '+24%', 'direction': 'positive'},
                {'text': 'Consistent seasonal repayment discipline', 'contribution': '+18%', 'direction': 'positive'}
            ]
        },
        {
            'product_id': 'fd',
            'product_name': 'Post-Harvest Fixed Deposit',
            'category': 'savings',
            'score': 0.74,
            'match_score_pct': 74,
            'description': 'Lock in surplus crop earnings at 7.4% p.a. guaranteed interest.',
            'shap_explanation': [
                {'text': 'High balance accumulation post harvest', 'contribution': '+20%', 'direction': 'positive'}
            ]
        }
    ],
    'prudent_savers': [
        {
            'product_id': 'sip',
            'product_name': 'Tax-Saver Mutual Fund SIP',
            'category': 'investment',
            'score': 0.94,
            'match_score_pct': 94,
            'description': 'Save up to ₹46,800 under Section 80C with flexible ₹500/month investments.',
            'shap_explanation': [
                {'text': 'High savings rate (>25% of salary saved)', 'contribution': '+32%', 'direction': 'positive'},
                {'text': 'Consistent salary credits on 1st of month', 'contribution': '+26%', 'direction': 'positive'},
                {'text': 'Low discretionary spend velocity', 'contribution': '+14%', 'direction': 'positive'}
            ]
        },
        {
            'product_id': 'health_insurance',
            'product_name': 'Comprehensive Family Health Shield',
            'category': 'insurance',
            'score': 0.88,
            'match_score_pct': 88,
            'description': 'Cashless treatment at 10,000+ hospitals across India with zero deduction on ICU charges.',
            'shap_explanation': [
                {'text': 'Regular medical/pharmacy expenditures', 'contribution': '+25%', 'direction': 'positive'},
                {'text': 'Family financial security priority', 'contribution': '+20%', 'direction': 'positive'}
            ]
        }
    ],
    'stressed_accounts': [
        {
            'product_id': 'emi_restructure',
            'product_name': 'EMI Date Shift & Restructure',
            'category': 'counseling',
            'score': 0.96,
            'match_score_pct': 96,
            'description': 'Lower your monthly payment by 30% and shift debit date to match your actual cash flow.',
            'shap_explanation': [
                {'text': 'Multiple EMI bounces detected in last 90 days', 'contribution': '+40%', 'direction': 'positive'},
                {'text': 'Declining daily balance trajectory', 'contribution': '+25%', 'direction': 'positive'}
            ]
        }
    ]
}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request, customer_id):
    ensure_customer_access(request, customer_id)
    cust = get_collection('customers').find_one({'customer_id': customer_id})
    if not cust:
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

    features = customer_features_for_customer(cust)
    segment = predict_segment(features)
    stress_score = predict_stress(features)

    # If stressed, ethical guardrail rule #1: Only restructure, ZERO loans!
    if stress_score > STRESS_LOAN_BLOCK_THRESHOLD:
        recs = RECOMMENDATIONS_CATALOG.get('stressed_accounts', [])
    else:
        recs = rank_recommendations(features, segment, stress_score)
        if not recs:
            recs = RECOMMENDATIONS_CATALOG.get(segment, RECOMMENDATIONS_CATALOG['prudent_savers'])
    gated = apply_ethical_gate(features, recs)
    recs = gated["recommendations"]

    log_decision(customer_id, 'recommendations_generated', {
        'segment': segment,
        'stress_score': stress_score,
        'count': len(recs)
    })

    return Response({
        'customer_id': customer_id,
        'segment': segment,
        'stress_score': stress_score,
        'stress_model_source': stress_model_source(),
        'recommendations': recs[:3],
        'model': 'Hackout26-Model1',
        'lstm_autoencoder_active': features['lstm_available'],
        'ethical_guardrail_active': True,
        'guardrail_band': gated['stress_band'],
        'guardrail_threshold': STRESS_LOAN_BLOCK_THRESHOLD
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_recommendation(request, pk):
    log_decision(request.user.customer_id, 'recommendation_accepted', {'product_id': pk})
    return Response({'status': 'accepted', 'product_id': pk})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_recommendation(request, pk):
    log_decision(request.user.customer_id, 'recommendation_rejected', {'product_id': pk})
    return Response({'status': 'rejected', 'product_id': pk})
