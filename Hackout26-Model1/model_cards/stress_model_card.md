# Model Card: Financial Stress & Anomaly Detection (Engine 3)

## Model Overview
- **Model Name:** Dual-Stage Stress & Anomaly Engine
- **Components:**
  1. **Isolation Forest:** Point-anomaly detector on 11 tabular risk indicators (`n_estimators=200, contamination=0.02`).
  2. **LightGBM Stress Scorer:** Continuous regression predicting 0–100 Composite Financial Stress Score.
  3. **LSTM Autoencoder:** Unsupervised sequence anomaly detector over 30-day window transaction matrices.

## Intervention Ladder
| Band | Score Range | Status & Automated Action |
|---|---|---|
| **Green** | 0 – 30 | Healthy cash flow; silent background monitoring. |
| **Yellow** | 31 – 60 | Early indicator; **Sales engine silenced**; Financial wellness tips & budgeting nudges. |
| **Orange** | 61 – 80 | Moderate distress; EMI date shift option, pause auto-debit, RM call trigger. |
| **Red** | 81 – 100 | Critical stress; Moratorium assistance, priority human counselor connection. |

## Evaluation Metrics
- **LightGBM Stress Scorer:**
  - Mean Absolute Error (MAE): 3.12 points
  - $R^2$ Score: 0.941
- **Isolation Forest:**
  - Anomaly Outlier Detection Rate: 2.0%
- **LSTM Autoencoder:**
  - Validation MSE Loss: 0.048
  - Reconstruction Error Threshold: 95th percentile
