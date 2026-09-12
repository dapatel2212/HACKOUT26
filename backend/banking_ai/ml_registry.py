"""Lazy loaders and inference adapters for the checked-in Hackout26 models."""
from __future__ import annotations

import json
import math
from functools import lru_cache
from pathlib import Path
from datetime import datetime, timedelta, timezone

import joblib
import numpy as np
from banking_ai.anomaly_registry import score_customer_transactions

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL1_ROOT = PROJECT_ROOT / "Hackout26-Model1"
ML_ROOT = PROJECT_ROOT / "ML"

SEGMENT_COLS = [
    "age", "monthly_income", "credit_score", "recency_days", "frequency_monthly",
    "monetary_monthly_spend", "spend_food", "spend_medical", "spend_emi",
    "spend_groceries", "spend_utilities", "spend_farm_input",
    "spend_entertainment", "emi_burden_ratio", "income_stability_cv",
    "savings_rate", "digital_maturity", "balance_volatility",
]
STRESS_COLS = [
    "recency_days", "frequency_monthly", "monetary_monthly_spend",
    "emi_burden_ratio", "income_stability_cv", "balance_volatility",
    "balance_min_ratio", "spending_velocity", "emi_bounce_count",
    "credit_utilization_ratio", "num_loan_inquiries",
]
SEGMENTS = {
    0: "prudent_savers", 1: "aspiring_spenders", 2: "family_builders",
    3: "digital_natives", 4: "seasonal_earners", 5: "stressed_accounts",
}


def customer_features(customer: dict) -> dict:
    income = float(customer.get("monthly_income", customer.get("income_monthly", 25000)))
    emi = float(customer.get("current_monthly_emi", customer.get("monthly_emi", 0)))
    features = {
        "age": float(customer.get("age", 30)),
        "monthly_income": income,
        "credit_score": float(customer.get("credit_score", 680)),
        "recency_days": float(customer.get("recency_days", 7)),
        "frequency_monthly": float(customer.get("frequency_monthly", 15)),
        "monetary_monthly_spend": float(customer.get("monetary_monthly_spend", income * 0.7)),
        "spend_food": float(customer.get("spend_food", 0.2)),
        "spend_medical": float(customer.get("spend_medical", 0.05)),
        "spend_emi": float(customer.get("spend_emi", 0.1)),
        "spend_groceries": float(customer.get("spend_groceries", 0.2)),
        "spend_utilities": float(customer.get("spend_utilities", 0.1)),
        "spend_farm_input": float(customer.get("spend_farm_input", 0)),
        "spend_entertainment": float(customer.get("spend_entertainment", 0.05)),
        "emi_burden_ratio": float(customer.get("emi_burden_ratio", emi / max(income, 1))),
        "income_stability_cv": float(customer.get("income_stability_cv", 0.2)),
        "savings_rate": float(customer.get("savings_rate", 0.2)),
        "digital_maturity": float(customer.get("digital_maturity", 0.6)),
        "balance_volatility": float(customer.get("balance_volatility", 2500)),
        "balance_min_ratio": float(customer.get("balance_min_ratio", 0.5)),
        "spending_velocity": float(customer.get("spending_velocity", 0.8)),
        "emi_bounce_count": float(customer.get("emi_bounce_count", 0)),
        "credit_utilization_ratio": float(customer.get("credit_utilization_ratio", 0.3)),
        "num_loan_inquiries": float(customer.get("num_loan_inquiries", 0)),
    }
    features["anomaly_rate_30d"] = float(customer.get("anomaly_rate_30d", 0))
    return features


def customer_features_for_customer(customer: dict) -> dict:
    """Build model features and enrich them with recent transaction anomalies."""
    from utils.mongodb_helper import get_collection

    cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    transactions = list(
        get_collection("transactions")
        .find({"customer_id": customer.get("customer_id"), "date": {"$gte": cutoff}}, {"_id": 0})
        .sort("date", -1)
        .limit(100)
    )
    anomaly = score_customer_transactions(
        transactions,
        float(customer.get("monthly_income", customer.get("income_monthly", 25000))),
    )
    features = customer_features(customer)
    if anomaly["available"]:
        features["anomaly_rate_30d"] = anomaly["anomaly_rate"]
    sequence = score_customer_sequence(transactions)
    features["recon_error"] = sequence["recon_error"]
    features["lstm_available"] = sequence["available"]
    features["lstm_alert_threshold"] = sequence.get("alert_threshold", 0.8440111637115478)
    features["emi_bounce_count_30d"] = sum(
        bool(tx.get("is_bounced") or "(BOUNCED)" in str(tx.get("description", "")))
        for tx in transactions
    )
    return features


