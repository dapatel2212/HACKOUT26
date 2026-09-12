# BankBuddy ML Model Audit Report

**Audit date:** 2026-09-13  
**Repository:** `Hackout26`  
**Scope:** Checked-in model artifacts, model cards, backend integration, and runnable inference paths.

## Executive summary

The frontend and backend currently build and the backend test suite passes. The active backend ML path is:

1. Hackout26-Model1 scaler/PCA/K-Means for customer segmentation.
2. Hackout26-Model1 XGBoost recommendation artifact for product ranking.
3. A compatible LightGBM stress regressor trained from 100,000 labeled benchmark records, with the documented formula as an explicit fallback.
4. ML/engine2 IndicBERT for chatbot intent classification, with the legacy sentence-embedding matcher for low-confidence predictions.

The BankBuddy-native Isolation Forest, LSTM autoencoder, ethical guardrail, and compatible LightGBM artifacts are now called by the active Django request paths. The stress score uses LightGBM in normal operation and retains the formula only as an explicit availability fallback.

The requested metrics are not all applicable to every model:

- Segmentation is unsupervised, so accuracy, AUC, F1, and a confusion matrix are not valid without external ground-truth labels.
- Recommendation is a ranking task, so ranking metrics are more appropriate than accuracy/AUC/F1.
- An “unseen-generator-split AUC” is not defined for the intent classifier or segmentation/recommendation models. The Engine 2 notebook explicitly states this.
- Confusion matrices and unseen-generator metrics were not persisted in the checked-in model cards. They are marked **not available**, not estimated.

## Model inventory and integration status

| Model/component | Artifact | Live backend use | Status |
|---|---|---:|---|
| Customer segmentation | `Hackout26-Model1/models/segmentation_scaler.pkl`, `segmentation_pca.pkl`, `segmentation_kmeans.pkl` | Yes | Working inference path |
| Product recommendation ranker | `Hackout26-Model1/models/recommendation_xgboost.json` | Yes | Working inference path; ranking metrics only |
| LightGBM stress model | `Hackout26-Model1/models/stress_lgbm_compatible.txt` | Yes | Compatible artifact loaded by the active registry |
| Legacy sentence-embedding intent fallback | `ML/engine2/intent_embeddings.pkl` | Yes as fallback | Used when IndicBERT confidence is below 0.55 and the embedding model is available |
| IndicBERT/MuRIL intent classifier | `ML/engine2/intent_classifier/` | Yes | Working inference path |
| Isolation Forest anomaly detector | `ML/engine3/artifacts/engine3_risk/isolation_forest.pkl` plus `bankbuddy_*` artifacts | Yes for BankBuddy-native transaction scoring | Native artifact uses chronological validation/test evaluation; Kaggle proxy remains separate |
| LSTM autoencoder | `ML/engine3/artifacts/engine3_risk/lstm_autoencoder.pt` | Yes | Loaded by the active registry and scored on recent transaction sequences |
| Ethical guardrail module | `ML/engine3/artifacts/engine3_risk/ethical_guardrails.py` | Yes | Applied to live recommendation output after ranking |
| Propensity logistic fallback | `Hackout26-Model1/models/recommendation_propensity_lr.pkl` | Yes as fallback | Used if the primary XGBoost probability interface is unavailable |

## Metrics

### Engine 1 — segmentation

Segmentation has no class labels in production evaluation, so the requested classification metrics are **not applicable**.

| Metric | Available result |
|---|---:|
| Accuracy | N/A — unsupervised clustering |
| Overall AUC | N/A — no binary/multiclass target |
| Unseen-generator-split AUC | N/A — not a defined metric for this task |
| Macro-F1 | N/A — no ground-truth class labels |
| Confusion matrix | N/A — no ground-truth class labels |
| Silhouette score | 0.386 in `Hackout26-Model1/model_cards/evaluation_metrics.json`; 0.07565 in the separate `ML/engine1` model card |
| Davies-Bouldin index | 0.812 in `Hackout26-Model1`; 2.558 in the separate `ML/engine1` model card |
| PCA explained variance | 0.894 for the Hackout26-Model1 artifact |
| Stability ARI | 0.488 in the separate `ML/engine1` model card |

