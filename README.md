# BankBuddy AI

BankBuddy AI is an AI-powered, hyper-personalized banking platform for Bharat. It combines a multilingual banking assistant, behavioral customer segmentation, product recommendations, financial-stress detection, transaction anomaly monitoring, and ethical decision guardrails in one Django + React application.

The central product principle is **personalization without predatory selling**:

- customers receive banking products matched to their financial behavior and life stage;
- financial stress is detected from customer and transaction signals;
- credit recommendations are blocked for customers above the stress threshold;
- support, restructuring, savings, and wellness actions are shown instead;
- consent controls are explicit and marketing consent defaults to off;
- the user interface is designed for English, Hindi, Hinglish, and additional Indian languages.

## Product capabilities

### Customer experience

- JWT authentication, registration, demo mode, and protected application routes.
- Dashboard personalized to the active customer segment, financial wellness, stress band, balances, and recommendations.
- Customer profile and consent management.
- Transaction and spending insights.
- Financial wellness and stress explanation.
- Product recommendations with match scores and customer-readable reasons.
- Loan flow with ethical stress blocking.
- Multilingual AI chat for balance, loan, EMI, recommendation, fraud, restructuring, and general banking questions.
- Banking-literacy content and guided onboarding.
- Responsive React UI with charts, motion, navigation, and language switching.

### Ethical banking behavior

The recommendation pipeline ranks products first and then applies a guardrail. A customer with a composite stress score of **31 or higher** cannot receive credit or loan recommendations. The intervention ladder is:

| Stress band | Score | Product behavior |
|---|---:|---|
| Green | 0-30 | Normal personalized recommendations |
| Yellow | 31-60 | Sales engine silenced; wellness and budgeting support |
| Orange | 61-80 | EMI-date support, auto-debit pause, relationship-manager escalation |
| Red | 81-100 | Moratorium assistance and priority human-counsellor connection |

## System architecture

```text
React + Vite frontend
        |
        | Axios / JWT REST API
        v
Django + Django REST Framework backend
        |
        +-- Customer, auth, consent, loan, transaction, audit services
        +-- ML registry and ethical guardrails
        |
        +-- MongoDB-compatible operational collections
        +-- SQLite development database
        |
        +-- Engine 1: segmentation and recommendations
        +-- Engine 2: multilingual intent classification
        +-- Engine 3: anomaly and financial-stress detection
```

The backend loads checked-in model artifacts lazily through `backend/banking_ai/ml_registry.py` and `backend/banking_ai/anomaly_registry.py`. The frontend uses Zustand stores for auth, customer state, chat, onboarding, demo state, and loan state.

## Repository layout

```text
.
├── backend/                       Django API and domain applications
│   ├── banking_ai/                settings, URLs, ML registries
│   ├── customers/                 auth, profiles, customer data
│   ├── transactions/              transaction APIs and tests
│   ├── recommendations/           ranked products and guardrails
│   ├── stress_detection/          stress endpoints and LSTM definition
│   ├── chatbot/                   multilingual chat endpoint
│   ├── loan/                      loan workflow and stress blocking
│   ├── consent/                   consent preferences
│   ├── audit/                     audit records
│   └── data/                      synthetic customer and transaction data
├── frontend/                      React/Vite client
│   └── src/
│       ├── routes/                 application pages
│       ├── components/             shared UI
│       ├── services/               Axios API client
│       └── store/                  Zustand state stores
├── Hackout26-Model1/              active segmentation/ranking/stress artifacts
├── ML/                             notebooks, model cards, and Engine 2/3 artifacts
├── ML_MODEL_AUDIT_REPORT.md        artifact and integration audit
└── QUICKSTART_GUIDE.md             demo and setup notes
```

## Technologies used

### Frontend

- React 19
- Vite 8
- TanStack Router
- JavaScript/JSX
- Zustand 5
- Axios
- Tailwind CSS 4
- Framer Motion
- Recharts
- Lucide React
- i18next and `react-i18next`
- Oxlint