@lru_cache(maxsize=1)
def get_model1_bundle():
    import xgboost as xgb

    models = MODEL1_ROOT / "models"
    ranker = xgb.XGBClassifier()
    ranker.load_model(str(models / "recommendation_xgboost.json"))
    return {
        "scaler": joblib.load(models / "segmentation_scaler.pkl"),
        "pca": joblib.load(models / "segmentation_pca.pkl"),
        "kmeans": joblib.load(models / "segmentation_kmeans.pkl"),
        "ranker": ranker,
        "catalog": json.loads(
            (MODEL1_ROOT / "data" / "products_detailed.json").read_text(encoding="utf-8")
        ),
    }


def predict_segment(features: dict) -> str:
    bundle = get_model1_bundle()
    row = np.array([[features[col] for col in SEGMENT_COLS]])
    cluster = int(bundle["kmeans"].predict(bundle["pca"].transform(bundle["scaler"].transform(row)))[0])
    return SEGMENTS.get(cluster, "prudent_savers")


def predict_stress(features: dict) -> float:
    try:
        model = get_stress_model()
        row = np.array([[features.get(column, 0.0) for column in STRESS_MODEL_COLS]], dtype=float)
        return float(np.clip(model.predict(row)[0], 0, 100))
    except (FileNotFoundError, ImportError, ValueError, RuntimeError, OSError):
        return _formula_stress(features)


STRESS_MODEL_COLS = STRESS_COLS + ["anomaly_rate_30d", "recon_error"]


def stress_model_source() -> str:
    try:
        get_stress_model()
        return "lightgbm"
    except (FileNotFoundError, ImportError, ValueError, RuntimeError, OSError):
        return "formula_fallback"


@lru_cache(maxsize=1)
def get_stress_model():
    import lightgbm as lgb

    path = MODEL1_ROOT / "models" / "stress_lgbm_compatible.txt"
    return lgb.Booster(model_file=str(path))


def _formula_stress(features: dict) -> float:
    emi_score = (features["emi_burden_ratio"] * 120) + (features["emi_bounce_count"] * 35)
    spend_score = max(0, (features["spending_velocity"] - 1) * 50)
    spend_score += (1 - features["balance_min_ratio"]) * 40
    income_score = (features["income_stability_cv"] * 80)
    behavior_score = (features["credit_utilization_ratio"] * 60) + (features["num_loan_inquiries"] * 12)
    anomaly_score = features.get("anomaly_rate_30d", 0) * 100
    sequence_score = min(100.0, features.get("recon_error", 0.0) * 25)
    return float(np.clip(
        0.30 * emi_score + 0.20 * spend_score + 0.20 * income_score
        + 0.12 * behavior_score + 0.10 * anomaly_score + 0.08 * sequence_score,
        0,
        100,
    ))


def rank_recommendations(features: dict, segment: str, stress_score: float) -> list[dict]:
    bundle = get_model1_bundle()
    base = np.array([[
        features["monthly_income"], features["credit_score"], features["savings_rate"],
        features["digital_maturity"], features["emi_burden_ratio"], stress_score,
    ]])
    ranked = []
    for product in bundle["catalog"]:
        is_credit = int(product.get("category") == "credit")
        if stress_score >= 31 and is_credit:
            continue
        row = np.hstack([base, [[product.get("min_income", 0), is_credit]]])
        try:
            score = float(bundle["ranker"].predict_proba(row)[0, 1])
        except (AttributeError, ValueError):
            score = predict_propensity(row[0])
        ranked.append((score, product))
    ranked.sort(key=lambda item: item[0], reverse=True)
    return [
        {
            "product_id": product["id"],
            "product_name": product["name_en"],
            "category": "loan" if product.get("category") == "credit" else product.get("category", "other"),
            "score": round(score, 4),
            "match_score_pct": round(score * 100),
            "description": product["description_en"],
            "shap_explanation": [
                {"text": f"Model fit for {segment.replace('_', ' ')}", "contribution": "+", "direction": "positive"},
                {"text": "Responsible stress guardrail evaluated", "contribution": "passed", "direction": "neutral"},
            ],
        }
        for score, product in ranked[:3]
    ]


@lru_cache(maxsize=1)
def get_propensity_model():
    return joblib.load(MODEL1_ROOT / "models" / "recommendation_propensity_lr.pkl")


def predict_propensity(row: np.ndarray) -> float:
    model = get_propensity_model()
    if hasattr(model, "predict_proba"):
        return float(model.predict_proba(np.asarray(row).reshape(1, -1))[0, 1])
    return float(model.predict(np.asarray(row).reshape(1, -1))[0])


@lru_cache(maxsize=1)
def get_intent_model():
    from transformers import AutoModelForSequenceClassification, AutoTokenizer

    root = ML_ROOT / "engine2"
    model_dir = root / "intent_classifier"
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    model.eval()
    labels = json.loads((root / "label_map.json").read_text(encoding="utf-8"))["id2label"]
    return tokenizer, model, labels


