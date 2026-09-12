# AI/ML Model Specification — Banking AI for Bharat
### Member 4 scope (Engine 2 owner) + full cross-engine spec needed for integration
Covers Engine 1 (Recommendation/Segmentation), Engine 2 (NLP/Chatbot), Engine 3 (Anomaly/Stress)

---

## GOOGLE COLAB QUICK START

This Markdown file is the **specification**, not an executable training script. The three
`.ipynb` files in this folder contain the datasets, preprocessing, training, evaluation, and
artifact-export cells. Run those notebooks in the following order:

1. Open `engine1_segmentation_recommendation.ipynb` in Google Colab and choose **Runtime ->
   Run all**. It generates the specified synthetic Indian banking data locally; no upload is
   required.
2. Open `engine2_intent_classifier_indicbert.ipynb`, choose **Runtime -> Change runtime type ->
   T4 GPU**, and choose **Run all**. Banking77 is downloaded from its documented public source;
   the Hindi/Hinglish rows are defined in the notebook.
3. Open `engine3_anomaly_stress_detection.ipynb`, select a **T4 GPU**, and choose **Run all**.
   It downloads `creditcard.csv` from Kaggle when `kaggle.json` is supplied; otherwise it uses
   the documented public mirror. Its per-customer sequence data is intentionally synthetic
   because the fraud dataset has no customer identifier.

Each notebook creates an `artifacts/` directory in the Colab runtime. After all runs finish,
download it with:

```python
!zip -r banking_ai_artifacts.zip artifacts
from google.colab import files
files.download("banking_ai_artifacts.zip")
```

Upload the resulting folders into the Django backend's `ml_artifacts/` directory as described
in the deployment section below. Do not paste this Markdown into a code cell; upload the
`.ipynb` files using **File -> Upload notebook** and execute their cells.

**Expected validation:** every notebook must finish without an exception and print its final
metrics/model-card message. Keep the printed metrics and generated `model_card_*.json` files
with the submission as evidence that training and testing completed.

---

## HOW TO USE THIS DOCUMENT

Three Colab notebooks implement everything below with **real, runnable code** and **real public datasets** wherever a real dataset can exist. One place cannot use a real dataset for a structural reason (explained in Engine 1/3 sections below) — the PDF itself already anticipates this and specifies a synthetic generator, so that's what's implemented, clearly labeled as such.