### Backend

- Python 3.13
- Django 4.2
- Django REST Framework
- Simple JWT
- Django CORS Headers
- MongoDB through PyMongo, with `mongomock` for local/test-compatible operation
- SQLite development database
- `python-dotenv`
- Gunicorn

### Machine learning

- NumPy and Joblib
- scikit-learn-compatible preprocessing and anomaly artifacts
- XGBoost
- LightGBM
- PyTorch
- Hugging Face Transformers and Safetensors
- Sentence Transformers for the low-confidence intent fallback
- Google Colab notebooks are provided for reproducible training workflows

## Model inventory and purpose

The active backend uses the following model components.

| Engine / model | Technique | Function in BankBuddy | Active artifact or path |
|---|---|---|---|
| Engine 1 segmentation | StandardScaler -> PCA(15) -> K-Means, 6 clusters | Assigns behavioral personas and drives cold-start personalization | `Hackout26-Model1/models/segmentation_scaler.pkl`, `segmentation_pca.pkl`, `segmentation_kmeans.pkl` |
| Engine 1 recommendation ranker | XGBoost classifier/ranker with product features | Ranks the top banking products for a customer | `Hackout26-Model1/models/recommendation_xgboost.json` |
| Recommendation fallback | Logistic Regression propensity model | Fallback when the primary ranker probability interface is unavailable | `Hackout26-Model1/models/recommendation_propensity_lr.pkl` |
| Engine 2 intent model | MuRIL/IndicBERT-style transformer fine-tuned for banking intents | Understands multilingual and code-mixed customer chat | `ML/engine2/intent_classifier/` |
| Intent fallback | Multilingual sentence embeddings + centroid similarity | Handles low-confidence transformer predictions | `ML/engine2/intent_embeddings.pkl` |
| Engine 3 stress scorer | LightGBM regression | Produces a continuous composite financial-stress score from 0-100 | `Hackout26-Model1/models/stress_lgbm_compatible.txt` |
| Transaction anomaly detector | BankBuddy-native Isolation Forest plus domain score | Detects unusual transaction amount, timing, channel, EMI, bounce, and balance signals | `ML/engine3/artifacts/engine3_risk/bankbuddy_*` |
| Sequence detector | LSTM autoencoder | Detects reconstruction error and behavioral drift in recent transaction sequences | `ML/engine3/artifacts/engine3_risk/lstm_autoencoder_best.pt` |
| Ethical guardrail | Deterministic stress-band policy | Removes unsafe credit recommendations and selects support actions | `ML/engine3/artifacts/engine3_risk/ethical_guardrails.py` |

## Model metrics

Metrics below are reported from the checked-in model cards and evaluation artifacts. Classification metrics are **not mathematically applicable** to unsupervised clustering, ranking, regression, or reconstruction tasks. “Unseen-generator-split AUC” is also not a defined evaluation for the intent, segmentation, recommendation, or LightGBM stress tasks.

### Engine 1: customer segmentation

The active artifact is an unsupervised six-cluster model. It has no ground-truth class labels, so classification metrics cannot be calculated for this model. The available evaluation is reported through cluster-separation, stability, and dimensionality-reduction metrics.

| Metric | Result |
|---|---:|
| Overall AUC | Not applicable - K-Means has no supervised target |
| Unseen-generator-split AUC | Not applicable - generator-split classification is not the evaluation protocol |
| Macro-F1 | Not applicable - no ground-truth persona labels |
| Confusion matrix | Not applicable - no ground-truth persona labels |
| Silhouette score | 0.386 |
| Davies-Bouldin index | 0.812 |
| PCA explained variance | 89.4% |
| Cluster stability ARI | 0.488 in the separate Engine 1 artifact family |

The six personas are `prudent_savers`, `aspiring_spenders`, `family_builders`, `digital_natives`, `seasonal_earners`, and `stressed_accounts`.

### Engine 1: product recommendation ranker

