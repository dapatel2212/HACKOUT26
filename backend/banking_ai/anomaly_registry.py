"""BankBuddy-native transaction anomaly model registry."""
from __future__ import annotations

import hashlib
import json
import math
from datetime import datetime
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ARTIFACT_DIR = PROJECT_ROOT / "ML" / "engine3" / "artifacts" / "engine3_risk"
MODEL_PATH = ARTIFACT_DIR / "bankbuddy_isolation_forest.pkl"
SCALER_PATH = ARTIFACT_DIR / "bankbuddy_anomaly_scaler.pkl"
CONFIG_PATH = ARTIFACT_DIR / "bankbuddy_anomaly_config.json"

FEATURE_COLUMNS = [
    "amount_log",
    "hour_sin",
    "hour_cos",
    "weekday_sin",
    "weekday_cos",
    "debit_flag",
    "bounce_flag",
    "balance_after_log",
    "amount_income_ratio",
    "extreme_amount_flag",
    "category_hash",
    "channel_hash",
    "unknown_channel_flag",
    "emi_flag",
]


class RobustFeatureScaler:
    """Small dependency-free RobustScaler-compatible transformer."""

    def fit(self, rows):
        values = np.asarray(rows, dtype=float)
        self.center_ = np.median(values, axis=0)
        q1 = np.percentile(values, 25, axis=0)
        q3 = np.percentile(values, 75, axis=0)
        self.scale_ = np.where((q3 - q1) == 0, 1.0, q3 - q1)
        self.n_features_in_ = values.shape[1]
        return self

    def transform(self, rows):
        return (np.asarray(rows, dtype=float) - self.center_) / self.scale_


class _IsolationTree:
    def __init__(self, leaf_size=32, max_depth=12, rng=None):
        self.leaf_size = leaf_size
        self.max_depth = max_depth
        self.rng = rng or np.random.default_rng(42)

    def fit(self, rows, depth=0):
        self.size = len(rows)
        self.left = None
        self.right = None
        self.feature = None
        self.split = None
        if self.size <= self.leaf_size or depth >= self.max_depth:
            return self

        candidates = np.flatnonzero(np.ptp(rows, axis=0) > 0)
        if len(candidates) == 0:
            return self
        self.feature = int(self.rng.choice(candidates))
        low, high = rows[:, self.feature].min(), rows[:, self.feature].max()
        self.split = float(self.rng.uniform(low, high))
        left_mask = rows[:, self.feature] < self.split
        if not left_mask.any() or left_mask.all():
            self.feature = None
            self.split = None
            return self
        self.left = _IsolationTree(self.leaf_size, self.max_depth, self.rng).fit(rows[left_mask], depth + 1)
        self.right = _IsolationTree(self.leaf_size, self.max_depth, self.rng).fit(rows[~left_mask], depth + 1)
        return self

    def path_length(self, row, depth=0):
        if self.feature is None:
            return depth + _average_path_length(self.size)
        branch = self.left if row[self.feature] < self.split else self.right
        return branch.path_length(row, depth + 1)


class PurePythonIsolationForest:
    """Isolation Forest scorer used when scikit-learn DLLs are unavailable."""

    def __init__(self, n_estimators=200, max_samples=256, random_state=42, leaf_size=32):
        self.n_estimators = n_estimators
        self.max_samples = max_samples
        self.random_state = random_state
        self.leaf_size = leaf_size

    def fit(self, rows):
        values = np.asarray(rows, dtype=float)
        sample_size = min(len(values), self.max_samples)
        max_depth = int(np.ceil(np.log2(max(sample_size, 2))))
        rng = np.random.default_rng(self.random_state)
        self.trees_ = []
        for _ in range(self.n_estimators):
            indices = rng.choice(len(values), size=sample_size, replace=False)
            self.trees_.append(
                _IsolationTree(self.leaf_size, max_depth, rng).fit(values[indices])
            )
        self.n_features_in_ = values.shape[1]
        return self

    def score_samples(self, rows):
        values = np.asarray(rows, dtype=float)
        average_lengths = np.array([
            np.mean([tree.path_length(row) for tree in self.trees_])
            for row in values
        ])
        normality = np.power(2.0, -average_lengths / _average_path_length(self.max_samples))
        return -(1.0 - normality)


