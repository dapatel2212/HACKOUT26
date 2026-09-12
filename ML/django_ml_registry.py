"""
banking_ai/ml_registry.py

Singleton loader for all trained ML artifacts. Import from views/serializers/Celery tasks —
never re-instantiate a model per-request. With Gunicorn, run with `--preload` so this module's
`lru_cache`-wrapped loaders run once before forking workers (avoids loading IndicBERT/LightGBM
N times, once per worker, which is slow and memory-wasteful).

Expected directory layout (see AI_ML_Model_Specification.md, section "Deployment directory
structure"):

    banking_ai_backend/
    └── ml_artifacts/
        ├── engine1_recsys/   (segmentation_kmeans.pkl, als_*.npy, ltr_ranker.txt, ...)
        ├── engine2_nlp/      (intent_classifier/, intent_embeddings.pkl, entity_patterns.json, ...)
        └── engine3_risk/     (isolation_forest.pkl, lstm_autoencoder.pt, ethical_guardrails.py, ...)

Copy the `artifacts/engine{1,2,3}_*` folders produced by the three Colab notebooks directly into
`ml_artifacts/` under these same names.
"""
from __future__ import annotations

import json
import pickle
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np

ARTIFACT_ROOT = Path(__file__).resolve().parent / "ml_artifacts"


# ---------------------------------------------------------------------------
# ENGINE 1 — Segmentation + Recommendation
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def get_segmentation_model():
    e1 = ARTIFACT_ROOT / "engine1_recsys"
    kmeans = joblib.load(e1 / "segmentation_kmeans.pkl")
    scaler_bundle = joblib.load(e1 / "segmentation_scaler.pkl")
    profiles = json.loads((e1 / "segment_profiles.json").read_text())
    return {"model": kmeans, "scaler_bundle": scaler_bundle, "profiles": profiles}


@lru_cache(maxsize=1)
def get_recommender():
    e1 = ARTIFACT_ROOT / "engine1_recsys"
    import lightgbm as lgb

    return {
        "tfidf": joblib.load(e1 / "tfidf_vectorizer.pkl"),
        "product_sim": np.load(e1 / "product_similarity_matrix.npz", allow_pickle=True),
        "als_user_factors": np.load(e1 / "als_user_factors.npy"),
        "als_item_factors": np.load(e1 / "als_item_factors.npy"),
        "ranker": lgb.Booster(model_file=str(e1 / "ltr_ranker.txt")),
        "catalog": json.loads((e1 / "product_catalog.json").read_text()),
    }


def predict_segment(customer_features: dict) -> str:
    """customer_features must contain the same keys used in segmentation_scaler.pkl's cont_feats/cat_feats."""
    bundle = get_segmentation_model()
    scaler_bundle = bundle["scaler_bundle"]
    cont = np.array([[customer_features[f] for f in scaler_bundle["cont_feats"]]])
    cat = np.array([[customer_features[f] for f in scaler_bundle["cat_feats"]]])
    x_cont = scaler_bundle["scaler"].transform(cont)
    x_cat = scaler_bundle["ohe"].transform(cat)
    x = np.hstack([x_cont, x_cat])
    cluster = int(bundle["model"].predict(x)[0])
    persona = bundle["profiles"]["cluster_to_persona"].get(str(cluster), "unknown")
    return persona


# ---------------------------------------------------------------------------
# ENGINE 2 — NLP / Chatbot
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def get_intent_classifier():
    from transformers import AutoModelForSequenceClassification, AutoTokenizer

    e2 = ARTIFACT_ROOT / "engine2_nlp"
    model_path = e2 / "intent_classifier"
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    model.eval()
    label_map = json.loads((e2 / "label_map.json").read_text())
    return {"tokenizer": tokenizer, "model": model, "label_map": label_map}


@lru_cache(maxsize=1)
def get_fallback_matcher():
    e2 = ARTIFACT_ROOT / "engine2_nlp"
    from sentence_transformers import SentenceTransformer

    with open(e2 / "intent_embeddings.pkl", "rb") as f:
        bundle = pickle.load(f)
    st_model = SentenceTransformer(bundle["model_name"])
    return {"model": st_model, "centroids": bundle["centroids"]}


@lru_cache(maxsize=1)
def get_entity_patterns():
    e2 = ARTIFACT_ROOT / "engine2_nlp"
    return json.loads((e2 / "entity_patterns.json").read_text())