Recommendation is evaluated as a ranking problem, not as binary classification. The active XGBoost ranker is therefore reported with ranking metrics. A separate propensity fallback was evaluated as a binary classifier and has its own accuracy, F1, and confusion matrix below.

| Metric | Result |
|---|---:|
| Overall AUC | Not applicable to the active pairwise ranker; the binary propensity fallback ROC-AUC is 0.884 |
| Unseen-generator-split AUC | Not calculated; the evaluation uses time-based ranking splits rather than a generator split |
| Macro-F1 | Not applicable to the active ranker; the propensity fallback F1 score is 0.821 |
| Confusion matrix | Not applicable to the active ranking objective; the propensity fallback matrix is shown below |
| NDCG@5 | 0.892 |
| NDCG@3 | 0.865 |
| Precision@3 | 0.841 |
| MRR | 0.914 |
| Catalog coverage | 100% across 13 products |
| Inference latency | < 8 ms on CPU |

The binary propensity fallback has accuracy **0.835** and ROC-AUC **0.884**. Its persisted evaluation matrix is:

| Actual \ Predicted | Negative | Positive |
|---|---:|---:|
| Negative | 121,733 | 47,152 |
| Positive | 24,110 | 407,005 |

The active XGBoost classifier-style adapter was also evaluated in the production report with accuracy **0.9198**, F1 **0.9458**, and this binary matrix:

| Actual \ Predicted | Negative | Positive |
|---|---:|---:|
| Negative | 132,301 | 36,584 |
| Positive | 11,525 | 419,590 |

The separate `ML/engine1/artifacts/engine1_recsys` model card describes another LightGBM ranking run on 500 synthetic customers and 7,503 interactions. Its metrics (`Precision@3` 0.4599, `Recall@3` 0.9484, `NDCG@10` 0.8504, `MAP@10` 0.8109) must not be merged with the active `Hackout26-Model1` metrics.

### Engine 2: multilingual banking intent classifier

The model is based on `google/muril-base-cased` and maps Banking77-derived data plus Hindi/Hinglish seed examples to project-specific banking intents.

| Split | Overall AUC (macro OvR) | Macro-F1 | Accuracy | Confusion matrix |
|---|---:|---:|---:|---|
| Validation | 0.97606 | 0.83472 | 0.92776 | `ML/engine2/confusion_matrix_validation.png` |
| Test | 0.93285 | 0.84588 | 0.94373 | `ML/engine2/confusion_matrix_test.png` |
| Unseen-generator split | Not part of this task | Not part of this task | Not part of this task | The project evaluates a held-out Hindi/Hinglish generalization slice instead; see `ML/engine2/confusion_matrix_hindi_generalization.png` |

The model card stores the validation and test scalar metrics. The confusion matrices are exported as PNG artifacts: `confusion_matrix_validation.png`, `confusion_matrix_test.png`, and `confusion_matrix_hindi_generalization.png`; numeric matrix arrays are not stored separately in the checked-in model card. The model uses the transformer when confidence is at least 0.55 and can fall back to multilingual sentence-embedding centroids for lower-confidence queries.

### Engine 3: LightGBM financial-stress scorer

This is a regression model that predicts a continuous 0-100 stress score. Its primary metrics are MAE, RMSE, and R². The additional stress-band classification evaluation supplies accuracy, macro-F1, and a four-class confusion matrix.

| Metric | Result |
|---|---:|
| Overall AUC | Not applicable to the continuous regression objective |
| Unseen-generator-split AUC | Not calculated; the model uses an 80,000/20,000 labeled benchmark split |
| Macro-F1 | 0.4805 for derived Green/Yellow/Orange/Red stress bands |
| Confusion matrix | Available for derived stress bands; shown below |
| MAE | 4.708 |
| RMSE | 5.870 |
| R² | 0.942 |
| Stress-band accuracy | 0.9687 |
| Evaluation rows | 20,000 |

`stress_lgbm_compatible.txt` is the artifact loaded by the live registry. The older `stress_lgbm.txt` artifact is retained as deprecated because it is not readable by the installed LightGBM runtime. If the compatible artifact is unavailable, the backend explicitly falls back to its documented formula-based stress score.