def _average_path_length(size):
    if size <= 1:
        return 0.0
    if size == 2:
        return 1.0
    harmonic = np.log(size - 1) + 0.5772156649
    return 2 * harmonic - (2 * (size - 1) / size)


def _stable_hash(value: str) -> float:
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) / 0xFFFFFFFF


def transaction_features(transaction: dict, monthly_income: float = 25000) -> np.ndarray:
    """Convert a BankBuddy transaction into the retrained model's feature contract."""
    raw_date = transaction.get("date") or transaction.get("timestamp")
    try:
        event_date = datetime.fromisoformat(str(raw_date).replace("Z", "+00:00"))
    except (TypeError, ValueError):
        event_date = datetime(2020, 1, 1)

    amount = max(0.0, float(transaction.get("amount", 0)))
    balance_after = max(0.0, float(transaction.get("balance_after", 0)))
    income_ratio = amount / max(monthly_income, 1.0)
    channel = str(transaction.get("channel", "unknown"))
    return np.array([
        math.log1p(amount),
        math.sin(2 * math.pi * event_date.hour / 24),
        math.cos(2 * math.pi * event_date.hour / 24),
        math.sin(2 * math.pi * event_date.weekday() / 7),
        math.cos(2 * math.pi * event_date.weekday() / 7),
        float(transaction.get("type") == "debit"),
        float(transaction.get("is_bounced") or "(BOUNCED)" in str(transaction.get("description", ""))),
        math.log1p(balance_after),
        income_ratio,
        float(income_ratio >= 1.0),
        _stable_hash(str(transaction.get("category", "unknown"))),
        _stable_hash(channel),
        float(channel == "unknown"),
        float(transaction.get("is_emi", False)),
    ], dtype=float)


@lru_cache(maxsize=1)
def _load_bundle():
    if not (MODEL_PATH.exists() and SCALER_PATH.exists() and CONFIG_PATH.exists()):
        return None
    return {
        "model": joblib.load(MODEL_PATH),
        "scaler": joblib.load(SCALER_PATH),
        "config": json.loads(CONFIG_PATH.read_text(encoding="utf-8")),
    }


def score_transaction(transaction: dict, monthly_income: float = 25000) -> dict:
    bundle = _load_bundle()
    if bundle is None:
        return {"available": False, "is_anomaly": False, "anomaly_score": 0.0}

    row = transaction_features(transaction, monthly_income).reshape(1, -1)
    scaled = bundle["scaler"].transform(row)
    forest_score = float(-bundle["model"].score_samples(scaled)[0])
    domain_score = domain_anomaly_score(transaction, monthly_income)
    score = 0.02 * forest_score + 0.98 * domain_score
    threshold = float(bundle["config"]["operating_threshold"])
    return {
        "available": True,
        "is_anomaly": score >= threshold,
        "anomaly_score": score,
        "forest_score": forest_score,
        "domain_score": domain_score,
        "threshold": threshold,
    }


def score_customer_transactions(transactions: list[dict], monthly_income: float = 25000) -> dict:
    results = [score_transaction(tx, monthly_income) for tx in transactions]
    available = bool(results) and all(result["available"] for result in results)
    anomalies = sum(result["is_anomaly"] for result in results)
    return {
        "available": available,
        "anomaly_rate": anomalies / len(results) if results else 0.0,
        "anomaly_count": anomalies,
        "transaction_count": len(results),
    }


def domain_anomaly_score(transaction: dict, monthly_income: float = 25000) -> float:
    amount_ratio = max(0.0, float(transaction.get("amount", 0))) / max(monthly_income, 1.0)
    amount_signal = np.clip((amount_ratio - 0.5) / 2.0, 0.0, 1.0)
    bounce_signal = float(
        transaction.get("is_bounced")
        or "(BOUNCED)" in str(transaction.get("description", ""))
    )
    unknown_signal = float(str(transaction.get("channel", "unknown")) == "unknown")
    return float(np.clip(0.5 * amount_signal + 0.35 * bounce_signal + 0.15 * unknown_signal, 0, 1))
