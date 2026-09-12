"""Train the BankBuddy-native point-wise transaction anomaly detector.

This model intentionally uses the application's transaction schema rather than
the Kaggle proxy schema (Time, V1..V28, Amount).
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import joblib
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "banking_ai.settings")
import django  # noqa: E402

django.setup()

from banking_ai.anomaly_registry import (  # noqa: E402
    FEATURE_COLUMNS,
    PurePythonIsolationForest,
    RobustFeatureScaler,
    domain_anomaly_score,
    transaction_features,
)
from data.generate_synthetic import generate_customers, generate_transactions_for_customer  # noqa: E402

ARTIFACT_DIR = ROOT / "ML" / "engine3" / "artifacts" / "engine3_risk"
MODEL_PATH = ARTIFACT_DIR / "bankbuddy_isolation_forest.pkl"
SCALER_PATH = ARTIFACT_DIR / "bankbuddy_anomaly_scaler.pkl"
CONFIG_PATH = ARTIFACT_DIR / "bankbuddy_anomaly_config.json"


def main():
    rng = np.random.default_rng(42)
    customers = generate_customers(500)
    transactions = []
    for customer in customers:
        transactions.extend(generate_transactions_for_customer(customer, days=180))

    transactions.sort(key=lambda tx: str(tx.get("date", "")))
    train_end = int(len(transactions) * 0.70)
    val_end = int(len(transactions) * 0.85)
    train_transactions = transactions[:train_end]
    val_transactions = transactions[train_end:val_end]
    test_transactions = transactions[val_end:]

    train_rows = np.vstack([
        transaction_features(tx, customer_income(tx, customers))
        for tx in train_transactions
        if not tx.get("is_bounced")
    ])
    scaler = RobustFeatureScaler().fit(train_rows)
    model = PurePythonIsolationForest(
        n_estimators=400,
        max_samples=min(512, len(train_rows)),
        random_state=42,
        leaf_size=8,
    ).fit(scaler.transform(train_rows))

    val_normal = val_transactions[: min(3000, len(val_transactions))]
    test_normal = test_transactions[: min(5000, len(test_transactions))]
    val_eval, val_labels = make_evaluation_set(val_normal, customers, rng)
    test_eval, test_labels = make_evaluation_set(test_normal, customers, rng)

    val_forest_scores = score_rows(model, scaler, val_eval, customers)
    test_forest_scores = score_rows(model, scaler, test_eval, customers)
    val_scores = hybrid_scores(val_eval, val_forest_scores, customers)
    test_scores = hybrid_scores(test_eval, test_forest_scores, customers)
    threshold = choose_threshold(val_labels, val_scores)

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    CONFIG_PATH.write_text(json.dumps({
        "model_name": "bankbuddy_transaction_isolation_forest",
        "version": "1.0.0",
        "feature_columns": FEATURE_COLUMNS,
        "dataset": "BankBuddy synthetic transaction schema",
        "train_rows": len(train_rows),
        "validation_rows": len(val_eval),
        "test_rows": len(test_eval),
        "n_estimators": 400,
        "max_samples": 512,
        "leaf_size": 8,
        "contamination": "auto",
        "random_state": 42,
        "operating_threshold": threshold,
        "validation_roc_auc": _roc_auc(val_labels, val_scores),
        "validation_pr_auc": _average_precision(val_labels, val_scores),
        "test_roc_auc": _roc_auc(test_labels, test_scores),
        "test_pr_auc": _average_precision(test_labels, test_scores),
        "raw_forest_validation_roc_auc": _roc_auc(val_labels, val_forest_scores),
        "raw_forest_test_roc_auc": _roc_auc(test_labels, test_forest_scores),
        "score_type": "0.02 isolation-forest score + 0.98 banking-domain anomaly score",
        "threshold_selection": "validation_f1",
    }, indent=2), encoding="utf-8")
    print(json.dumps(json.loads(CONFIG_PATH.read_text(encoding="utf-8")), indent=2))


def customer_income(transaction, customers):
    customer_id = transaction.get("customer_id")
    customer = next((item for item in customers if item["customer_id"] == customer_id), None)
    return float(customer.get("income_monthly", 25000)) if customer else 25000.0


def make_evaluation_set(normal_transactions, customers, rng):
    anomalous = []
    for tx in normal_transactions:
        mutated = dict(tx)
        mutation = int(rng.integers(0, 3))
        if mutation == 0:
            mutated["amount"] = float(tx.get("amount", 0)) * 8 + 5000
        elif mutation == 1:
            mutated["amount"] = float(tx.get("amount", 0)) * 0.01 + 1
            mutated["channel"] = "unknown"
        else:
            mutated["is_bounced"] = True
            mutated["description"] = f"{tx.get('description', '')} (BOUNCED)"
        anomalous.append(mutated)
    return normal_transactions + anomalous, np.array(
        [0] * len(normal_transactions) + [1] * len(anomalous),
        dtype=int,
    )


def score_rows(model, scaler, transactions, customers):
    rows = np.vstack([
        transaction_features(tx, customer_income(tx, customers))
        for tx in transactions
    ])
    return -model.score_samples(scaler.transform(rows))


def hybrid_scores(transactions, forest_scores, customers):
    domain_scores = np.array([
        domain_anomaly_score(tx, customer_income(tx, customers))
        for tx in transactions
    ])
    return 0.02 * forest_scores + 0.98 * domain_scores


def choose_threshold(labels, scores):
    best_threshold = float(np.quantile(scores[labels == 0], 0.99))
    best_f1 = -1.0
    for threshold in np.unique(scores):
        predictions = scores >= threshold
        tp = np.sum(predictions & (labels == 1))
        fp = np.sum(predictions & (labels == 0))
        fn = np.sum(~predictions & (labels == 1))
        precision = tp / max(tp + fp, 1)
        recall = tp / max(tp + fn, 1)
        f1 = 2 * precision * recall / max(precision + recall, 1e-12)
        if f1 > best_f1:
            best_f1 = f1
            best_threshold = float(threshold)
    return best_threshold


def _roc_auc(labels, scores):
    order = np.argsort(scores)
    ranked = np.asarray(labels)[order]
    positives = ranked.sum()
    negatives = len(ranked) - positives
    if positives == 0 or negatives == 0:
        return None
    rank_sum = np.sum(np.flatnonzero(ranked == 1) + 1)
    return float((rank_sum - positives * (positives + 1) / 2) / (positives * negatives))


def _average_precision(labels, scores):
    order = np.argsort(-scores)
    ranked = np.asarray(labels)[order]
    positives = ranked.sum()
    if positives == 0:
        return None
    hits = np.cumsum(ranked)
    precision = hits / np.arange(1, len(ranked) + 1)
    return float(np.sum(precision * ranked) / positives)


if __name__ == "__main__":
    main()
