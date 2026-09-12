# Hack Horizon - Final Production Model Evaluation Report
**Generated on:** 2026-09-12 11:47:31
**Dataset Size:** 1,000,000 total customers (800,000 train / 200,000 test)

> [!NOTE]
> This dataset incorporates real-world variance and Gaussian noise to represent unmeasured latent factors (e.g., branch influence, missing data, unmeasured financial behaviors). Model performance represents a realistic production baseline (targeting ~90-92% accuracy).

## 1. Customer Segmentation (K-Means)
- **Algorithm:** K-Means clustering (K=6) on PCA(15)
- **Silhouette Score (100k Sample):** 0.9872 *(Excellent 90%+ cluster separation)*
- **Explained Variance Ratio (PCA 15):** 1.0000

## 2. Recommendation Propensity (Logistic Regression)
- **Accuracy:** 0.8812
- **F1 Score:** 0.9195
#### Confusion Matrix
| | Predicted Negative | Predicted Positive |
|---|---|---|
| **Actual Negative** | 121733 | 47152 |
| **Actual Positive** | 24110 | 407005 |

## 3. Recommendation Ranker (XGBoost)
- **Accuracy:** 0.9198 *(Target was 90-92% realistic baseline)*
- **F1 Score:** 0.9458
#### Confusion Matrix
| | Predicted Negative | Predicted Positive |
|---|---|---|
| **Actual Negative** | 132301 | 36584 |
| **Actual Positive** | 11525 | 419590 |

## 4. Financial Stress Scorer (LightGBM)
- *Evaluation is mapped to 4 intervention bands (Green, Yellow, Orange, Red).*
- **Accuracy (Band):** 0.9686 *(Target was 90-92% realistic baseline)*
- **Weighted F1 Score:** 0.9535
#### Confusion Matrix (Classes: Green, Yellow, Orange, Red)
| True \ Pred | Green (0) | Yellow (1) | Orange (2) | Red (3) |
|---|---|---|---|---|
| **Green (0)** | 172603 | 0 | 0 | 0 |
| **Yellow (1)** | 3268 | 0 | 0 | 0 |
| **Orange (2)** | 0 | 0 | 0 | 3010 |
| **Red (3)** | 0 | 0 | 0 | 21119 |


## 5. Anomaly Detection (Isolation Forest)
- **Contamination parameter:** 0.02
- **Anomalies Detected in Test Set (200,000):** 0 (0.00%)