| Notebook | Engine | Real dataset used |
|---|---|---|
| `engine1_segmentation_recommendation.ipynb` | Segmentation + Recommendation | Synthetic (per PDF's own spec — see note) |
| `engine2_intent_classifier_indicbert.ipynb` | IndicBERT NLU | **Banking77** (13,083 real queries, 77 intents) — PolyAI/Cambridge, CC-BY-4.0 |
| `engine3_anomaly_stress_detection.ipynb` | Isolation Forest + LSTM-AE + Stress score | **Kaggle `creditcard.csv`** (284,807 real EU card transactions, 492 frauds) + synthetic sequence layer |

---

# ENGINE 1 — SEGMENTATION + RECOMMENDATION (Member 3's models; specified here for integration since Engine 3's stress gate blocks Engine 1's output)

### 1A. Customer Segmentation (K-Means / GMM)

**1. Training objective**
Unsupervised clustering of customers into behavioral/financial segments (Student, Salaried, Family, Farmer, Shopkeeper, Gig-worker) to seed cold-start recommendations and drive the UI's segment badge.

**2. Dataset schema**
```
customer_id, age, occupation_code, monthly_income, monthly_avg_balance,
txn_count_30d, avg_txn_amount, upi_txn_ratio, emi_count_active,
salary_credit_regularity(0-1), savings_rate, festival_spend_spike(0-1),
credit_score_band, tenure_months, city_tier(1/2/3), has_loan(bool)
```

**3. Feature engineering**
- RFM-style: Recency (days since last txn), Frequency (txns/month), Monetary (avg txn value)
- Ratios normalized to [0,1]: `upi_txn_ratio`, `savings_rate`
- One-hot: `city_tier`, `occupation_code`
- StandardScaler on all continuous features **fit only on train split**

**4. Train/val/test strategy**
Unsupervised → no test labels. Use **stability validation**: cluster on 80% bootstrap resamples 10×, measure Adjusted Rand Index (ARI) between runs — ARI > 0.75 = stable segmentation. Held-out 20% used only to score silhouette on unseen customers.

**5. Leakage prevention**
- Scaler/encoder fit on train fold only, applied to held-out fold
- No target leakage possible (unsupervised) but avoid using *future* transactions (post cutoff date) in features — compute all features "as of" a fixed snapshot date

**6. Evaluation metrics**
Silhouette score, Davies-Bouldin index, Calinski-Harabasz index, cluster stability (ARI across resamples), business-sense check (segment profiles must match the 6 personas)

**7. Hyperparameters**
K-Means: `n_clusters=6, init='k-means++', n_init=20, random_state=42`
GMM: `n_components=6, covariance_type='full', n_init=5`
Chosen via elbow + silhouette sweep over k=4..10

**11. Artifacts to save**
`segmentation_kmeans.pkl`, `segmentation_gmm.pkl`, `segmentation_scaler.pkl`, `segment_profiles.json` (cluster→persona mapping + centroid stats)

---

### 1B. Recommendation Engine (Content-based + Collaborative Filtering + LightGBM LTR)

**1. Training objective**
Rank banking products (loan, FD, SIP, insurance, etc.) per customer by likelihood of positive engagement (click/apply), gated downstream by the Engine-3 stress rule.

**2. Dataset schema**
```
interactions: customer_id, product_id, event(view/click/apply/reject), timestamp
products: product_id, category, min_income, tenure_options, risk_band, tags[]
customers: (same as 1A) + segment_id (from 1A)
```

**3. Feature engineering**
- Content-based: TF-IDF over product `tags`/`description` → cosine similarity to customer's historical positive interactions
- CF: implicit feedback matrix (customer × product, confidence = event weight: view=1, click=3, apply=10) factorized via ALS
- LTR features per (customer, product) pair: CF score, content-similarity score, segment-match flag, income-eligibility flag, days-since-last-offer, recommendation-count-this-session (guardrail feature)

**4. Train/val/test strategy**
**Time-based split** (critical — not random): interactions before day T → train; T to T+15 → validation; last 15 days → test. This prevents the model from "seeing the future." Group-wise (per customer) for the ranker.

**5. Leakage prevention**
- Time-based split (never random) — random split leaks future purchase patterns into training
- CF matrix built only from train-period interactions before generating features for val/test rows
- Never include the label event itself (e.g., "applied") as a feature

**6. Evaluation metrics**
Precision@3, Recall@10, NDCG@10, MAP@10 (ranking); AUC of the binary "will engage" head if used as auxiliary task

**7. Hyperparameters**
ALS: `factors=32, regularization=0.05, iterations=20`
LightGBM Ranker: `objective='lambdarank', num_leaves=31, learning_rate=0.05, n_estimators=300, metric='ndcg'`

**11. Artifacts to save**
`tfidf_vectorizer.pkl`, `product_similarity_matrix.npz`, `als_user_factors.npy`, `als_item_factors.npy`, `ltr_ranker.txt` (LightGBM Booster), `product_catalog.json`

> **Note on real data for Engine 1:** No public dataset of real Indian banking product-interaction logs exists (would require a live bank's proprietary CRM data — this is exactly the class of data the PDF flags as privacy-sensitive under DPDP Act, which is why the plan's own Member 2 task is "Write `generate_synthetic_data.py`"). The notebook implements that generator per the PDF's own spec (500 customers × 6 segments, 6 months of transactions, Indian patterns: UPI/EMI/salary/festival spend) so the pipeline, metrics, and artifacts are all real and correct — only the underlying rows are synthetic, by design, matching the project's own data strategy.

---

# ENGINE 2 — NLP / CHATBOT (Member 4's core model)

### 2A. IndicBERT Banking Intent Classifier

**1. Training objective**
Multi-class classification of a customer utterance into one of the banking intents (10 project-specific classes: check_balance, apply_loan, track_application, report_fraud, get_recommendation, emi_calculator, product_info, restructure_emi, general_query, + one more per PDF list), for English + Hindi + code-mixed input.

**2. Dataset schema**
```
text: string (raw utterance)
label: string (intent name)
lang: string (en/hi/mixed) — used for stratification, not as a model input
```

**3. Feature engineering**
- Tokenization via IndicBERT's own WordPiece/SentencePiece tokenizer, max_len=64
- No manual feature engineering — transformer learns representations end-to-end
- Data augmentation (per PDF): synonym replacement, back-translation (HI→EN→HI), random word drop — applied **only to the training split, never val/test**

**4. Train/val/test strategy**
**Stratified split by label** (80/10/10) so every intent is represented in all three splits even with class imbalance. A **separate held-out "generalization test"** slice made only of hand-written Hindi/Hinglish utterances not seen in any augmented form checks real-world generalization beyond the base English corpus.

**5. Leakage prevention**
- Augmentation happens **after** the split, applied only to train rows — augmenting before splitting would let near-duplicate paraphrases of the same sentence appear in both train and test, inflating accuracy
- Deduplicate near-identical utterances across splits (Levenshtein/cosine threshold) before finalizing
- Stratification prevents a rare intent from being entirely absent from test (which would silently hide poor performance on it)

**6. Evaluation metrics** *(as you specified — no unseen-generator-split AUC; this is not an AI-text-detection task)*
- **Accuracy**
- **Macro-F1** (equal weight per intent — the one to optimize for, since classes are imbalanced)
- **Weighted-F1**
- **Precision / Recall per class**
- **Per-class F1** (surfaces which of the 10 intents is weakest)
- **Confusion matrix** (10×10, to see cross-intent confusion e.g. `apply_loan` vs `get_recommendation`)
- Multi-class **macro-average AUC (one-vs-rest)** is included as a supplementary ranking-quality metric, since you asked for AUC — computed via `roc_auc_score(y_true, proba, multi_class='ovr', average='macro')`. This is different from accuracy/F1: it measures how well-calibrated/separated the predicted probabilities are, not just the argmax decision.

**7. Hyperparameters** (per PDF)
Base: `ai4bharat/indic-bert`; `epochs=15, lr=2e-5, batch_size=32, weight_decay=0.01, warmup_ratio=0.1`, early stopping on val macro-F1 (patience=3)

**11. Artifacts to save**
```
intent_classifier/
├── config.json
├── model.safetensors
├── tokenizer.json, tokenizer_config.json, vocab.txt
├── special_tokens_map.json
└── label_map.json          # {0: "check_balance", 1: "apply_loan", ...}
intent_embeddings.pkl         # sentence-transformer fallback embeddings
entity_patterns.json
model_card_intent_classifier.json
```

**14. Model version & metadata**
`model_card_intent_classifier.json` contains: model name, base checkpoint, training date, dataset version hash, hyperparameters, full metrics dict, class list, framework versions (`transformers`, `torch`), and a semantic version tag (`v1.0.0`).

**15. Reproducibility**
Fix `random_state=42` everywhere (numpy, torch, transformers `set_seed`), pin `requirements.txt` versions, log exact dataset commit/download URL + row counts, save the exact train/val/test index lists (not just the split ratio) so the split is re-creatable byte-for-byte.

### 2B. Supporting NLP components (rule/embedding-based, not deep-trained, but still versioned artifacts)
- **Fallback intent matcher**: `paraphrase-multilingual-MiniLM-L12-v2` sentence embeddings + cosine similarity to per-intent centroid — used when the IndicBERT confidence < threshold (e.g., 0.55)
- **Entity extraction**: regex/gazetteer based (`entity_patterns.json`) — evaluated via precision/recall on a hand-labeled slot-filling test set (not a trained model, but versioned identically)
- **Language detection**: `fasttext lid.176.bin` (pretrained, not fine-tuned) + `langdetect` fallback — evaluated via accuracy on a per-language holdout of 12-language utterances

---

# ENGINE 3 — ANOMALY / STRESS DETECTION (Member 3's models; Member 4 consumes the stress score to gate recommendations)

### 3A. Isolation Forest — Point-wise Transaction Anomaly Detector

**1. Training objective**
Unsupervised anomaly scoring of individual transactions (unusual amount/time/merchant pattern) as an early fraud/distress signal feeding the stress score.

**2. Dataset schema (real data: Kaggle `creditcard.csv`)**
```
Time, V1..V28 (PCA-anonymized features), Amount, Class (0=normal,1=fraud; used ONLY for evaluation, never as a training feature)
```

**3. Feature engineering**
`Amount` and `Time` are scaled (`RobustScaler`, since Amount is heavy-tailed); V1–V28 are already PCA components and used as-is. No target leakage risk here since `Class` is dropped before fitting.

**4. Train/val/test strategy**
Isolation Forest is unsupervised and trained **only on the majority (normal) class** conceptually, but in practice trained on the full unlabeled train split (contamination auto-estimated) — then evaluated against the true `Class` label on a held-out test split (chronological: earlier `Time` → train, later `Time` → test, since fraud patterns drift).

**5. Leakage prevention**
- `Class` label never enters the model — used only post-hoc for scoring
- Chronological split (not random) — random shuffling would leak future fraud typologies into training, especially important since this is presented as a proxy for a genuinely time-ordered problem
- Scaler fit on train only

**6. Evaluation metrics**
Since classes are extremely imbalanced (0.17% positive): **ROC-AUC**, **PR-AUC (more informative here)**, precision/recall/F1 at the operating threshold, **false-positive rate**, **false-negative rate**, and **detection lead time** (see 3C)

**7. Hyperparameters**
`n_estimators=200, max_samples='auto', contamination=0.0017` (matched to true prevalence for calibration, though contamination is technically unsupervised in production), `random_state=42`

**11. Artifacts**: `isolation_forest.pkl`, `anomaly_scaler.pkl`, `threshold_config.json` (operating point chosen from PR curve)

---

### 3B. LSTM Autoencoder — Sequential Anomaly Detector

**1. Training objective**
Learn each customer's "normal" spending *sequence* (order + timing + amount pattern over rolling windows) and flag sequences with high reconstruction error as behavioral drift (early stress signal, distinct from single-transaction anomalies).

**2. Dataset schema**
Requires a **per-customer time-ordered transaction sequence** — `creditcard.csv` has no customer ID (anonymized for privacy), so this component structurally cannot use that dataset. Uses the same synthetic per-customer generator as Engine 1 (6 months × ~30 txns/month/customer), which is the right fit since it's built with genuine sequential structure (salary cycles, EMI dates, festival spikes) needed to train and validate a *sequence* model meaningfully.
```
customer_id, timestamp, amount, category, channel(UPI/ATM/POS/NEFT), sequence_position
```

**3. Feature engineering**
Per-timestep vector: `[log(amount+1), category_onehot, channel_onehot, hour_of_day_sin/cos, day_of_week_sin/cos, days_since_last_txn]`. Sequences windowed to fixed length (e.g., 20 txns) with padding/masking.

**4. Train/val/test strategy**
**Customer-level split** (not transaction-level) — 70% of customers' full sequences for train, 15%/15% val/test, so the model is validated on entirely unseen customers, not just unseen transactions from customers it already learned. Additionally inject synthetic "drift" (sudden EMI bounces, gambling-pattern spend, income drop) into a held-out subset to create a labeled evaluation set for lead-time measurement.

**5. Leakage prevention**
- Customer-level (not row-level) split — row-level split would let the model memorize a customer's specific pattern from train windows and "recognize" it in test windows of the same customer, overstating generalization
- Injected drift only added to eval customers, never train customers
- Scaler stats computed on train customers only

**6. Evaluation metrics**
Reconstruction error distribution (train vs. injected-drift eval set), ROC-AUC/PR-AUC of (reconstruction error → drift flag) against injected ground truth, **detection lead time**: number of days between the actual injected drift event and the first flag crossing threshold

**7. Hyperparameters**
2-layer LSTM encoder (64→32 units) + mirrored decoder, `seq_len=20, batch_size=64, epochs=50, lr=1e-3`, early stop on val reconstruction loss (patience=5)

**11. Artifacts**: `lstm_autoencoder.h5` (or `.pt`), `sequence_scaler.pkl`, `seq_threshold_config.json`

---

### 3C. Composite Financial-Stress Score + Cross-Engine Ethical Gate

**1. Training objective**
Not itself a trained model — a **documented, auditable composite rule** (per PDF's `STRESS_RECOMMENDATION_MAP`) combining: Isolation-Forest anomaly rate (30d), LSTM-AE reconstruction error, EMI-bounce count, income-drop signal, and debt-to-income ratio → GREEN/YELLOW/ORANGE/RED band.

**6. Evaluation approach (for the composite score, since it's a rule not a trained classifier)**
- Correlation of stress band with injected synthetic-distress labels (from 3B's eval set) — report as accuracy/F1 of band-vs-ground-truth-severity
- **False positives**: healthy customers wrongly flagged YELLOW+ (blocks their legitimate credit access — a real harm, must be minimized and reported)
- **False negatives**: genuinely distressed customers left GREEN (misses the safeguard — the more dangerous failure mode)
- **Detection lead time**: days between first real distress signal and band crossing YELLOW

**Cross-engine ethical rule (implemented, not just specified):**
```python
def apply_ethical_gate(stress_band: str, candidate_recommendations: list[dict]) -> list[dict]:
    """
    PDF rule: stress >= YELLOW -> block new CREDIT products,
    replace with support/restructuring interventions.
    """
    CREDIT_CATEGORIES = {"personal_loan", "credit_card", "buy_now_pay_later", "gold_loan"}
    if stress_band in ("YELLOW", "ORANGE", "RED"):
        filtered = [r for r in candidate_recommendations if r["category"] not in CREDIT_CATEGORIES]
        support = [{"category": "restructure_emi", "reason": f"stress_band={stress_band}"},
                   {"category": "financial_counseling", "reason": f"stress_band={stress_band}"}]
        return (support + filtered)[:3]   # PDF's max-3-recommendations guardrail
    return candidate_recommendations[:3]
```
This function is implemented in `ethical_guardrails.py` (shared module, engine3 notebook exports the stress band, engine1 notebook's ranker output is filtered through this before being served) and is unit-tested in the engine3 notebook against fabricated GREEN/YELLOW/ORANGE/RED cases.

---

# CROSS-CUTTING: DEPLOYMENT & DJANGO INTEGRATION (applies to all engines)

### 12. Deployment directory structure
```
banking_ai_backend/
├── ml_artifacts/
│   ├── engine1_recsys/
│   │   ├── segmentation_kmeans.pkl
│   │   ├── segmentation_scaler.pkl
│   │   ├── segment_profiles.json
│   │   ├── tfidf_vectorizer.pkl
│   │   ├── als_user_factors.npy
│   │   ├── als_item_factors.npy
│   │   ├── ltr_ranker.txt
│   │   ├── product_catalog.json
│   │   └── model_card_engine1.json
│   ├── engine2_nlp/
│   │   ├── intent_classifier/                  # HF model dir
│   │   ├── intent_embeddings.pkl
│   │   ├── entity_patterns.json
│   │   ├── lang_detect_model.bin
│   │   ├── label_map.json
│   │   └── model_card_engine2.json
│   └── engine3_risk/
│       ├── isolation_forest.pkl
│       ├── anomaly_scaler.pkl
│       ├── lstm_autoencoder.pt
│       ├── sequence_scaler.pkl
│       ├── threshold_config.json
│       ├── ethical_guardrails.py
│       └── model_card_engine3.json
├── customers/ transactions/ recommendations/ chatbot/ stress_detection/ ...  (existing Django apps)
```

### 13. How Django loads each artifact
Use a **singleton loader pattern** so models load once at process start (not per-request):
```python
# banking_ai/ml_registry.py
import joblib, json, torch
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from functools import lru_cache

ARTIFACT_ROOT = Path(__file__).resolve().parent / "ml_artifacts"

@lru_cache(maxsize=1)
def get_segmentation_model():
    return joblib.load(ARTIFACT_ROOT / "engine1_recsys" / "segmentation_kmeans.pkl")

@lru_cache(maxsize=1)
def get_intent_classifier():
    path = ARTIFACT_ROOT / "engine2_nlp" / "intent_classifier"
    tok = AutoTokenizer.from_pretrained(path)
    model = AutoModelForSequenceClassification.from_pretrained(path)
    model.eval()
    label_map = json.loads((ARTIFACT_ROOT / "engine2_nlp" / "label_map.json").read_text())
    return tok, model, label_map

@lru_cache(maxsize=1)
def get_isolation_forest():
    return joblib.load(ARTIFACT_ROOT / "engine3_risk" / "isolation_forest.pkl")

@lru_cache(maxsize=1)
def get_lstm_autoencoder():
    from engine3_risk.model_def import LSTMAutoencoder  # class def must be importable
    model = LSTMAutoencoder(...)
    model.load_state_dict(torch.load(ARTIFACT_ROOT / "engine3_risk" / "lstm_autoencoder.pt", map_location="cpu"))
    model.eval()
    return model
```
Call `get_*()` inside views/serializers/Celery tasks — `lru_cache` means the (potentially slow) disk load + GPU/CPU placement happens only once per worker process, not per HTTP request. In production with Gunicorn, use `--preload` so the cache is warmed once before forking workers.

### 14. Model version & metadata (template used for every `model_card_*.json`)
```json
{
  "model_name": "indic_bert_intent_classifier",
  "version": "1.0.0",
  "base_checkpoint": "ai4bharat/indic-bert",
  "training_date": "2026-09-12",
  "dataset": {"name": "Banking77 + Hindi augmentation", "source": "https://github.com/PolyAI-LDN/task-specific-datasets", "n_train": 0, "n_val": 0, "n_test": 0},
  "hyperparameters": {"epochs": 15, "lr": 2e-5, "batch_size": 32},
  "metrics": {"accuracy": null, "macro_f1": null, "weighted_f1": null, "macro_auc_ovr": null},
  "framework_versions": {"transformers": null, "torch": null},
  "artifact_sha256": null,
  "random_seed": 42
}
```
Each notebook fills in the `null`s at the end of the run and writes the file next to the model artifact — this is what regulators/judges mean by "model card," and it's exactly what Phase-3 final submission asks for.

### 15. Reproducibility requirements (all notebooks)
- `random_state=42` fixed for numpy/torch/sklearn/transformers
- `requirements.txt` with pinned versions written by each notebook's first cell (`pip freeze` snapshot)
- Exact dataset source URL + row counts + a content hash logged to the model card
- Train/val/test **index lists** saved (not just ratios), so re-running produces the identical split
- Colab notebook saves a timestamped run log (`training_log.json`) with every hyperparameter and metric

---

# TIME ESTIMATES (Google Colab, free-tier T4 GPU, see notebooks for live measured cells)

| Notebook | Expected wall-clock time |
|---|---|
| Engine 1 (segmentation + CF + LTR) | ~8–15 min total (CPU-bound, no GPU needed) |
| Engine 2 (IndicBERT fine-tune, 15 epochs, ~13k rows, batch 32, seq_len 64, T4 GPU) | ~20–35 min (first run adds ~3–5 min one-time model/tokenizer download) |
| Engine 3 (Isolation Forest on 284k rows + LSTM-AE 50 epochs on synthetic sequences) | ~10–20 min (Isolation Forest ~1–2 min; LSTM-AE dominates, T4 GPU) |
| **Total, run sequentially** | **~40–70 minutes**, mostly Engine 2 + Engine 3's LSTM step |

Actual time depends on Colab's assigned GPU (T4 vs. occasionally A100 on Pro) and whether you hit any Colab idle/reconnect. Each notebook prints live elapsed time per stage so you get your *actual* number, not just this estimate.
