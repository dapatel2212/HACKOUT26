"""Train and export the stress model from an explicitly labeled dataset.

The training command rejects unlabeled/proxy-only input. The checked-in
synthetic generator is useful for repeatable demos, while production runs
must provide reviewed stress labels through --data.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import lightgbm as lgb
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Hackout26-Model1" / "models" / "stress_lgbm_compatible.txt"
FEATURES = [
    "recency_days", "frequency_monthly", "monetary_monthly_spend",
    "emi_burden_ratio", "income_stability_cv", "balance_volatility",
    "balance_min_ratio", "spending_velocity", "emi_bounce_count",
    "credit_utilization_ratio", "num_loan_inquiries",
    "anomaly_rate_30d", "recon_error",
]


def _metrics(actual, predicted):
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)
    bands_actual = np.digitize(actual, [31, 61, 81])
    bands_predicted = np.digitize(predicted, [31, 61, 81])
    matrix = np.zeros((4, 4), dtype=int)
    for truth, guess in zip(bands_actual, bands_predicted):
        matrix[truth, guess] += 1
    accuracy = float(np.mean(bands_actual == bands_predicted))
    f1_scores = []
    for label in range(4):
        tp = matrix[label, label]
        fp = matrix[:, label].sum() - tp
        fn = matrix[label, :].sum() - tp
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1_scores.append(2 * precision * recall / (precision + recall) if precision + recall else 0.0)
    mae = float(np.mean(np.abs(actual - predicted)))
    rmse = float(np.sqrt(np.mean((actual - predicted) ** 2)))
    ss_res = float(np.sum((actual - predicted) ** 2))
    ss_tot = float(np.sum((actual - np.mean(actual)) ** 2))
    return {
        "mae": mae,
        "rmse": rmse,
        "r2": 1 - ss_res / ss_tot if ss_tot else 0.0,
        "band_accuracy": accuracy,
        "band_macro_f1": float(np.mean(f1_scores)),
        "confusion_matrix": matrix.tolist(),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    args = parser.parse_args()
    data = pd.read_csv(args.data)
    required = set(FEATURES) - {"anomaly_rate_30d", "recon_error"}
    missing = sorted(required - set(data.columns))
    if "composite_stress_score" not in data.columns:
        raise ValueError("Input must contain reviewed composite_stress_score labels")
    if missing:
        raise ValueError(f"Input is missing required stress features: {', '.join(missing)}")

    data = data.copy()
    for column in FEATURES:
        if column not in data:
            data[column] = 0.0
    data = data[FEATURES + ["composite_stress_score"]].dropna()
    if len(data) < 1000:
        raise ValueError("At least 1,000 labeled rows are required for a presentation-ready model")
    data = data.sample(frac=1.0, random_state=42).reset_index(drop=True)
    split = int(len(data) * 0.8)
    train, test = data.iloc[:split], data.iloc[split:]
    rows = train[FEATURES].to_numpy(dtype=float)
    target = train["composite_stress_score"].to_numpy(dtype=float)

    model = lgb.LGBMRegressor(
        objective="regression",
        n_estimators=300,
        num_leaves=31,
        learning_rate=0.05,
        max_depth=-1,
        random_state=42,
        verbosity=-1,
    )
    model.fit(rows, target, feature_name=FEATURES)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    model.booster_.save_model(str(args.output))
    predictions = model.predict(test[FEATURES])
    metrics = _metrics(test["composite_stress_score"], predictions)
    manifest = args.output.with_suffix(".metrics.json")
    manifest.write_text(json.dumps({
        "artifact": str(args.output),
        "data_source": str(args.data),
        "label": "composite_stress_score",
        "rows": len(data),
        "train_rows": len(train),
        "test_rows": len(test),
        "features": FEATURES,
        "metrics": metrics,
    }, indent=2), encoding="utf-8")
    print(json.dumps({"artifact": str(args.output), "metrics": metrics}, indent=2))


if __name__ == "__main__":
    main()
