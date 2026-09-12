"""
Audit trail logger. Every AI decision gets logged here for RBI compliance.
"""

from datetime import datetime, timezone
from utils.mongodb_helper import get_collection


def log_decision(customer_id, action_type, details=None):
    """Insert one audit record. Fire and forget."""
    get_collection('audit_trail').insert_one({
        'customer_id': customer_id,
        'action_type': action_type,
        'details': details or {},
        'timestamp': datetime.now(timezone.utc),
    })