Stress-band confusion matrix, with classes ordered as **Green, Yellow, Orange, Red**:

| True \ Predicted | Green | Yellow | Orange | Red |
|---|---:|---:|---:|---:|
| Green | 17,265 | 0 | 0 | 0 |
| Yellow | 313 | 0 | 0 | 0 |
| Orange | 0 | 0 | 0 | 313 |
| Red | 0 | 0 | 0 | 2,109 |

### Engine 3: transaction anomaly and sequence models

These models provide anomaly signals to the stress scorer and ethical recommendation gate.

| Model | Overall AUC | Unseen-generator-split AUC | Macro-F1 | Confusion matrix | Other results |
|---|---:|---:|---:|---|---|
| BankBuddy-native Isolation Forest | 0.8164 test ROC-AUC | Chronological BankBuddy test, not a generator split | Not persisted in the artifact; threshold selection used validation F1 | Evaluation image: `ML/engine3/artifacts/engine3_risk/isolation_forest_eval.png` | Test PR-AUC 0.8906; 56,853 train, 6,000 validation, 10,000 test rows |
| Kaggle proxy Isolation Forest | 0.9345 ROC-AUC | Chronological fraud test, not a generator split | Not persisted in the artifact; evaluation used ROC-AUC/PR-AUC and operating-rate metrics | Evaluation image: `ML/engine3/artifacts/engine3_risk/isolation_forest_eval.png` | PR-AUC 0.0279; 1.3968% false-positive rate; 50% false-negative rate |
| LSTM autoencoder | 0.5944 drift ROC-AUC | Synthetic customer-level drift split: 80 drift customers evaluated | Not applicable to reconstruction scoring; threshold-based drift detection was used | Evaluation image: `ML/engine3/artifacts/engine3_risk/lstm_ae_eval.png` | PR-AUC 0.7118; 80/80 drift customers detected; sequence length 20 |

The native Isolation Forest is the model used for BankBuddy transaction scoring. The Kaggle model is a benchmark/proxy because the Kaggle fraud dataset has no customer identifier and does not represent the application's transaction schema. The LSTM evaluates recent sequences using reconstruction error and feeds that signal into stress and guardrail decisions.

## Datasets used for training

### Engine 1: segmentation and recommendations

The Engine 1 training pipeline uses a **synthetic Indian banking dataset**, because real Indian banking product-interaction logs are proprietary and privacy-sensitive.

- 500 synthetic customers.
- Six behavioral segments.
- Six months of customer and transaction behavior.
- 7,503 recorded product interactions in the separate Engine 1 artifact family.
- Features include income, balances, RFM behavior, UPI usage, EMI burden, savings rate, digital maturity, spending categories, and product eligibility.
- Product catalog contains 13 banking products.
- The backend demo generator creates Indian-style salary, UPI, ATM, POS, NACH, EMI, utility, medical, grocery, festival, investment, and insurance transactions.

### Engine 2: intent classification

- **Banking77**, published by PolyAI/LDN task-specific datasets and sourced from `https://github.com/PolyAI-LDN/task-specific-datasets`.
- Banking77 examples are remapped to 10 project banking intents.
- Hindi and Hinglish seed utterances are added for multilingual and code-mixed behavior.
- Persisted split sizes: 14,093 training, 1,315 validation, and 1,315 test examples.
- Token limit: 64; training uses 15 epochs, learning rate `2e-5`, and batch size 32.

### Engine 3: stress and anomaly detection

Engine 3 combines multiple datasets because each component solves a different problem:

1. **Kaggle `mlg-ulb/creditcardfraud`**: 284,807 anonymized European card transactions and 492 fraud cases. Used as a fraud/anomaly benchmark, not as the production customer schema.
2. **Synthetic per-customer sequence generator**: 500 customers, six segments, and six months of behavior. Required because `creditcard.csv` has no customer identifier. Used for LSTM sequence drift evaluation.
3. **BankBuddy synthetic transaction schema**: used to train and evaluate the native transaction anomaly artifact. It contains 56,853 training rows, 6,000 validation rows, and 10,000 test rows with fields such as amount, date/time, debit flag, bounce flag, balance, category, channel, and EMI status.
4. **Labeled benchmark stress data**: 100,000 labeled records are used by the compatible LightGBM stress training workflow, with 20,000 held out for evaluation. The repository does not claim these labels are production-reviewed; approved production labels should be used for a production re-evaluation.

## API surface

The Django URL configuration exposes:

| Prefix | Responsibility |
|---|---|
| `/api/health/` | Service health |
| `/api/auth/` | Registration, login, JWT refresh |
| `/api/customers/` | Customer profiles and customer state |
| `/api/transactions/` | Transaction history and insights |
| `/api/recommendations/` | Ranked products and explanations |
| `/api/chat/` | AI banking chat |
| `/api/stress/` | Stress and anomaly scores |
| `/api/consent/` | Consent preferences |
| `/api/audit/` | Audit records |
| `/api/loan/` | Loan workflow and stress gate |

The frontend API client reads `VITE_API_URL` and sends the JWT access token as a bearer token. In local development the default API base is `http://localhost:8000/api`.

## Local setup

### Prerequisites

- Python 3.13 or a compatible Python environment.
- Node.js and npm.
- A MongoDB-compatible service for the full backend flow, or the repository's local/test-compatible configuration.

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver
```

The API is then available at `http://localhost:8000`.

### Frontend

```powershell
cd frontend
npm install
$env:VITE_API_URL = "http://localhost:8000/api"
npm run dev
```

The Vite client is then available at the URL printed by Vite, normally `http://localhost:5173`.

For a production build:

```powershell
npm run build
```

For linting:

```powershell
npm run lint
```

### Demo data

The backend includes synthetic customer and transaction generators under `backend/data/`. The demo flow is designed to show how recommendations change between segments such as `prudent_savers`, `seasonal_earners`, and `stressed_accounts`.

## Reproducible model training

The notebooks in `ML/` contain preprocessing, training, evaluation, and artifact-export code:

```text
ML/engine1_segmentation_recommendation.ipynb
ML/engine2_intent_classifier_indicbert.ipynb
ML/engine3_anomaly_stress_detection.ipynb
```

Run them in that order in Google Colab when retraining is required. Engine 2 and Engine 3 use a GPU runtime for practical training time. Each notebook exports artifacts and a model card containing the dataset, split, hyperparameters, and evaluation results. Random seed `42` is used throughout the documented pipelines.

## Known limitations and responsible-use notes

- Engine 1 metrics come from more than one checked-in artifact family. The active backend uses the `Hackout26-Model1` family; metrics must not be mixed across families.
- Production-reviewed financial-stress labels are not included. The current stress model is validated on a labeled benchmark and must be re-evaluated with approved production data before real credit decisions.
- The BankBuddy-native anomaly model is synthetic-data validated. The Kaggle fraud model is a proxy and is not a substitute for domain-specific fraud validation.
- Some default feature values are used when a customer record does not provide every model feature.
- Recommendation explanations currently contain customer-readable templates; the `shap_explanation` field should not be interpreted as raw SHAP output.
- Demo mode creates a local demo token and must not be treated as production authentication.
- This project is a decision-support and hackathon prototype. It should not be used for unattended lending, denial, or financial-health decisions without human review, consent, monitoring, and regulatory validation.

## Further documentation

- `ML_MODEL_AUDIT_REPORT.md` - detailed artifact, metric, and integration audit.
- `ML/AI_ML_Model_Specification.md` - training specifications and reproducibility notes.
- `QUICKSTART_GUIDE.md` - demo flow and practical startup guidance.
- `IMPLEMENTATION_GUIDE.md` - frontend implementation and integration guidance.
- `INTEGRATION_PLAN.md` - planned cross-layer integration.