def predict_intent(text: str, confidence_threshold: float = 0.55) -> dict:
    import torch
    import torch.nn.functional as F

    bundle = get_intent_classifier()
    tokenizer, model, label_map = bundle["tokenizer"], bundle["model"], bundle["label_map"]
    id2label = label_map["id2label"]

    with torch.no_grad():
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=64)
        logits = model(**inputs).logits
        probs = F.softmax(logits, dim=-1).squeeze().numpy()

    top_idx = int(np.argmax(probs))
    top_conf = float(probs[top_idx])

    if top_conf < confidence_threshold:
        fb = get_fallback_matcher()
        emb = fb["model"].encode([text])[0]
        sims = {
            intent: float(np.dot(emb, c) / (np.linalg.norm(emb) * np.linalg.norm(c) + 1e-9))
            for intent, c in fb["centroids"].items()
        }
        fallback_intent = max(sims, key=sims.get)
        return {"intent": fallback_intent, "confidence": sims[fallback_intent], "source": "fallback_embedding"}

    return {"intent": id2label[str(top_idx)], "confidence": top_conf, "source": "indic_bert"}


# ---------------------------------------------------------------------------
# ENGINE 3 — Anomaly / Stress + Ethical Gate
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def get_isolation_forest():
    e3 = ARTIFACT_ROOT / "engine3_risk"
    return {
        "model": joblib.load(e3 / "isolation_forest.pkl"),
        "scaler": joblib.load(e3 / "anomaly_scaler.pkl"),
        "threshold_config": json.loads((e3 / "threshold_config.json").read_text()),
    }


@lru_cache(maxsize=1)
def get_lstm_autoencoder():
    """The LSTMAutoencoder class definition must be importable — copy the class from the
    engine3 notebook into e.g. `stress_detection/model_def.py` in the Django app and import it here."""
    import torch

    from stress_detection.model_def import LSTMAutoencoder  # your Django app's copy of the class

    e3 = ARTIFACT_ROOT / "engine3_risk"
    seq_scaler = joblib.load(e3 / "sequence_scaler.pkl")
    model = LSTMAutoencoder(n_feats=seq_scaler["n_feats"], seq_len=seq_scaler["seq_len"])
    model.load_state_dict(torch.load(e3 / "lstm_autoencoder.pt", map_location="cpu"))
    model.eval()
    seq_threshold_config = json.loads((e3 / "seq_threshold_config.json").read_text())
    return {"model": model, "scaler": seq_scaler, "threshold_config": seq_threshold_config}


@lru_cache(maxsize=1)
def get_ethical_guardrails():
    """Loads the compute_stress_band / apply_ethical_gate functions saved by the engine3 notebook.
    In production, just `from stress_detection.ethical_guardrails import compute_stress_band,
    apply_ethical_gate` directly (copy ethical_guardrails.py into that Django app) instead of
    dynamic-importing it — this loader exists only for notebook-artifact parity."""
    import importlib.util

    e3 = ARTIFACT_ROOT / "engine3_risk"
    spec = importlib.util.spec_from_file_location("ethical_guardrails", e3 / "ethical_guardrails.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def score_anomaly(transaction_features: np.ndarray) -> float:
    """Returns an anomaly score (higher = more anomalous) for a single transaction row,
    already ordered to match the FEATURE_COLS used during training."""
    bundle = get_isolation_forest()
    x = bundle["scaler"].transform(transaction_features.reshape(1, -1))
    return float(-bundle["model"].score_samples(x)[0])


def gate_recommendations(stress_inputs: dict, candidate_recommendations: list) -> list:
    """stress_inputs = {anomaly_rate_30d, recon_error, emi_bounce_count_30d, income_drop_pct}"""
    guardrails = get_ethical_guardrails()
    threshold = get_lstm_autoencoder()["threshold_config"]["alert_threshold"]
    band = guardrails.compute_stress_band(
        anomaly_rate_30d=stress_inputs["anomaly_rate_30d"],
        recon_error=stress_inputs["recon_error"],
        recon_alert_threshold=threshold,
        emi_bounce_count_30d=stress_inputs["emi_bounce_count_30d"],
        income_drop_pct=stress_inputs["income_drop_pct"],
    )
    return {"stress_band": band, "recommendations": guardrails.apply_ethical_gate(band, candidate_recommendations)}


# ---------------------------------------------------------------------------
# Example Django view usage
# ---------------------------------------------------------------------------
"""
# chatbot/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from banking_ai.ml_registry import predict_intent

class ChatIntentView(APIView):
    def post(self, request):
        text = request.data.get("message", "")
        result = predict_intent(text)
        return Response(result)


# recommendations/views.py
from banking_ai.ml_registry import get_recommender, gate_recommendations

class RecommendationView(APIView):
    def get(self, request, customer_id):
        # ... build candidate_recommendations via get_recommender()['ranker'] ...
        stress_inputs = {...}  # pulled from stress_detection app's latest computed values
        gated = gate_recommendations(stress_inputs, candidate_recommendations)
        return Response(gated)
"""
