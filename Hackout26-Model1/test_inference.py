#!/usr/bin/env python3
"""
End-to-End Inference Verification Script
Simulates customer login, computes features, determines stress & segment,
and produces explainable recommendations + contextual triggers.
"""

import json
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb

from contextual_triggers import evaluate_all_triggers
from segment_product_map import filter_and_rank_products
from explainability_shap import explain_recommendation

def run_pipeline_test():
    print("====================================================================")
    print("🚀 HACK HORIZON - MEMBER 3 END-TO-END INFERENCE VERIFICATION")
    print("====================================================================")

    # 1. Load trained models
    scaler = joblib.load("models/feature_scaler.pkl")
    pca = joblib.load("models/pca_model.pkl")
    kmeans = joblib.load("models/segmentation_model.pkl")
    iso_forest = joblib.load("models/isolation_forest.pkl")
    stress_scorer = joblib.load("models/stress_scorer.pkl")
    
    xgb_ranker = xgb.XGBRanker()
    xgb_ranker.load_model("models/recommendation_xgb.json")
    
    with open("data/products_detailed.json") as f:
        catalog = json.load(f)

    # 2. Demo Customer: Ramesh (Farmer, Moderate Income, Approaching Kharif Season)
    demo_customer = {
        "customer_id": "CUST_0001",
        "name": "Ramesh Patel",
        "persona": "farmer",
        "monthly_income": 22000,
        "credit_score": 680,
        "age": 45,
        "existing_products": "savings_account",
        "current_monthly_emi": 2000,
        "emis_remaining": 1,
        "credit_utilization_ratio": 0.25,
        "num_loan_inquiries": 0
    }

    # Features extracted for demo
    sample_features = {
        "age": 45, "monthly_income": 22000, "credit_score": 680,
        "recency_days": 2, "frequency_monthly": 18.0, "monetary_monthly_spend": 12000,
        "spend_food": 0.25, "spend_medical": 0.05, "spend_emi": 0.09, "spend_groceries": 0.20,
        "spend_utilities": 0.10, "spend_farm_input": 0.25, "spend_entertainment": 0.05,
        "emi_burden_ratio": 0.09, "income_stability_cv": 0.35, "savings_rate": 0.45,
        "digital_maturity": 0.35, "balance_volatility": 1200.0, "balance_min_ratio": 0.40,
        "spending_velocity": 0.95, "emi_bounce_count": 0,
        "credit_utilization_ratio": 0.25, "num_loan_inquiries": 0
    }

    # 3. Predict Segment
    seg_cols = [
        "age", "monthly_income", "credit_score", "recency_days", "frequency_monthly",
        "monetary_monthly_spend", "spend_food", "spend_medical", "spend_emi", "spend_groceries",
        "spend_utilities", "spend_farm_input", "spend_entertainment", "emi_burden_ratio",
        "income_stability_cv", "savings_rate", "digital_maturity", "balance_volatility"
    ]
    x_seg = np.array([[sample_features[c] for c in seg_cols]])
    x_scaled = scaler.transform(x_seg)
    x_pca = pca.transform(x_scaled)
    cluster_idx = int(kmeans.predict(x_pca)[0])
    
    segments = {0: "prudent_savers", 1: "aspiring_spenders", 2: "family_builders", 3: "digital_natives", 4: "seasonal_earners", 5: "stressed_accounts"}
    predicted_segment = segments.get(cluster_idx, "seasonal_earners")
    print(f"\n👤 Customer: {demo_customer['name']} ({demo_customer['persona']})")
    print(f"📊 Predicted Behavioral Segment: [{predicted_segment.upper()}] (Cluster {cluster_idx})")

    # 4. Predict Stress Score
    stress_cols = [
        "recency_days", "frequency_monthly", "monetary_monthly_spend",
        "emi_burden_ratio", "income_stability_cv", "balance_volatility",
        "balance_min_ratio", "spending_velocity", "emi_bounce_count",
        "credit_utilization_ratio", "num_loan_inquiries"
    ]
    x_stress = np.array([[sample_features[c] for c in stress_cols]])
    predicted_stress = float(stress_scorer.predict(x_stress)[0])
    stress_band = "GREEN (Healthy)" if predicted_stress < 31 else ("YELLOW (Alert)" if predicted_stress < 61 else "ORANGE/RED (Critical)")
    print(f"💓 Composite Financial Stress Score: {predicted_stress:.1f}/100 [{stress_band}]")

    # 5. Candidate Generation & XGBoost Ranking
    candidate_scores = {}
    for p in catalog:
        pid = p['id']
        is_credit = 1 if p.get('category') == 'credit' else 0
        x_rank = np.array([[
            demo_customer['monthly_income'], demo_customer['credit_score'],
            sample_features['savings_rate'], sample_features['digital_maturity'],
            sample_features['emi_burden_ratio'], predicted_stress,
            p.get('min_income', 10000), is_credit
        ]])
        score = float(xgb_ranker.predict(x_rank)[0])
        candidate_scores[pid] = score

    # Filter through Segment Product Rules & Stress Lock
    ranked_products = filter_and_rank_products(
        {"segment_name": predicted_segment, "composite_stress_score": predicted_stress, "monthly_income": demo_customer['monthly_income']},
        candidate_scores
    )

    print("\n🏆 Top 3 Personalized Product Recommendations:")
    for idx, rp in enumerate(ranked_products[:3], 1):
        pname = rp['product_name']
        expl = explain_recommendation(sample_features, pname, language="hi")
        print(f"  {idx}. {pname.upper()} (Score: {rp['final_score']:.3f})")
        print(f"     Why: {expl['explanation']}")

    # 6. Evaluate Contextual Triggers
    recent_dummy_txns = [{"txn_type": "credit", "category": "salary", "amount": 22000, "timestamp": "2026-09-11 10:00:00"}]
    triggers = evaluate_all_triggers(demo_customer, recent_dummy_txns, current_balance=18000, avg_balance=12000, monthly_spend=12000)
    print("\n⚡ Contextual Moment Nudges Triggered:")
    for t in triggers:
        print(f"  - [{t['trigger_name'].upper()}]: {t['headline_hi']} ({t['headline_en']})")

    print("\n✅ Verification Test Completed Successfully!")

if __name__ == "__main__":
    run_pipeline_test()