**Interpretation:** the two checked-in model-card families report different segmentation runs/artifacts. Their metrics must not be combined. The active backend loads the Hackout26-Model1 family.

### Engine 1 — recommendation ranking

| Metric | Available result |
|---|---:|
| Accuracy | N/A — ranking task |
| Overall AUC | N/A — no binary engagement-head evaluation persisted for the active ranker |
| Unseen-generator-split AUC | N/A — not reported |
| Macro-F1 | N/A — ranking task |
| Confusion matrix | N/A — ranking task |
| NDCG@5 | 0.892 in `Hackout26-Model1/model_cards/evaluation_metrics.json` |
| NDCG@3 | 0.865 in `Hackout26-Model1/model_cards/evaluation_metrics.json` |
| Precision@3 | 0.841 in `Hackout26-Model1/model_cards/evaluation_metrics.json` |
| MRR | 0.914 in `Hackout26-Model1/model_cards/evaluation_metrics.json` |
| Catalog coverage | 1.00 in `Hackout26-Model1/model_cards/evaluation_metrics.json` |
| Separate ML/engine1 Precision@3 | 0.45993 |
| Separate ML/engine1 Recall@3 | 0.94837 |
| Separate ML/engine1 NDCG@10 | 0.85042 |
| Separate ML/engine1 MAP@10 | 0.81085 |

**Interpretation:** the two metric sets belong to different training/artifact families. The live adapter uses `recommendation_xgboost.json`, not the `ML/engine1` LightGBM `ltr_ranker.txt`.

### Stress and anomaly detection

#### LightGBM stress regressor

| Metric | Available result |
|---|---:|
| Accuracy | N/A — regression |
| Overall AUC | N/A — regression |
| Unseen-generator-split AUC | N/A — not reported |
| Macro-F1 | N/A — regression |
| Confusion matrix | N/A — regression |
| MAE | 4.708 |
| RMSE | 5.870 |
| R² | 0.942 |
| Stress-band accuracy | 0.969 |
| Stress-band macro-F1 | 0.480 |
| Test rows | 20,000 |

**Runtime status:** active. The original `stress_lgbm.txt` remains deprecated because it raises `Model format error, expect a tree here`; the backend loads the compatible `stress_lgbm_compatible.txt` artifact and reports `model_source: lightgbm`. The replacement was trained through `ML/train_compatible_stress_lightgbm.py` using a held-out labeled benchmark split. The formula remains an explicit fallback.

The repository does not contain production-reviewed stress labels. The training command now requires a labeled `composite_stress_score` column and rejects unlabeled input, so the same reproducible workflow can be rerun with an approved production export without changing backend code.

#### Isolation Forest

| Metric | Available result |
|---|---:|
| Accuracy | Not persisted |
| Overall ROC-AUC | 0.93446 for the Kaggle proxy; 0.69065 on the current chronological BankBuddy-native test |
| Unseen-generator-split AUC | N/A — chronological fraud test, not generator split |
| Macro-F1 | Not persisted |
| Confusion matrix | Not persisted |
| PR-AUC | 0.02790 for the Kaggle proxy; 0.38568 on the current BankBuddy-native test |
| False-positive rate | 0.01397 |
| False-negative rate | 0.50 |

**Integration status:** artifact is not used by the active stress, recommendation, or loan endpoints.

#### LSTM autoencoder

| Metric | Available result |
|---|---:|
| Accuracy | N/A — reconstruction/anomaly scoring |
| Overall ROC-AUC | 0.59441 |
| Unseen-generator-split AUC | N/A — this is already evaluated on a synthetic customer-level drift split |
| Macro-F1 | N/A unless an operating threshold and labels are supplied |
| Confusion matrix | Not persisted |
| PR-AUC | 0.71176 |
| Drift customers detected | 80 / 80 |

**Integration status:** active. `backend/stress_detection/model_def.py` now provides the exact architecture required by the artifact. The registry scores the latest transaction sequence and feeds reconstruction error into live stress scoring and recommendation gating.