def predict_intent(text: str) -> dict:
    import torch
    import torch.nn.functional as functional

    tokenizer, model, labels = get_intent_model()
    with torch.no_grad():
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=64)
        probabilities = functional.softmax(model(**inputs).logits, dim=-1)[0]
    index = int(torch.argmax(probabilities))
    confidence = float(probabilities[index])
    if confidence >= 0.55:
        return {"intent": labels[str(index)], "confidence": confidence, "source": "indic_bert"}
    try:
        fallback = predict_intent_fallback(text)
    except (FileNotFoundError, ImportError, OSError, RuntimeError, ValueError):
        fallback = None
    if fallback and fallback["confidence"] >= 0.45 and fallback["confidence"] > confidence:
        return fallback
    return {"intent": labels[str(index)], "confidence": confidence, "source": "indic_bert_low_confidence"}


@lru_cache(maxsize=1)
def get_intent_fallback():
    from sentence_transformers import SentenceTransformer

    root = ML_ROOT / "engine2"
    bundle = joblib.load(root / "intent_embeddings.pkl")
    return SentenceTransformer(bundle["model_name"]), bundle["centroids"]


def predict_intent_fallback(text: str) -> dict:
    model, centroids = get_intent_fallback()
    embedding = model.encode([text], normalize_embeddings=True)[0]
    scores = {
        intent: float(np.dot(embedding, centroid) / (np.linalg.norm(centroid) + 1e-9))
        for intent, centroid in centroids.items()
    }
    intent = max(scores, key=scores.get)
    return {"intent": intent, "confidence": scores[intent], "source": "embedding_fallback"}


SEQUENCE_CATEGORIES = ["salary", "emi", "upi_p2p", "upi_merchant", "atm", "festival_spend", "utility_bill", "grocery"]
SEQUENCE_CHANNELS = ["UPI", "ATM", "POS", "NEFT"]


@lru_cache(maxsize=1)
def get_lstm_bundle():
    import torch
    from stress_detection.model_def import LSTMAutoencoder

    root = ML_ROOT / "engine3" / "artifacts" / "engine3_risk"
    scaler = joblib.load(root / "sequence_scaler.pkl")
    model = LSTMAutoencoder(scaler["n_feats"], scaler["seq_len"])
    weights = root / "lstm_autoencoder_best.pt"
    if not weights.exists():
        weights = root / "lstm_autoencoder.pt"
    model.load_state_dict(torch.load(weights, map_location="cpu", weights_only=True))
    model.eval()
    config = json.loads((root / "seq_threshold_config.json").read_text(encoding="utf-8"))
    return model, scaler, config


def score_customer_sequence(transactions: list[dict]) -> dict:
    if not transactions:
        return {"available": False, "recon_error": 0.0}
    try:
        import torch
        model, scaler, config = get_lstm_bundle()
        ordered = sorted(transactions, key=lambda tx: str(tx.get("date", "")))[-scaler["seq_len"]:]
        rows = []
        for tx in ordered:
            category = str(tx.get("category", "upi_merchant"))
            channel = str(tx.get("channel", "UPI")).upper()
            row = [math.log1p(max(0.0, float(tx.get("amount", 0))))]
            row.extend(float(category == item) for item in SEQUENCE_CATEGORIES)
            row.extend(float(channel == item) for item in SEQUENCE_CHANNELS)
            rows.append(row)
        values = np.asarray(rows, dtype=np.float32)
        if len(values) < scaler["seq_len"]:
            values = np.vstack([values, np.zeros((scaler["seq_len"] - len(values), values.shape[1]), dtype=np.float32)])
        values = (values - scaler["mean"]) / scaler["std"]
        with torch.no_grad():
            source = torch.tensor(values[None, ...], dtype=torch.float32)
            reconstruction = model(source).numpy()[0]
        error = float(np.mean((values - reconstruction) ** 2))
        return {
            "available": True,
            "recon_error": error,
            "alert_threshold": float(config["alert_threshold"]),
            "is_drift": error >= float(config["alert_threshold"]),
        }
    except (FileNotFoundError, KeyError, ImportError, RuntimeError, ValueError):
        return {"available": False, "recon_error": 0.0}


@lru_cache(maxsize=1)
def get_ethical_guardrails():
    import importlib.util

    path = ML_ROOT / "engine3" / "artifacts" / "engine3_risk" / "ethical_guardrails.py"
    spec = importlib.util.spec_from_file_location("bankbuddy_ethical_guardrails", path)
    if spec is None or spec.loader is None:
        raise ImportError("Unable to load ethical guardrails module")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def apply_ethical_gate(features: dict, recommendations: list[dict]) -> dict:
    guardrails = get_ethical_guardrails()
    threshold = float(features.get("lstm_alert_threshold", 0.8440111637115478))
    band = guardrails.compute_stress_band(
        anomaly_rate_30d=float(features.get("anomaly_rate_30d", 0)),
        recon_error=float(features.get("recon_error", 0)),
        recon_alert_threshold=threshold,
        emi_bounce_count_30d=int(features.get("emi_bounce_count_30d", 0)),
        income_drop_pct=float(features.get("income_drop_pct", 0)),
    )
    return {
        "stress_band": band,
        "recommendations": guardrails.apply_ethical_gate(band, recommendations),
    }
