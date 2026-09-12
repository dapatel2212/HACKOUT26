from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from utils.mongodb_helper import get_collection
from utils.audit import log_decision
from banking_ai.ml_registry import customer_features_for_customer, predict_stress, stress_model_source
from utils.auth import ensure_customer_access
from utils.constants import STRESS_THRESHOLDS

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stress_status(request, customer_id):
    """
    GET /api/stress/status/{customer_id}/
    Returns current financial stress level, score, and mock contributing factors.
    """
    ensure_customer_access(request, customer_id)
    cust_col = get_collection('customers')
    customer = cust_col.find_one({'customer_id': customer_id})
    
    if not customer:
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

    features = customer_features_for_customer(customer)
    score = predict_stress(features)
    
    if score <= STRESS_THRESHOLDS['GREEN']:
        level = 'GREEN'
        message = 'Healthy financial status.'
    elif score <= STRESS_THRESHOLDS['YELLOW']:
        level = 'YELLOW'
        message = 'Mild financial stress detected.'
    elif score <= STRESS_THRESHOLDS['ORANGE']:
        level = 'ORANGE'
        message = 'High financial stress detected. Pausing credit offers.'
    else:
        level = 'RED'
        message = 'Severe financial stress. Immediate debt restructuring recommended.'

    # Update the DB if it wasn't set correctly
    if customer.get('stress_level') != level:
        cust_col.update_one(
            {'customer_id': customer_id},
            {'$set': {'stress_level': level, 'updated_at': datetime.now(timezone.utc).isoformat()}}
        )

    log_decision(customer_id, 'stress_evaluated', {
        'score': score,
        'level': level
    })

    return Response({
        'customer_id': customer_id,
        'stress_score': score,
        'stress_level': level,
        'model_source': stress_model_source(),
        'message': message,
        'factors': [
            {'indicator': 'Recent EMI Bounces', 'impact': '+15' if score > 50 else '0'},
            {'indicator': 'Income Stability', 'impact': '-10' if score < 30 else '+5'}
        ],
        'last_evaluated': datetime.now(timezone.utc).isoformat()
    })
