#!/usr/bin/env python3
import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
import lightgbm as lgb
import time

MODELS_DIR = "models"
DATA_FILE = "data/synthetic_customer_features.csv"
OUT_FILE = "data/batch_predictions_100k.csv"

def run_batch_inference():
    print("=========================================================")
    print("🚀 HACK HORIZON - 100K BATCH INFERENCE PIPELINE")
    print("=========================================================")
    
    t0 = time.time()
    
    print(f"Loading 100,000 customers from {DATA_FILE}...")
    df = pd.read_csv(DATA_FILE, nrows=100000)
    
    print("Loading Models...")
    scaler = joblib.load(os.path.join(MODELS_DIR, "segmentation_scaler.pkl"))
    pca = joblib.load(os.path.join(MODELS_DIR, "segmentation_pca.pkl"))
    kmeans = joblib.load(os.path.join(MODELS_DIR, "segmentation_kmeans.pkl"))
    
    # LightGBM loading (needs Booster for raw txt)
    stress_scorer = lgb.Booster(model_file=os.path.join(MODELS_DIR, "stress_lgbm.txt"))
    
    xgb_ranker = xgb.XGBClassifier()
    xgb_ranker.load_model(os.path.join(MODELS_DIR, "recommendation_xgboost.json"))
    
    # 1. Predict Segment
    print("Executing Segmentation Phase...")
    seg_cols = [
        "age", "monthly_income", "credit_score", "recency_days", "frequency_monthly",
        "monetary_monthly_spend", "spend_food", "spend_medical", "spend_emi", "spend_groceries",
        "spend_utilities", "spend_farm_input", "spend_entertainment", "emi_burden_ratio",
        "income_stability_cv", "savings_rate", "digital_maturity", "balance_volatility"
    ]
    
    # Surpress scaler feature names warning by converting to numpy array
    X_seg = df[seg_cols].fillna(0).to_numpy()
    X_scaled = scaler.transform(X_seg)
    X_pca = pca.transform(X_scaled)
    cluster_labels = kmeans.predict(X_pca)
    
    segments_map = {0: "prudent_savers", 1: "aspiring_spenders", 2: "family_builders", 3: "digital_natives", 4: "seasonal_earners", 5: "stressed_accounts"}
    df['predicted_segment'] = [segments_map.get(c, "unknown") for c in cluster_labels]
    
    # 2. Predict Stress Score
    print("Executing Financial Stress Scoring...")
    stress_cols = [
        "recency_days", "frequency_monthly", "monetary_monthly_spend",
        "emi_burden_ratio", "income_stability_cv", "balance_volatility",
        "balance_min_ratio", "spending_velocity", "emi_bounce_count",
        "credit_utilization_ratio", "num_loan_inquiries"
    ]
    X_stress = df[stress_cols].fillna(0).to_numpy()
    stress_preds = stress_scorer.predict(X_stress)
    df['predicted_stress_score'] = stress_preds
    
    # Calculate Band
    df['stress_band'] = pd.cut(df['predicted_stress_score'], bins=[-np.inf, 31, 61, 81, np.inf], labels=["GREEN", "YELLOW", "ORANGE", "RED"], right=False)
    
    # 3. Predict Recommendations (Top Product)
    print("Executing Personalized Product Recommendations...")
    # For batch speed, we will evaluate 3 key products per customer and pick the highest score
    # Products: FD (min_inc=0, credit=0), Personal Loan (min_inc=25000, credit=1), Health Insurance (min_inc=15000, credit=0)
    
    products = [
        {"name": "FD", "min_inc": 0, "is_credit": 0},
        {"name": "PERSONAL_LOAN", "min_inc": 25000, "is_credit": 1},
        {"name": "HEALTH_INSURANCE", "min_inc": 15000, "is_credit": 0}
    ]
    
    # We build a matrix for all products for all users
    # To do this fast, we iterate through the 3 products, run predictions for all 100k users
    best_products = ["NONE"] * len(df)
    best_scores = [-999.0] * len(df)
    
    base_feat_cols = ["monthly_income", "credit_score", "savings_rate", "digital_maturity", "emi_burden_ratio", "predicted_stress_score"]
    base_X = df[base_feat_cols].fillna(0).to_numpy()
    
    for p in products:
        # Combine base customer features with product features via broadcasting
        prod_features = np.broadcast_to([p['min_inc'], p['is_credit']], (len(df), 2))
        X_rank = np.hstack((base_X, prod_features))
        
        # Predict probability of relevance
        scores = xgb_ranker.predict_proba(X_rank)[:, 1]
        
        # Enforce business logic mask (ethical gate)
        # Block credit if stress > 31
        mask = (df['predicted_stress_score'] >= 31) & (p['is_credit'] == 1)
        scores[mask] = -999.0 # Force block
        
        # Update best product
        for i in range(len(df)):
            if scores[i] > best_scores[i]:
                best_scores[i] = scores[i]
                best_products[i] = p['name']
                
    df['top_recommended_product'] = best_products
    df['recommendation_confidence'] = best_scores
    
    print("Formatting Final Output...")
    output_cols = [
        "customer_id", "segment_ground_truth", "predicted_segment", 
        "composite_stress_score", "predicted_stress_score", "stress_band",
        "top_recommended_product", "recommendation_confidence"
    ]
    df_out = df[output_cols]
    
    df_out.to_csv(OUT_FILE, index=False)
    
    print(f"✅ Successfully processed {len(df_out):,} customers in {time.time() - t0:.2f} seconds!")
    print(f"Results saved to: {OUT_FILE}")

if __name__ == "__main__":
    run_batch_inference()