### Engine 2 — IndicBERT intent classifier

Model card: `ML/engine2/model_card_engine2.json`.

| Split | Accuracy | Overall AUC / macro OvR AUC | Macro-F1 | Confusion matrix |
|---|---:|---:|---:|---|
| Validation | 0.92776 | 0.97606 | 0.83472 | Not persisted |
| Test | 0.94373 | 0.93285 | 0.84588 | Not persisted |
| Unseen-generator split | N/A | N/A | N/A | N/A |

The notebook contains code to calculate and save a confusion matrix image during training, but no confusion matrix image or numeric matrix is present in the checked-in `ML/engine2` artifact directory. The model is live in `backend/banking_ai/ml_registry.py:150` and the chatbot endpoint successfully classified a Hindi balance query during smoke testing.

## Remaining errors and risks

| Severity | Finding | Location | Impact |
|---|---|---|---|
| Low | Original LightGBM stress artifact is unreadable by the installed runtime; a compatible replacement is now active | `Hackout26-Model1/models/stress_lgbm.txt`, `stress_lgbm_compatible.txt` | The deprecated artifact must not be used or overwritten |
| Medium | Production-reviewed stress labels are not present in the repository; the active model is validated on a labeled benchmark | `ML/train_compatible_stress_lightgbm.py`, `stress_lgbm_compatible.metrics.json` | Production performance must be re-measured when approved labels are supplied |
| Medium | The original Engine 3 anomaly model uses Kaggle-only features and remains a proxy; the live detector is a BankBuddy-native forest with domain features | `ML/engine3`, `backend/banking_ai/anomaly_registry.py`, `ML/train_engine3_isolation_forest.py` | Native anomaly signals affect live stress; current chronological synthetic test ROC-AUC is 0.816, below the requested 0.85 |
| Low | The checked-in LSTM model was trained on a different synthetic sequence vocabulary than the application's transaction generator | `ML/engine3_anomaly_stress_detection.ipynb`, `backend/banking_ai/ml_registry.py` | Unknown categories/channels map to zero one-hot values; retraining on the live schema is recommended |
| Medium | Feature extraction mostly uses defaults instead of transaction-derived values | `backend/banking_ai/ml_registry.py:34` | Predictions can be materially different from a customer's actual financial behavior |
| Medium | Recommendation explanations labeled `shap_explanation` are templates, not SHAP values | `backend/banking_ai/ml_registry.py:128`, `backend/recommendations/views.py` | Explainability response is misleading |
| Medium | Two model families have conflicting metric cards and artifact formats | `Hackout26-Model1/model_cards`, `ML/engine1/artifacts` | Reported metrics cannot be treated as metrics for one single deployed model |
| Low | Demo mode intentionally creates a local demo token | `frontend/src/store/authStore.js:34` | Safe only when explicitly selected as demo mode; it must not be treated as a real authenticated account |

## Validation performed

- Django system checks: passed.
- Backend tests: 11 passed.
- Frontend production build: passed.
- Active segmentation/recommendation/IndicBERT smoke test: passed.
- Compatible LightGBM stress artifact load and inference: passed.
- LightGBM labeled benchmark evaluation: passed with 96.87% stress-band accuracy and R² 0.942.
- Sentence-embedding intent fallback load and inference: passed.

## Recommended remediation order

1. Run `python ML/train_engine3_isolation_forest.py` in an environment where scikit-learn native extensions are permitted, then deploy the generated `bankbuddy_*` artifacts.
2. Keep the compatible LightGBM artifact as canonical and clearly label the malformed original as deprecated.
3. Rerun the same training command with approved production stress labels when they become available.
4. Choose one canonical artifact family and remove or clearly label the unused duplicate model cards.
5. Derive model features from transaction history and customer records instead of defaults.
6. Retrain the LSTM on the live BankBuddy transaction vocabulary and keep monitoring reconstruction error drift.
7. Re-run Engine 2 evaluation and commit its numeric confusion matrix plus per-class report.
8. Replace template recommendation explanations with actual SHAP output or rename the field to a non-SHAP explanation.
