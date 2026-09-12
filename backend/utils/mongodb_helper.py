"""
MongoDB connection helper. Single client, lazy init.
Falls back to mongomock if local/remote Mongo is unreachable.
"""

import logging
from pymongo import MongoClient
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError, ConnectionFailure
from django.conf import settings

logger = logging.getLogger(__name__)

_client = None
_db = None


def _init_mock_data(db):
    """Seed demo accounts into in-memory mock db so app works out of the box."""
    try:
        from data.seed_demo_accounts import DEMO_CUSTOMERS
        from data.generate_synthetic import generate_transactions_for_customer
        from django.contrib.auth.hashers import make_password
        from datetime import datetime, timezone

        now = datetime.now(timezone.utc).isoformat()
        demo_pw = make_password('Demo@123')
        prepared = []
        for d in DEMO_CUSTOMERS:
            item = {**d, 'password': demo_pw, 'created_at': now, 'updated_at': now}
            prepared.append(item)

        db.customers.insert_many(prepared)
        for cust in prepared:
            txs = generate_transactions_for_customer(cust, days=180)
            if txs:
                db.transactions.insert_many(txs)
    except Exception as e:
        logger.warning(f"Failed to seed mock mongo: {e}")


def get_client():
    global _client
    if _client is None:
        try:
            client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
            client.admin.command('ping')
            _client = client
        except (ServerSelectionTimeoutError, ConnectionFailure, PyMongoError):
            try:
                import mongomock
                logger.warning("MongoDB unreachable. Falling back to in-memory mongomock with seeded demo accounts.")
                _client = mongomock.MongoClient()
                _init_mock_data(_client[settings.MONGODB_NAME])
            except ImportError as err:
                raise err
    return _client


def get_db():
    global _db
    if _db is None:
        _db = get_client()[settings.MONGODB_NAME]
    return _db


def get_collection(name):
    return get_db()[name]
