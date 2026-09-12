"""
Transaction views: List, Insights, Spending Categories.
All aggregations computed directly in MongoDB.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from utils.mongodb_helper import get_collection
from utils.auth import ensure_customer_access


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_list(request):
    """
    GET /api/transactions/?customer_id=X&from=Y&to=Z&page=1&page_size=20
    Paginated transaction history.
    """
    customer_id = request.query_params.get('customer_id') or request.user.customer_id
    ensure_customer_access(request, customer_id)
    from_date = request.query_params.get('from')
    to_date = request.query_params.get('to')

    query = {'customer_id': customer_id}
    if from_date or to_date:
        query['date'] = {}
        if from_date:
            query['date']['$gte'] = from_date
        if to_date:
            query['date']['$lte'] = to_date

    try:
        page = max(1, int(request.query_params.get('page', 1)))
        page_size = min(100, max(1, int(request.query_params.get('page_size', 20))))
    except ValueError:
        page, page_size = 1, 20

    skip = (page - 1) * page_size
    col = get_collection('transactions')

    total = col.count_documents(query)
    cursor = col.find(query, {'_id': 0}).sort('date', -1).skip(skip).limit(page_size)
    results = list(cursor)

    return Response({
        'count': total,
        'page': page,
        'page_size': page_size,
        'results': results
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_insights(request, customer_id):
    """
    GET /api/transactions/insights/{customer_id}/
    Aggregates monthly spend, category breakdown, savings rate, and income trend in Mongo.
    """
    ensure_customer_access(request, customer_id)
    col = get_collection('transactions')

    pipeline = [
        {'$match': {'customer_id': customer_id}},
        {
            '$facet': {
                'monthly_spend': [
                    {'$match': {'type': 'debit'}},
                    {
                        '$group': {
                            '_id': {'$substr': [{'$toString': '$date'}, 0, 7]},
                            'amount': {'$sum': '$amount'}
                        }
                    },
                    {'$sort': {'_id': 1}},
                    {'$project': {'month': '$_id', 'amount': '$amount', '_id': 0}}
                ],
                'totals': [
                    {
                        '$group': {
                            '_id': '$type',
                            'total': {'$sum': '$amount'}
                        }
                    }
                ],
                'category_spend': [
                    {'$match': {'type': 'debit'}},
                    {
                        '$group': {
                            '_id': '$category',
                            'amount': {'$sum': '$amount'}
                        }
                    }
                ],
                'monthly_income': [
                    {'$match': {'type': 'credit'}},
                    {
                        '$group': {
                            '_id': {'$substr': [{'$toString': '$date'}, 0, 7]},
                            'amount': {'$sum': '$amount'}
                        }
                    },
                    {'$sort': {'_id': 1}}
                ]
            }
        }
    ]

    agg_result = list(col.aggregate(pipeline))
    data = agg_result[0] if agg_result else {}

    # Category breakdown ratios
    category_spend = data.get('category_spend', [])
    total_debit = sum(c['amount'] for c in category_spend)
    category_breakdown = {
        c['_id']: round(c['amount'] / total_debit, 4)
        for c in category_spend if c.get('_id')
    } if total_debit > 0 else {}

    # Savings rate = (credits - debits) / credits
    totals = {t['_id']: t['total'] for t in data.get('totals', [])}
    credits = totals.get('credit', 0)
    debits = totals.get('debit', 0)
    savings_rate = round((credits - debits) / credits, 4) if credits > 0 else 0.0

    # Income trend: compare recent 2 months
    monthly_income = data.get('monthly_income', [])
    if len(monthly_income) >= 2:
        last = monthly_income[-1]['amount']
        prev = monthly_income[-2]['amount']
        if prev > 0 and last >= prev * 1.05:
            income_trend = 'growing'
        elif prev > 0 and last <= prev * 0.95:
            income_trend = 'declining'
        else:
            income_trend = 'stable'
    else:
        income_trend = 'stable'

    monthly_spend = [
        {'month': m.get('month', m.get('_id')), 'amount': round(m.get('amount', 0), 2)}
        for m in data.get('monthly_spend', [])
    ]

    return Response({
        'monthly_spend': monthly_spend,
        'category_breakdown': category_breakdown,
        'savings_rate': max(0.0, savings_rate),
        'income_trend': income_trend
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spending_categories(request, customer_id):
    """
    GET /api/transactions/spending-categories/{customer_id}/
    Returns debit ratios by category via Mongo pipeline.
    """
    ensure_customer_access(request, customer_id)
    col = get_collection('transactions')

    pipeline = [
        {'$match': {'customer_id': customer_id, 'type': 'debit'}},
        {
            '$group': {
                '_id': '$category',
                'amount': {'$sum': '$amount'}
            }
        },
        {'$sort': {'amount': -1}}
    ]

    results = list(col.aggregate(pipeline))
    total_spend = sum(r['amount'] for r in results)

    categories = {
        r['_id']: round(r['amount'] / total_spend, 4)
        for r in results if r.get('_id')
    } if total_spend > 0 else {}

    return Response({
        'customer_id': customer_id,
        'total_spend': round(total_spend, 2),
        'category_breakdown': categories
    })
