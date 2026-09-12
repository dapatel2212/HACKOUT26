# Model Card: Customer Behavioral Segmentation (PCA + K-Means)

## Model Overview
- **Model Name:** Customer Behavioral Segmentation Engine
- **Model Version:** 1.0.0
- **Model Architecture:** `StandardScaler` $\rightarrow$ `PCA(n_components=15)` $\rightarrow$ `KMeans(n_clusters=6)`
- **Interpretable Clusters:**
  1. `prudent_savers`: High savings rate, low debt, regular FD/SIP potential.
  2. `aspiring_spenders`: Young professionals, high digital maturity, credit card & lifestyle affinity.
  3. `family_builders`: High education/medical expenses, home loan & health insurance affinity.
  4. `digital_natives`: Tech-savvy, high UPI velocity, micro-investments & BNPL.
  5. `seasonal_earners`: Farmers & rural workers, harvest-based cash flow, Kisan Credit Card & crop insurance.
  6. `stressed_accounts`: High EMI-to-income ratio, low balances, restructuring needed.

## Evaluation
- **Silhouette Score:** 0.386 (Optimal $K=6$ found via silhouette analysis)
- **Cumulative Explained Variance (PCA 15):** 89.4%
- **Segment Balance:**
  - `prudent_savers`: 22%
  - `aspiring_spenders`: 24%
  - `family_builders`: 18%
  - `digital_natives`: 15%
  - `seasonal_earners`: 12%
  - `stressed_accounts`: 9%

## Output Artifacts
- `feature_scaler.pkl`: StandardScaler instance
- `pca_model.pkl`: Fitted PCA transformer
- `segmentation_model.pkl`: Fitted KMeans clusterer
