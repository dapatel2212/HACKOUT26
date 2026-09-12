# 🏦 BANKING AI — COMPLETE PROJECT ANALYSIS
### For AI-Assisted Development | Full System Understanding Document
### Version: 1.0 | Target: Hackathon Prototype → Production-Ready MVP

---

## TABLE OF CONTENTS

1. [What Is This Project?](#1-what-is-this-project)
2. [Problem Statement](#2-problem-statement)
3. [Core Solution Modules](#3-core-solution-modules)
4. [Full System Architecture](#4-full-system-architecture)
5. [Tech Stack — Every Layer](#5-tech-stack--every-layer)
6. [Data Architecture & MongoDB Schema](#6-data-architecture--mongodb-schema)
7. [AI/ML Models — How They Work](#7-aiml-models--how-they-work)
8. [Backend API Reference](#8-backend-api-reference)
9. [Frontend Component Map](#9-frontend-component-map)
10. [Data Flow — Request to Response](#10-data-flow--request-to-response)
11. [Ethical AI System](#11-ethical-ai-system)
12. [i18n — 12 Language System](#12-i18n--12-language-system)
13. [Demo Accounts & Test Data](#13-demo-accounts--test-data)
14. [Deployment Architecture](#14-deployment-architecture)
15. [How AI Models Should Code This](#15-how-ai-models-should-code-this)

---

---

## 1. WHAT IS THIS PROJECT?

**Name:** BankBuddy / Banking AI (working title)

**Type:** AI-powered personalized banking assistant for Indian customers

**Target Users:** The 400M+ underbanked and underserved Indians across Tier 2, 3, and rural regions — farmers, gig workers, shop owners, salaried employees, families — who speak Hindi, Tamil, Bengali, Telugu, and 8 other regional languages.

**Core Promise:**
> A banking AI that understands *who you are*, speaks *your language*, recommends *what you actually need*, and protects you from financial harm — ethically, transparently, and in real time.

**What it does in plain English:**
- A customer opens the app in their language (Hindi, Tamil, etc.)
- The AI looks at their last 6 months of transaction data
- It figures out what kind of customer they are (farmer, gig worker, etc.)
- It recommends the right financial products (loans, insurance, SIPs) *for their specific situation*
- If they're financially stressed, it blocks harmful loan offers and instead offers help
- A multilingual chatbot lets them talk to the bank in their own language
- Every AI decision is explained in plain words ("We recommend this because you save ₹15K/month")
- All data use requires explicit consent — nothing is done without permission

---

## 2. PROBLEM STATEMENT

Indian banks serve hundreds of millions of customers but their digital tools are:

| Problem | Impact |
|---|---|
| English-only interfaces | Excludes 90%+ of rural/vernacular users |
| Generic product push | Irrelevant recommendations, customer distrust |
| No stress awareness | Predatory loans to financially vulnerable people |
| Black-box AI | No explanation for why products are recommended |
| No consent control | Customers don't know what data is being used |
| One-size-fits-all UX | A farmer and a gig worker see the same dashboard |

**This project solves all six problems simultaneously.**

---

## 3. CORE SOLUTION MODULES

The system has **3 AI engines + 1 ethical guardrail layer** working together:

---

### MODULE 1 — Behavioral Segmentation + Recommendation Engine

**What it does:**
Analyzes 6 months of transaction data → clusters customers into 6 behavioral segments → ranks financial products by relevance for each customer.

**6 Customer Segments:**

| Segment ID | Name | Profile | Key Products |
|---|---|---|---|
| `prudent_savers` | Prudent Savers | Consistent salary, high savings rate, low spend | FD, SIP, Tax-Saver MF, Senior Citizen Scheme |
| `aspiring_spenders` | Aspiring Spenders | Young, rising income, high discretionary spend | Credit Card, Personal Loan, Travel Insurance |
| `family_builders` | Family Builders | Married with children, education + health spends | Child Insurance, Edu Loan, Health Insurance, Home Loan |
| `digital_natives` | Digital Natives | Heavy UPI usage, subscription services, tech spend | Credit Line, BNPL, SIP, Term Insurance |
| `seasonal_earners` | Seasonal Earners (Farmers) | Irregular income, crop-cycle patterns, rural | Kisan Credit, Weather Insurance, Crop Loan, Cattle Insurance |
| `stressed_accounts` | Stressed Accounts | EMI bounces, declining balance, salary delays | EMI Restructure, Refinance, Financial Counseling ONLY |

**12 Financial Products in the catalog:**

```
savings_account, fd, credit_card,
personal_loan, home_loan, car_loan,
health_insurance, life_insurance,
sip, mutual_fund, education_loan,
kisan_credit, weather_insurance
```

---

### MODULE 2 — Financial Stress Detection Engine

**What it does:**
Monitors transaction patterns in real time → detects financial distress signals → classifies stress level → triggers appropriate intervention (never harmful loan offers).

**4 Stress Levels:**

| Level | Score | Color | Action |
|---|---|---|---|
| Healthy | 0–30 | 🟢 GREEN | Allow all product recommendations |
| Caution | 31–60 | 🟡 YELLOW | Allow loans but show caution flag |
| At Risk | 61–80 | 🟠 ORANGE | Only allow restructure/refinance |
| Critical | 81–100 | 🔴 RED | Only counseling + restructure. **ZERO new loans** |

**8 Stress Signals Monitored:**

```
1. emi_bounce_count           — EMI bounces in last 3 months
2. emi_burden_ratio           — total monthly EMI / monthly income
3. balance_min_ratio          — minimum balance / average balance
4. balance_trend_slope        — linear trend of daily balances (declining = bad)
5. spending_velocity          — recent monthly spend vs 6-month avg
6. salary_delay_days          — actual salary date vs expected date
7. credit_utilization_ratio   — used credit / total credit limit
8. num_loan_inquiries         — credit bureau check frequency (desperation signal)
```

---

### MODULE 3 — Multilingual Chatbot (NLP Engine)

**What it does:**
Accepts text/voice input in 12 Indian languages → detects language → classifies intent → extracts entities → generates a personalized, contextualized response in the customer's language.

**10 Conversation Intents:**

```
check_balance        — "Mera balance kya hai" / "What's my balance"
apply_loan           — "Mujhe loan chahiye" / "I need a loan"
track_application    — Status of existing loan application
report_fraud         — Report suspicious transactions
get_recommendation   — Ask for product suggestions
emi_calculator       — Calculate EMI for a loan amount
product_info         — Learn about a product (FD, SIP, etc.)
restructure_emi      — Request EMI restructuring (for stressed users)
general_query        — Fallback for unrecognized inputs
```

**4 Entities Extracted:**

```
AMOUNT    — ₹X, X rupaye, X rupees
DATE      — "agle mahine", "next month", "15 tarikh"
PRODUCT   — loan, insurance, FD, SIP / karza, bima, mauka (Hindi)
TENURE    — "6 mahine", "1 saal", "2 years"
```

---

### ETHICAL GUARDRAIL LAYER

**7 Non-Negotiable Rules (cannot be overridden by any code):**

| Rule | What It Prevents |
|---|---|
| No loan to stressed customer (score > 50) | Predatory lending |
| Max 3 recommendations per session | Recommendation fatigue / manipulation |
| 30-day cooldown between same product recommendations | Repeated pressure tactics |
| No urgency language ("expires tonight", "last chance") | Dark patterns |
| No pre-checked consent boxes | Illegal consent harvesting |
| Every recommendation needs SHAP explanation | Black-box AI |
| Data must stay in India (RBI compliance) | Regulatory violation |

---

---

## 4. FULL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER (Mobile / Web)                              │
│              12 Languages | Voice + Text | PWA Offline                  │
└────────────────────────────┬────────────────────────────────────────────┘
                             │  HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND — React.js (Vercel)                          │
│                                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  Onboarding │  │  Dashboard   │  │   Chatbot    │  │ Loan Wizard │  │
│  │  + Consent  │  │  (Segment-   │  │   (Voice +   │  │  (7-Step    │  │
│  │             │  │   Aware)     │  │    Text)     │  │   Conv.)    │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  Wellness   │  │   Literacy   │  │   Consent    │  │  WhatsApp   │  │
│  │  Score +    │  │   Micro-     │  │  Management  │  │  Simulator  │  │
│  │   Badges    │  │   Lessons    │  │  (DPDP Act)  │  │  (Alt Chan) │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │
│                                                                          │
│  State: Zustand | i18n: 12 languages | Animations: Framer Motion        │
└────────────────────────────┬────────────────────────────────────────────┘
                             │  JWT Auth + REST API
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   BACKEND — Django REST (Render)                         │
│                                                                          │
│  ┌───────────┐  ┌────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │   Auth    │  │  Customer  │  │ Transactions  │  │   Consent +    │  │
│  │ JWT + OTP │  │  + Segment │  │  + Insights   │  │  Audit Trail   │  │
│  └───────────┘  └────────────┘  └───────────────┘  └────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    AI ENGINE LAYER                                │  │
│  │                                                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │  │
│  │  │ Recommend.   │  │   Stress     │  │   Chatbot /          │   │  │
│  │  │ Engine       │  │  Detector    │  │   NLP Engine         │   │  │
│  │  │ (XGBoost)    │  │ (LightGBM + │  │ (IndicBERT +         │   │  │
│  │  │              │  │  LSTM)       │  │  Templates)          │   │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │  │
│  │         │                 │                      │               │  │
│  │         └─────────────────┴──────────────────────┘               │  │
│  │                           │                                      │  │
│  │              ┌────────────▼────────────┐                         │  │
│  │              │  ETHICAL GUARDRAIL LAYER │                        │  │
│  │              │  (Blocks before output)  │                        │  │
│  │              └────────────┬────────────┘                         │  │
│  │                           │  SHAP Explainer                      │  │
│  │              ┌────────────▼────────────┐                         │  │
│  │              │  AUDIT TRAIL LOGGER      │                        │  │
│  │              └──────────────────────────┘                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Background: Celery + Redis (stress scores every 6h, segments daily)    │
└────────────────────────────┬────────────────────────────────────────────┘
                             │  pymongo
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              DATABASE — MongoDB Atlas (Mumbai Region)                    │
│                                                                          │
│  customers | transactions | recommendations | chat_sessions              │
│  stress_alerts | consent_logs | audit_trail                             │
│                                                                          │
│  500 customers | 6 months transaction history | Real Indian patterns     │
└─────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ML MODELS (Colab → Django /ml_models/)                │
│                                                                          │
│  feature_scaler.pkl        segmentation_model.pkl (K-Means, K=6)        │
│  pca_model.pkl             recommendation_xgb.json (XGBoost Ranker)     │
│  propensity_model.pkl      isolation_forest.pkl (Anomaly)               │
│  stress_scorer.pkl         lstm_autoencoder.h5 (Sequence Anomaly)       │
│  intent_classifier/        intent_embeddings.pkl                         │
│  entity_patterns.json      lang_detect_model.bin (fasttext)             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

---

## 5. TECH STACK — EVERY LAYER

### Frontend

| Tool | Version | Purpose |
|---|---|---|
| React.js (Vite) | Latest | UI framework |
| Tailwind CSS | 3.x | Styling, mobile-first |
| react-router-dom | 6.x | Client-side routing |
| Zustand | 4.x | Global state management |
| Axios | 1.x | HTTP requests + JWT interceptors |
| Recharts | 2.x | Charts (pie, line, radar, bar) |
| Framer Motion | 10.x | Animations + transitions |
| i18next + react-i18next | Latest | 12-language i18n system |
| @heroicons/react | 2.x | Icon library |
| react-webcam | Latest | Video KYC |
| Workbox | Latest | Service worker / PWA |

### Backend

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| Django | 4.2 | Web framework |
| Django REST Framework | 3.14 | REST API layer |
| django-cors-headers | Latest | Allow React frontend |
| djangorestframework-simplejwt | Latest | JWT authentication |
| pymongo | 4.x | MongoDB driver (no ORM) |
| Celery | 5.x | Background task queue |
| Redis | 7.x | Message broker for Celery |
| gunicorn | Latest | Production WSGI server |
| django-ratelimit | Latest | API rate limiting |

### AI/ML

| Tool | Purpose |
|---|---|
| scikit-learn | Feature scaling, PCA, K-Means clustering |
| XGBoost | Product recommendation ranking |
| LightGBM | Stress score prediction |
| TensorFlow/Keras | LSTM autoencoder for sequence anomaly |
| SHAP | Model explainability (feature contributions) |
| sentence-transformers | Fallback intent classification |
| transformers (HuggingFace) | IndicBERT fine-tuning for intent classification |
| fasttext | Language detection (12 Indian languages) |
| langdetect | Fallback language detector |
| pandas, numpy | Data processing and feature engineering |
| joblib | Model serialization (.pkl files) |

### Database

| Component | Details |
|---|---|
| MongoDB Atlas | M0 free tier, Mumbai region (ap-south-1) |
| 7 Collections | customers, transactions, recommendations, chat_sessions, stress_alerts, consent_logs, audit_trail |
| Driver | pymongo (direct, no ODM like MongoEngine) |
| Helper module | `mongodb_helper.py` wraps all DB operations |

### Infrastructure

| Service | Purpose |
|---|---|
| Vercel | Frontend deployment (automatic CI/CD) |
| Render | Backend + Celery worker deployment |
| Render Redis | Message broker for background tasks |
| MongoDB Atlas | Database (cloud-managed) |
| Google Drive | ML model file sharing between team members |
| Google Colab | ML model training (GPU runtime) |

---

---

## 6. DATA ARCHITECTURE & MONGODB SCHEMA

### Collection: `customers`

```json
{
  "_id": "ObjectId",
  "customer_id": "CUST_001",
  "name": "Ramesh Kumar",
  "phone": "+91-9876543210",
  "email": "ramesh@example.com",
  "dob": "1985-04-12",
  "pan": "ABCDE1234F",
  "aadhaar_masked": "XXXX-XXXX-1234",
  "language": "hi",
  "tier": 3,
  "segment": "seasonal_earners",
  "income_monthly": 18000,
  "existing_products": ["savings_account", "kisan_credit"],
  "stress_score": 22,
  "stress_level": "GREEN",
  "wellness_score": 61,
  "consent": {
    "transaction_analysis": true,
    "health_monitoring": true,
    "ai_chat": true,
    "life_events": false,
    "marketing": false
  },
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### Collection: `transactions`

```json
{
  "_id": "ObjectId",
  "customer_id": "CUST_001",
  "date": "ISODate",
  "amount": 4500,
  "type": "debit",
  "category": "emi",
  "description": "Home Loan EMI - HDFC",
  "channel": "NACH",
  "merchant": "HDFC Bank",
  "balance_after": 12300,
  "is_salary": false,
  "is_emi": true,
  "is_bounced": false
}
```

**Transaction categories:**
```
salary, emi, upi_transfer, cash_withdrawal, food,
medical, education, utilities, entertainment, fuel,
insurance_premium, investment, festival_spend, other
```

### Collection: `recommendations`

```json
{
  "_id": "ObjectId",
  "customer_id": "CUST_001",
  "generated_at": "ISODate",
  "segment": "seasonal_earners",
  "stress_level": "GREEN",
  "recommendations": [
    {
      "rank": 1,
      "product_id": "weather_insurance",
      "product_name": "Weather Insurance",
      "score": 0.87,
      "shap_explanation": {
        "features": [
          {"name": "seasonal_income", "contribution": 0.23, "text_en": "Your income depends on seasons", "text_hi": "Aapki kamai mausam par nirbhar hai"},
          {"name": "no_insurance", "contribution": 0.18, "text_en": "You have no existing insurance", "text_hi": "Aapke paas koi bima nahi hai"},
          {"name": "crop_spend_detected", "contribution": 0.15, "text_en": "We see regular crop-related purchases", "text_hi": "Hume fasal se judi kharidaari dikh rahi hai"}
        ],
        "match_score_pct": 87
      },
      "trigger": "crop_season_trigger",
      "status": "pending",
      "shown_at": "ISODate",
      "customer_response": null
    }
  ],
  "guardrail_checks_passed": true,
  "session_count": 2
}
```

### Collection: `chat_sessions`

```json
{
  "_id": "ObjectId",
  "customer_id": "CUST_001",
  "session_id": "SESSION_ABC123",
  "language": "hi",
  "messages": [
    {
      "role": "user",
      "text": "Mujhe loan chahiye",
      "intent": "apply_loan",
      "entities": {"PRODUCT": "loan"},
      "timestamp": "ISODate"
    },
    {
      "role": "bot",
      "text": "Badhaiya! Aap ₹50,000 tak ka loan le sakte hain...",
      "quick_replies": ["Aage badhein", "EMI calculator"],
      "action_link": "/loan/apply",
      "timestamp": "ISODate"
    }
  ],
  "conversation_state": {
    "current_flow": "loan_application",
    "loan_flow_step": 2,
    "selected_product": "personal_loan"
  },
  "created_at": "ISODate"
}
```

### Collection: `stress_alerts`

```json
{
  "_id": "ObjectId",
  "customer_id": "CUST_001",
  "computed_at": "ISODate",
  "stress_score": 72,
  "stress_level": "ORANGE",
  "signals_triggered": ["emi_bounce_count", "balance_trend_slope"],
  "intervention_offered": "emi_restructure",
  "customer_responded": false,
  "is_active": true
}
```

### Collection: `consent_logs`

```json
{
  "_id": "ObjectId",
  "customer_id": "CUST_001",
  "data_type": "transaction_analysis",
  "action": "grant",
  "granted_at": "ISODate",
  "expiry": "ISODate",
  "version": "2.1",
  "ip_address": "masked",
  "is_active": true
}
```

### Collection: `audit_trail`

```json
{
  "_id": "ObjectId",
  "customer_id": "CUST_001",
  "action_type": "recommendation_generated",
  "model_version": "xgb_ranker_v1.0",
  "input_features_hash": "sha256_hash",
  "output": {"product": "weather_insurance", "score": 0.87},
  "guardrails_applied": ["stress_check", "cooldown_check"],
  "guardrail_result": "passed",
  "timestamp": "ISODate"
}
```

---

---

## 7. AI/ML MODELS — HOW THEY WORK

### 7.1 Feature Engineering Pipeline

This runs **identically** in both Google Colab (training) and Django (inference). Features must match exactly — same column names, same order, same scaler.

```python
def engineer_features(customer_id, transactions_df):
    """
    Input:  customer_id + 6 months of transaction DataFrame
    Output: feature vector dict (28 features)
    """
    features = {}

    # === RFM Features ===
    features['recency_days']     = days_since_last_transaction(transactions_df)
    features['frequency']        = len(transactions_df)
    features['monetary_total']   = transactions_df['amount'].sum()

    # === Spending Category Features ===
    features['food_spend_ratio']      = category_ratio(transactions_df, 'food')
    features['medical_spend_ratio']   = category_ratio(transactions_df, 'medical')
    features['emi_spend_ratio']       = category_ratio(transactions_df, 'emi')
    features['education_spend_ratio'] = category_ratio(transactions_df, 'education')

    # === Financial Health Features ===
    features['emi_burden_ratio']   = total_emi(transactions_df) / monthly_income
    features['income_stability']   = cv_of_salary_credits(transactions_df)
    features['savings_rate']       = (credits - debits) / credits
    features['digital_maturity']   = upi_count / total_transactions
    features['balance_volatility'] = std(daily_balances)

    # === Stress-Specific Features ===
    features['emi_bounce_count']   = count_bounced_emis(transactions_df, months=3)
    features['balance_min_ratio']  = min(daily_balances) / mean(daily_balances)
    features['balance_trend']      = linear_slope(daily_balances)
    features['spending_velocity']  = recent_spend / avg_6m_spend
    features['salary_delay_days']  = actual_salary_date - expected_salary_date

    # === Life Stage Signals ===
    features['has_medical_spend']   = bool(medical_transactions)
    features['has_education_spend'] = bool(education_transactions)
    features['has_crop_patterns']   = detect_crop_seasonality(transactions_df)

    return features
```

---

### 7.2 Segmentation Model (K-Means)

**How it works:**

```
Raw transactions
      │
      ▼
Feature Engineering (28 features)
      │
      ▼
StandardScaler (saved as feature_scaler.pkl)
      │
      ▼
PCA → 15 components (saved as pca_model.pkl)
      │
      ▼
K-Means (K=6, saved as segmentation_model.pkl)
      │
      ▼
Cluster label → Segment name mapping:
  Cluster 0 → "prudent_savers"
  Cluster 1 → "aspiring_spenders"
  Cluster 2 → "family_builders"
  Cluster 3 → "digital_natives"
  Cluster 4 → "seasonal_earners"
  Cluster 5 → "stressed_accounts"
```

**Training details:**
- Dataset: 500 synthetic customers
- K selection: Elbow method (K=3 to K=10) + Silhouette score
- Best K ≈ 6 (Silhouette ≈ 0.42)
- Evaluation: t-SNE visualization to confirm cluster separation

**Django inference code:**

```python
def predict_segment(features_dict):
    features_array = np.array([list(features_dict.values())])
    scaled = scaler.transform(features_array)
    pca_transformed = pca.transform(scaled)
    cluster_id = kmeans.predict(pca_transformed)[0]
    segment_map = {
        0: 'prudent_savers', 1: 'aspiring_spenders',
        2: 'family_builders', 3: 'digital_natives',
        4: 'seasonal_earners', 5: 'stressed_accounts'
    }
    return segment_map[cluster_id]
```

---

### 7.3 Recommendation Engine (XGBoost Ranker)

**How it works:**

```
Customer features (28-dim vector)
      +
Product features (per product):
  category, risk_level, min_income, target_segments[],
  target_life_stages[], typical_amount_range, tenure_range
      │
      ▼ concat → (customer + product) combined feature vector
      │
XGBoost Ranker (objective='rank:pairwise', eval='ndcg@5')
      │
      ▼ score for each (customer, product) pair
      │
Sort descending → Top 5 candidates
      │
      ▼
Ethical Guardrail Filter
      │
Return Top 3 to user
```

**Training data construction:**
- Positive samples: customer already owns the product
- Negative samples: customer doesn't own it + segment mismatch
- Combined feature = `concat(customer_features, product_features)`

**Model hyperparameters:**
```python
model = xgb.XGBRanker(
    objective='rank:pairwise',
    eval_metric='ndcg@5',
    eta=0.1,
    max_depth=6,
    n_estimators=500,
    subsample=0.8,
    colsample_bytree=0.8
)
```

**Fallback model:** Logistic Regression propensity scorer (used when XGBoost confidence < threshold).

---

### 7.4 Stress Detection Engine (3-Layer System)

**Layer 1 — Isolation Forest (Anomaly Detection)**
```python
model = IsolationForest(n_estimators=200, contamination=0.02)
# Returns: -1 = anomaly (stressed), 1 = normal
```

**Layer 2 — LightGBM Stress Scorer**
```python
model = LGBMRegressor(
    num_leaves=31, learning_rate=0.05, n_estimators=500
)
# Returns: float 0–100 (stress score)
```

**Layer 3 — LSTM Autoencoder (Sequence Anomaly)**
```
Architecture:
  Input: 30-day transaction window (normalized amounts)
  Encoder: LSTM(128) → LSTM(64) → Dense(32)
  Decoder: Dense(64) → LSTM(128) → Output
  Loss: MSE reconstruction error
  
High reconstruction error = unusual transaction patterns = stress signal
```

**Combining the 3 layers:**
```python
def compute_final_stress_score(features, transactions_30d):
    # Layer 1: anomaly flag
    anomaly = isolation_forest.predict([features])[0]  # -1 or 1

    # Layer 2: base stress score
    lgbm_score = stress_scorer.predict([features])[0]  # 0-100

    # Layer 3: sequence reconstruction error
    lstm_error = lstm_autoencoder.reconstruction_error(transactions_30d)
    lstm_boost = min(lstm_error * 20, 20)  # caps at +20 points

    # Combine
    final_score = lgbm_score + (10 if anomaly == -1 else 0) + lstm_boost
    return min(final_score, 100)
```

---

### 7.5 NLP Intent Classification (IndicBERT)

**Architecture:**

```
User input (any of 12 languages)
      │
      ▼
fasttext lang_detect_model.bin → detected language code (hi, ta, bn...)
      │
      ▼
IndicBERT (ai4bharat/indic-bert) fine-tuned
  - 10 intent classes
  - 5000+ training utterances (Hindi + English primary)
  - Epochs: 15, lr: 2e-5, batch: 32
  - Target: accuracy > 90%, F1 > 0.88
      │
      ▼
If confidence < 0.60 → fallback to sentence-transformer
  (paraphrase-multilingual-MiniLM-L12-v2)
  Pre-computed intent embeddings → cosine similarity → nearest intent
      │
      ▼
Classified intent + confidence score
```

**Entity extraction (regex-based, fast for hackathon):**

```python
import re

patterns = {
    'AMOUNT': r'₹\s*[\d,]+|[\d,]+\s*(rupaye|rupees|रुपये|rs\.?)',
    'PRODUCT': r'\b(loan|insurance|FD|SIP|karza|bima)\b',
    'DATE': r'\b(agle mahine|next month|\d{1,2} tarikh|tomorrow)\b',
    'TENURE': r'\b(\d+)\s*(mahine|months?|saal|years?)\b'
}

def extract_entities(text):
    entities = {}
    for entity_type, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            entities[entity_type] = match.group()
    return entities
```

---

### 7.6 SHAP Explainability System

**How SHAP works in this system:**

```python
from shap import TreeExplainer

class RecommendationExplainer:
    def __init__(self):
        self.explainer = TreeExplainer(xgb_recommendation_model)

    def explain(self, customer_features, product_features):
        combined = np.concatenate([customer_features, product_features])
        shap_values = self.explainer.shap_values(combined)
        return shap_values  # contribution of each feature to the score

    def format_for_customer(self, shap_values, language='en'):
        """Convert SHAP values to human-readable text"""
        explanations = []
        top_features = sorted(
            zip(feature_names, shap_values),
            key=lambda x: abs(x[1]),
            reverse=True
        )[:5]

        for feature_name, contribution in top_features:
            text = FEATURE_TEXT_MAP[feature_name][language]
            direction = 'positive' if contribution > 0 else 'negative'
            explanations.append({
                'text': text,
                'contribution': round(contribution, 2),
                'direction': direction
            })
        return explanations
```

**Response format sent to frontend:**

```json
{
  "product": "weather_insurance",
  "score": 0.87,
  "match_score_pct": 87,
  "shap_explanation": [
    {"text_en": "Your income depends on seasons", "text_hi": "Aapki kamai mausam par nirbhar hai", "contribution": 0.23, "direction": "positive"},
    {"text_en": "You have no existing insurance", "text_hi": "Aapke paas koi bima nahi hai", "contribution": 0.18, "direction": "positive"},
    {"text_en": "Moderate risk appetite", "contribution": -0.05, "direction": "negative"}
  ]
}
```

---

### 7.7 Life Event Detector

Scans transaction patterns for signals of major life changes:

```python
class LifeEventDetector:
    def detect_marriage_signals(self, transactions):
        signals = {
            'jewelry_shop': transactions.query("merchant.str.contains('Tanishq|jewelry|gold')").amount.sum() > 50000,
            'hall_booking': transactions.query("description.str.contains('Hall|mandap|banquet')").any(),
            'household_purchases': transactions.query("category == 'furniture'").count() > 3
        }
        confidence = sum(signals.values()) / len(signals)
        return {'event': 'marriage', 'confidence': confidence, 'products': ['home_loan', 'joint_account', 'family_insurance']}

    def detect_new_child_signals(self, transactions):
        signals = {
            'hospital_payment': transactions.query("category == 'medical' and amount > 10000").any(),
            'baby_products': transactions.query("merchant.str.contains('FirstCry|baby|infant')").any(),
            'pediatrician': transactions.query("description.str.contains('pediatric|child|baby')").any()
        }
        confidence = sum(signals.values()) / len(signals)
        return {'event': 'new_child', 'confidence': confidence, 'products': ['sukanya_samriddhi', 'child_insurance', 'education_loan']}
```

---

### 7.8 Financial Wellness Scorer

Weighted multi-factor score (0–100):

```python
class WellnessScorer:
    WEIGHTS = {
        'emergency_fund':    0.30,
        'insurance':         0.20,
        'debt_health':       0.25,
        'savings_rate':      0.15,
        'goal_progress':     0.10
    }

    def compute_wellness_score(self, customer):
        scores = {
            'emergency_fund': min(savings / (6 * monthly_expenses), 1.0),
            'insurance': self.insurance_score(customer),
            'debt_health': 1.0 - min(emi_burden_ratio, 1.0),
            'savings_rate': min(monthly_savings / monthly_income / 0.20, 1.0),
            'goal_progress': self.goal_progress_score(customer)
        }
        weighted = sum(scores[k] * self.WEIGHTS[k] for k in scores)
        return round(weighted * 100, 1)  # 0–100

    def get_badge(self, score):
        if score >= 80: return 'Excellent'
        if score >= 60: return 'Good'
        if score >= 40: return 'Attention Needed'
        return 'At Risk'
```

---

---

## 8. BACKEND API REFERENCE

### Base URL: `http://localhost:8000/api/` (dev) | `https://your-app.onrender.com/api/` (prod)

### Authentication

All endpoints (except auth/) require: `Authorization: Bearer <JWT_ACCESS_TOKEN>`

```
POST /api/auth/register/          → Register new customer
POST /api/auth/login/             → Returns {access, refresh} JWT tokens
GET  /api/auth/profile/           → Current user profile
POST /api/auth/token/refresh/     → Refresh access token
```

### Customer

```
GET  /api/customers/{id}/                     → Full customer profile
PUT  /api/customers/{id}/                     → Update language / preferences
GET  /api/customers/{id}/segment/             → Current segment + description
```

### Transactions

```
GET  /api/transactions/?customer_id=X&from=Y&to=Z     → Transaction list
GET  /api/transactions/insights/{customer_id}/         → Spending chart data
GET  /api/transactions/spending-categories/{id}/       → Category breakdown
```

**Response shape for insights:**
```json
{
  "monthly_spend": [{"month": "2024-03", "amount": 24500}, ...],
  "category_breakdown": {"food": 0.28, "emi": 0.32, "utilities": 0.15, ...},
  "savings_rate": 0.22,
  "income_trend": "stable"
}
```

### Recommendations

```
GET  /api/recommendations/{customer_id}/           → Top 3 recommendations + SHAP
POST /api/recommendations/{id}/accept/             → Customer accepted recommendation
POST /api/recommendations/{id}/reject/             → Customer rejected ("Not interested")
GET  /api/recommendations/{id}/explain/            → Detailed SHAP explanation
```

### Stress Detection

```
GET  /api/stress/score/{customer_id}/              → {score, level, signals, intervention}
GET  /api/stress/alerts/{customer_id}/             → Active stress alerts
POST /api/stress/intervention/{id}/respond/        → Accept / decline restructure offer
```

**Response shape for stress score:**
```json
{
  "score": 72,
  "level": "ORANGE",
  "signals_triggered": ["emi_bounce_count", "balance_trend_slope"],
  "intervention": {
    "type": "emi_restructure",
    "message_en": "We noticed 2 EMI bounces. Would you like to shift your EMI date?",
    "message_hi": "Humne 2 EMI bounce dekhe hain. Kya aap EMI date badalna chahenge?",
    "actions": ["shift_date", "restructure", "talk_to_rm"]
  }
}
```

### Chatbot

```
POST /api/chat/message/                          → Send message, get bot response
GET  /api/chat/history/{customer_id}/            → Conversation history
WebSocket: ws://localhost:8000/ws/chat/{id}/     → Real-time (Django Channels)
```

**Request:**
```json
{"customer_id": "CUST_001", "message": "Mujhe loan chahiye", "language": "hi"}
```

**Response:**
```json
{
  "response": "Badhaiya! Aap ₹50,000 tak ka Personal Loan le sakte hain.",
  "intent": "apply_loan",
  "quick_replies": ["Aage badhein", "EMI calculator", "Aur options?"],
  "action_link": "/loan/apply",
  "product_card": {
    "product": "personal_loan",
    "amount": 50000,
    "emi": 4321,
    "tenure_months": 12
  }
}
```

### Loan

```
GET  /api/loan/eligibility/{customer_id}/        → {pre_approved_amount, rate, max_tenure}
POST /api/loan/apply/                            → Submit loan application
GET  /api/loan/status/{application_id}/          → Application status
POST /api/loan/kyc/{application_id}/             → KYC verification
POST /api/loan/emi-calculate/                    → {amount, tenure, rate} → {emi, total_interest}
```

### Consent

```
GET  /api/consent/{customer_id}/                → All consent statuses
POST /api/consent/{customer_id}/grant/          → Grant consent for data_type
POST /api/consent/{customer_id}/revoke/         → Revoke consent
GET  /api/consent/data-download/               → Export all customer data (DPDP)
POST /api/consent/delete-request/             → Right to erasure request
```

### Wellness & Life Events

```
GET /api/wellness/score/{customer_id}/          → {score, badge, breakdown}
GET /api/wellness/breakdown/{customer_id}/      → Component scores + improvement tips
GET /api/wellness/trend/{customer_id}/          → 6-month historical trend
GET /api/wellness/badges/{customer_id}/         → Earned gamification badges
GET /api/life-events/{customer_id}/             → Detected life events + confidence
POST /api/life-events/{id}/feedback/            → "Not accurate" feedback
```

### Financial Literacy

```
GET  /api/literacy/lessons/                      → All 5 lessons
GET  /api/literacy/lessons/{customer_id}/        → Contextual lessons (based on activity)
POST /api/literacy/quiz/submit/                  → Quiz answers → points earned
GET  /api/literacy/progress/{customer_id}/       → Lesson progress + level
```

### Audit

```
POST /api/audit/log/                             → Log any AI decision (internal use)
GET  /api/audit/decisions/{customer_id}/         → All AI decisions for this customer
```

---

---

## 9. FRONTEND COMPONENT MAP

```
src/
├── pages/
│   ├── OnboardingPage.jsx          ← Language select → OTP → Consent → Segment
│   ├── DashboardPage.jsx           ← Segment-aware dashboard (main page)
│   ├── ChatbotPage.jsx             ← Full-screen chatbot view
│   ├── LoanPage.jsx                ← 7-step loan wizard
│   ├── ProfilePage.jsx             ← Customer info + segment + stress indicator
│   ├── ConsentPage.jsx             ← DPDP consent management
│   ├── WellnessPage.jsx            ← Score + radar chart + badges
│   └── LiteracyPage.jsx            ← Financial literacy lessons
│
├── components/
│   ├── Common/
│   │   ├── LanguageSwitcher.jsx    ← Globe dropdown with 12 flags
│   │   ├── Layout.jsx              ← Sidebar (desktop) + BottomNav (mobile)
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── ProtectedRoute.jsx      ← Redirects to login if no JWT
│   │
│   ├── Dashboard/
│   │   ├── BalanceCard.jsx         ← Quick balance widget
│   │   ├── SpendingChart.jsx       ← Recharts pie/donut chart
│   │   ├── EMIList.jsx             ← Upcoming EMIs list
│   │   ├── RecommendationCard.jsx  ← Product card + SHAP explain + CTA
│   │   ├── LifeEventCard.jsx       ← Detected life event + suggestions
│   │   └── QuickActions.jsx        ← Segment-specific action buttons
│   │
│   ├── Chatbot/
│   │   ├── ChatBubble.jsx          ← Floating chat button (bottom-right)
│   │   ├── ChatWindow.jsx          ← Full chat interface
│   │   ├── ChatMessage.jsx         ← User / bot message bubble
│   │   ├── ProductCardInChat.jsx   ← Product mini-card in bot message
│   │   ├── EMISliderInChat.jsx     ← Interactive EMI slider in chat
│   │   ├── QuickReplies.jsx        ← Horizontal chip scroll
│   │   ├── VoiceInput.jsx          ← Mic button + Web Speech API
│   │   └── WhatsAppSimulator.jsx   ← WA-skinned version of same chatbot
│   │
│   ├── Loan/
│   │   ├── LoanWizard.jsx          ← 7-step wizard container
│   │   ├── ProductSelector.jsx     ← Step 1: card grid
│   │   ├── AmountSlider.jsx        ← Step 2: visual slider + EMI preview
│   │   ├── TenureSelector.jsx      ← Step 3: radio cards
│   │   ├── PersonalDetails.jsx     ← Step 4: pre-filled form
│   │   ├── IncomeProof.jsx         ← Step 5: upload / net banking
│   │   ├── KYCStep.jsx             ← Step 6: OTP / webcam / upload
│   │   └── LoanConfirmation.jsx    ← Step 7: summary + success
│   │
│   ├── Stress/
│   │   ├── StressAlertBanner.jsx   ← YELLOW / ORANGE / RED banners
│   │   └── StressScoreGauge.jsx    ← Animated circular gauge
│   │
│   ├── Wellness/
│   │   ├── WellnessScoreCircle.jsx ← Large animated score
│   │   ├── WellnessRadarChart.jsx  ← Recharts radar (5 dimensions)
│   │   ├── WellnessActionItems.jsx ← Improvement checklist
│   │   ├── WellnessTrend.jsx       ← 6-month line chart
│   │   └── WellnessBadges.jsx      ← Gamification badges
│   │
│   ├── Onboarding/
│   │   ├── LanguagePicker.jsx      ← 12-flag grid (first screen)
│   │   ├── OTPVerify.jsx           ← Phone + OTP input
│   │   ├── ConsentScreen.jsx       ← Granular consent (all OFF by default)
│   │   └── SegmentPicker.jsx       ← 7 customer type cards
│   │
│   └── Consent/
│       ├── ConsentToggle.jsx       ← Individual toggle with description
│       ├── ConsentHistory.jsx      ← Timestamped consent log
│       └── DataActions.jsx         ← Download + Delete buttons
│
├── store/
│   ├── authStore.js                ← JWT token + user state
│   ├── customerStore.js            ← Profile + segment + stress level
│   ├── chatStore.js                ← Chat messages + conversation state
│   └── uiStore.js                  ← Language, loading states, modals
│
├── services/
│   ├── api.js                      ← Axios instance + JWT interceptors
│   ├── authService.js              ← login(), logout(), refresh()
│   ├── customerService.js          ← getProfile(), updatePrefs()
│   ├── recommendationService.js    ← getRecommendations(), accept(), reject()
│   ├── chatService.js              ← sendMessage(), getHistory()
│   ├── loanService.js              ← apply(), getEligibility(), calculateEMI()
│   ├── stressService.js            ← getScore(), getAlerts()
│   └── consentService.js           ← grant(), revoke(), download()
│
└── i18n/
    ├── en.json    ← English (base)
    ├── hi.json    ← Hindi (PRIMARY — most detailed)
    ├── ta.json    ← Tamil
    ├── bn.json    ← Bengali
    ├── te.json    ← Telugu
    ├── mr.json    ← Marathi
    ├── gu.json    ← Gujarati
    ├── kn.json    ← Kannada
    ├── ml.json    ← Malayalam
    ├── pa.json    ← Punjabi
    ├── or.json    ← Odia
    └── as.json    ← Assamese
```

---

---

## 10. DATA FLOW — REQUEST TO RESPONSE

### Flow A: Customer opens Dashboard

```
1. React DashboardPage mounts
2. useEffect → customerService.getProfile(customerId)
   → GET /api/customers/{id}/
   → Django fetches from MongoDB customers collection
   → Returns: name, segment, language, stress_level

3. Parallel API calls (Promise.all):
   → GET /api/transactions/insights/{id}/       → Recharts spending data
   → GET /api/recommendations/{id}/             → 3 product cards + SHAP
   → GET /api/stress/score/{id}/                → Stress banner decision
   → GET /api/life-events/{id}/                 → Life event card (if any)

4. Zustand customerStore updated with all data

5. Dashboard renders:
   - widgetOrder determined by segment (Zustand)
   - StressAlertBanner shows if level = ORANGE or RED
   - RecommendationCards render with SHAP data
   - SpendingChart renders with transaction insights
```

### Flow B: User sends chatbot message in Hindi

```
1. User types "Mujhe loan chahiye" or uses mic (Web Speech API → hi-IN)
2. ChatStore adds message to local state (optimistic UI)
3. chatService.sendMessage({customer_id, message: "Mujhe loan chahiye", language: "hi"})
   → POST /api/chat/message/

4. Django chatbot/views.py receives request:
   a. Calls NLP engine:
      → fasttext detects language: "hi"
      → IndicBERT classifies intent: "apply_loan" (confidence: 0.94)
      → Regex extracts entities: {PRODUCT: "loan"}
   b. Loads conversation state from MongoDB chat_sessions
   c. Calls recommendationService to check eligibility
   d. Calls ethical guardrails → check stress score (22 = GREEN → ALLOW)
   e. Fetches pre-approved loan amount from customer profile
   f. Fills template: chatbot/templates/apply_loan.json [hi]
      → "Badhaiya! Aap ₹50,000 tak ka loan le sakte hain. EMI sirf ₹4,321/mahina"
   g. Generates quick_replies: ["Aage badhein", "EMI calculator", "Aur options?"]
   h. Creates action_link: "/loan/apply"
   i. Saves to MongoDB chat_sessions
   j. Logs to audit_trail

5. Response arrives at React frontend
6. ChatMessage component renders bot bubble with:
   - Text in Hindi
   - QuickReplies chips
   - [Aage badhein] button → navigates to LoanPage
```

### Flow C: Recommendation generation (full pipeline)

```
1. GET /api/recommendations/{customer_id}/

2. Django recommendations/views.py:
   a. Verify customer consent:
      → GET consent_logs collection → "transaction_analysis": true
      → If false → return 403 + "Consent required" message

   b. Fetch last 6 months transactions from MongoDB

   c. Call RecommendationEngine.get_customer_features(customer_id):
      → engineer_features(customer_id, transactions_df)
      → Returns: 28-dimensional feature vector

   d. Call predict_segment(features):
      → scale → PCA → KMeans.predict() → "seasonal_earners"

   e. Get candidate products:
      → All 12 products - products customer already owns
      → Filter by eligibility (min_income, age requirements)
      → Remaining candidates: 9 products

   f. rank_products(features, candidates):
      → For each candidate: concat(customer_features, product_features)
      → XGBoost Ranker scores each pair
      → Sort descending → Top 5

   g. Apply ethical guardrails (EthicalGuardrails.apply_all_checks):
      → check_stress_lock(): stress_score=22 → GREEN → PASS
      → check_cooldown(): weather_insurance not shown in 30 days → PASS
      → check_recommendation_limit(): 0 shown this session → PASS
      → check_dark_pattern(): no urgency text in response → PASS
      → check_consent(): consent granted → PASS
      → All checks PASS → proceed

   h. Generate SHAP explanations for top 3:
      → TreeExplainer.shap_values(combined_features)
      → format_for_customer(shap_values, language='hi')
      → Returns: [{text_hi, contribution, direction}, ...]

   i. Store in MongoDB recommendations collection
   j. Log to audit_trail

3. Return to frontend:
   [
     {rank:1, product:"weather_insurance", score:0.87, shap:[...]},
     {rank:2, product:"kisan_credit", score:0.79, shap:[...]},
     {rank:3, product:"fd", score:0.71, shap:[...]}
   ]

4. React RecommendationCard renders 3 cards
   → "Why this?" button shows SHAP bars
   → [Apply Now] → navigates to LoanPage
```

---

---

## 11. ETHICAL AI SYSTEM

### EthicalGuardrails class (Member 4 builds, Member 2 wires into all AI endpoints)

```python
class EthicalGuardrails:

    STRESS_PRODUCT_RULES = {
        'GREEN':  'allow_all',
        'YELLOW': 'allow_with_caution_flag',
        'ORANGE': 'allow_restructure_refinance_only',
        'RED':    'counseling_and_restructure_only_no_loans'
    }

    def check_stress_lock(self, customer, recommendation):
        if customer['stress_score'] > 50:
            if recommendation['category'] in ['loan', 'credit_card', 'credit_line']:
                return {'blocked': True, 'reason': 'Stress score too high for new credit products'}
        return {'blocked': False}

    def check_cooldown(self, customer_id, product_id):
        last_shown = recommendations_collection.find_one({
            'customer_id': customer_id,
            'recommendations.product_id': product_id,
            'generated_at': {'$gte': datetime.now() - timedelta(days=30)}
        })
        if last_shown:
            return {'blocked': True, 'reason': 'Same product shown within 30 days'}
        return {'blocked': False}

    def check_recommendation_limit(self, session_id):
        session = chat_sessions_collection.find_one({'session_id': session_id})
        if session and session.get('recommendations_shown', 0) >= 3:
            return {'blocked': True, 'reason': 'Max 3 recommendations per session reached'}
        return {'blocked': False}

    def check_dark_pattern(self, response_text):
        dark_patterns = ['expires tonight', 'last chance', 'limited time', 'act now', 'hurry']
        for pattern in dark_patterns:
            if pattern.lower() in response_text.lower():
                return {'blocked': True, 'reason': f'Dark pattern detected: {pattern}'}
        return {'blocked': False}

    def apply_all_checks(self, customer, recommendation, session_id, response_text):
        checks = [
            self.check_stress_lock(customer, recommendation),
            self.check_cooldown(customer['customer_id'], recommendation['product_id']),
            self.check_recommendation_limit(session_id),
            self.check_dark_pattern(response_text)
        ]
        blocked = [c for c in checks if c['blocked']]
        if blocked:
            return {'allowed': False, 'reasons': [c['reason'] for c in blocked]}
        return {'allowed': True}
```

### Consent Middleware (every AI endpoint checks this first)

```python
class ConsentRequired:
    def __call__(self, request, customer_id, data_type_required):
        consent = consent_logs_collection.find_one({
            'customer_id': customer_id,
            'data_type': data_type_required,
            'is_active': True
        })
        if not consent:
            return Response({'error': 'Consent required', 'data_type': data_type_required}, status=403)
        # Log consent check
        audit_trail_collection.insert_one({
            'action_type': 'consent_checked',
            'customer_id': customer_id,
            'data_type': data_type_required,
            'result': 'granted',
            'timestamp': datetime.now()
        })
```

---

---

## 12. i18n — 12 LANGUAGE SYSTEM

### Supported Languages

| Code | Language | Script | Status |
|---|---|---|---|
| `hi` | Hindi | Devanagari | PRIMARY — fully translated |
| `en` | English | Latin | COMPLETE |
| `ta` | Tamil | Tamil | Core intents |
| `bn` | Bengali | Bengali | Core intents |
| `te` | Telugu | Telugu | Core intents |
| `mr` | Marathi | Devanagari | Core intents |
| `gu` | Gujarati | Gujarati | Core intents |
| `kn` | Kannada | Kannada | Core intents |
| `ml` | Malayalam | Malayalam | Core intents |
| `pa` | Punjabi | Gurmukhi | Core intents |
| `or` | Odia | Odia | Basic greetings |
| `as` | Assamese | Assamese | Basic greetings |

### i18next Setup in React

```javascript
// main.jsx
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './i18n/en.json';
import hi from './i18n/hi.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi }, ... },
  lng: 'hi',          // default: Hindi
  fallbackLng: 'en',  // fallback if key missing
  interpolation: { escapeValue: false }
});

// Usage in any component:
const { t, i18n } = useTranslation();
<h1>{t('dashboard.greeting', { name: customer.name })}</h1>
// en.json: "dashboard.greeting": "Welcome, {{name}}!"
// hi.json: "dashboard.greeting": "Swagat hai, {{name}}!"
```

### Banking Terms Glossary (for translation consistency)

| English | Hindi | Tamil |
|---|---|---|
| EMI | महीने की किस्त (mahine ki kist) | மாத தவணை |
| Fixed Deposit | फिक्स्ड डिपॉजिट | நிலையான வைப்பு |
| SIP | SIP (explain in context) | SIP |
| Loan | कर्ज़ / ऋण | கடன் |
| Insurance | बीमा (bima) | காப்பீடு |
| Balance | बैलेंस / शेष राशि | இருப்பு |
| Interest Rate | ब्याज दर | வட்டி விகிதம் |

---

---

## 13. DEMO ACCOUNTS & TEST DATA

### 5 Pre-Built Demo Accounts

| Account | Login | Segment | Language | Stress | Key Scenario to Demo |
|---|---|---|---|---|---|
| Ramesh Kumar | farmer@demo.com / Demo@123 | seasonal_earners | Hindi | GREEN (22) | Crop recs + Kisan Credit + Weather Insurance |
| Priya Sharma | salaried@demo.com / Demo@123 | prudent_savers | Tamil | GREEN (18) | SIP + Health Insurance recommendations |
| Suresh Patel | shop@demo.com / Demo@123 | digital_natives | Hindi | YELLOW (45) | OD increase + CA account recommendations |
| Arjun Singh | gig@demo.com / Demo@123 | aspiring_spenders | English | GREEN (30) | Micro-insurance + emergency loan |
| Meena Devi | stressed@demo.com / Demo@123 | stressed_accounts | Marathi | ORANGE (72) | ⚠️ ALL new loans BLOCKED → Restructure offered |

### Synthetic Data Characteristics

```
Total customers:       500
Segments:              6 segments × ~80 customers each
Transaction history:   6 months per customer
Indian patterns embedded:
  - UPI transactions (PhonePe, GPay, Paytm merchants)
  - Festival spending spikes (Diwali Oct, Holi Mar, Dussehra)
  - EMI payments (NACH channel, consistent dates)
  - Salary credits (25th–1st of month, salary-tagged)
  - Crop-seasonal patterns (Ramesh: Kharif + Rabi cycles)
  - Medical spikes + baby product purchases (life events)
Stress signals:
  - 10% customers have deliberate stress patterns
  - 5 customers have ORANGE+ stress levels
```

---

---

## 14. DEPLOYMENT ARCHITECTURE

### Frontend — Vercel

```bash
# Build
npm run build
# Deploy
vercel deploy --prod
# Environment variable
VITE_API_URL=https://banking-ai-backend.onrender.com/api/
```

### Backend — Render

```yaml
# Procfile
web: gunicorn banking_ai.wsgi:application --bind 0.0.0.0:$PORT --timeout 120
worker: celery -A banking_ai worker -l info -Q default
beat: celery -A banking_ai beat -l info
```

```
Environment Variables on Render:
  MONGODB_URI          = mongodb+srv://<user>:<pass>@cluster.mongodb.net/banking_ai
  SECRET_KEY           = django_secret_key
  DEBUG                = False
  ALLOWED_HOSTS        = banking-ai-backend.onrender.com
  REDIS_URL            = redis://red-xxxxxxx.onrender.com:6379
  CORS_ALLOWED_ORIGINS = https://banking-ai.vercel.app
```

### Celery Background Tasks Schedule

```python
CELERY_BEAT_SCHEDULE = {
    'compute-stress-scores': {
        'task': 'stress_detection.tasks.compute_stress_for_all',
        'schedule': crontab(minute=0, hour='*/6')    # Every 6 hours
    },
    'update-segments': {
        'task': 'recommendations.tasks.update_all_segments',
        'schedule': crontab(minute=0, hour=3)         # Daily at 3 AM
    },
    'check-cooldowns': {
        'task': 'recommendations.tasks.expire_cooldowns',
        'schedule': crontab(minute=0)                  # Every hour
    },
    'generate-wellness-trend': {
        'task': 'wellness.tasks.record_daily_scores',
        'schedule': crontab(minute=0, hour=23)         # Daily at 11 PM
    }
}
```

### MongoDB Atlas Config

```
Cluster:       M0 (free tier)
Region:        ap-south-1 (Mumbai) — RBI data localization requirement
Database:      banking_ai
Backup:        Enabled (Atlas free backups)
Network:       Whitelist Render IP (0.0.0.0/0 for hackathon)
```

---

---

## 15. HOW AI MODELS SHOULD CODE THIS

This section is specifically written for AI coding assistants (Claude, Copilot, Cursor, etc.) to understand the project's patterns and conventions so generated code fits the system without conflicts.

---

### 15.1 Code Generation Rules

**Django Backend:**

```
1. NEVER use Django ORM models — the project uses pymongo directly.
   BAD:  Customer.objects.filter(customer_id=id)
   GOOD: customers_col.find_one({"customer_id": id})

2. ALWAYS use mongodb_helper.py for DB operations, not direct pymongo calls.
   from utils.mongodb_helper import get_collection
   customers_col = get_collection('customers')

3. ALL API views must:
   a. Check JWT authentication (use @jwt_required decorator)
   b. Check customer consent (use ConsentRequired middleware)
   c. Log to audit_trail after every AI decision
   d. Apply ethical guardrails before returning any recommendation

4. ML model inference must match training pipeline EXACTLY:
   - Same feature names, same order, same scaler
   - Always scale before predicting (never skip scaler.transform)
   - Never re-train models in inference code
```

**React Frontend:**

```
1. ALL user-facing text must go through useTranslation():
   BAD:  <h1>Welcome back!</h1>
   GOOD: <h1>{t('dashboard.welcome')}</h1>
   
2. ALL API calls go through services/ files, never direct axios in components.
   BAD:  axios.get(`/api/customers/${id}`)
   GOOD: customerService.getProfile(id)

3. ALL state goes through Zustand stores:
   BAD:  const [customer, setCustomer] = useState(null)
   GOOD: const customer = useCustomerStore(state => state.customer)

4. NEVER put hardcoded Indian text in JSX — always use i18n keys.

5. Loading states and error handling are REQUIRED on every API call:
   const { data, loading, error } = useApiCall(customerService.getProfile, id)
```

**Feature Engineering:**

```
1. The feature_engineering.py in Django MUST produce identical output
   to the Colab notebook. Test by running same customer through both
   and comparing the feature vector values.

2. Feature names must be a fixed ordered list — never use dict.keys()
   which could change order between Python versions.
   Use: FEATURE_NAMES = ['recency_days', 'frequency', ...] as a constant.

3. Handle edge cases explicitly:
   - Customer with 0 transactions → return zero-filled feature vector
   - Customer with < 30 days of data → set LSTM features to 0
   - Missing salary credit → salary_delay_days = 0 (not error)
```

---

### 15.2 Common Patterns to Follow

**Standard Django API view structure:**

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from utils.mongodb_helper import get_collection
from utils.audit import log_decision
from ai.ethical_guardrails import EthicalGuardrails

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request, customer_id):
    # 1. Verify consent
    consent = ConsentRequired.check(customer_id, 'transaction_analysis')
    if not consent['granted']:
        return Response({'error': 'Consent required'}, status=403)

    # 2. Run AI pipeline
    engine = RecommendationEngine()
    features = engine.get_customer_features(customer_id)
    segment = engine.predict_segment(features)
    candidates = engine.get_candidate_products(customer_id)
    ranked = engine.rank_products(features, candidates)

    # 3. Apply guardrails
    customer = get_collection('customers').find_one({'customer_id': customer_id})
    guardrails = EthicalGuardrails()
    final_recs = []
    for rec in ranked[:5]:
        check = guardrails.apply_all_checks(customer, rec, request.session.session_key, '')
        if check['allowed']:
            final_recs.append(rec)
        if len(final_recs) == 3:
            break

    # 4. Generate SHAP explanations
    explainer = RecommendationExplainer()
    for rec in final_recs:
        rec['shap'] = explainer.explain(features, rec['product_features'])

    # 5. Audit log
    log_decision(customer_id, 'recommendation_generated', {'count': len(final_recs)})

    # 6. Return
    return Response({'recommendations': final_recs, 'segment': segment})
```

**Standard React service function:**

```javascript
// services/recommendationService.js
import api from './api';

export const recommendationService = {
  async getRecommendations(customerId) {
    try {
      const res = await api.get(`/recommendations/${customerId}/`);
      return { data: res.data, error: null };
    } catch (err) {
      return { data: null, error: err.response?.data?.error || 'Failed to load recommendations' };
    }
  },

  async accept(recommendationId) {
    return api.post(`/recommendations/${recommendationId}/accept/`);
  },

  async reject(recommendationId) {
    return api.post(`/recommendations/${recommendationId}/reject/`);
  }
};
```

**Standard Zustand store:**

```javascript
// store/customerStore.js
import { create } from 'zustand';
import { customerService } from '../services/customerService';

const useCustomerStore = create((set) => ({
  customer: null,
  segment: null,
  stressLevel: 'GREEN',
  loading: false,
  error: null,

  fetchCustomer: async (customerId) => {
    set({ loading: true, error: null });
    const { data, error } = await customerService.getProfile(customerId);
    if (data) {
      set({ customer: data, segment: data.segment, stressLevel: data.stress_level, loading: false });
    } else {
      set({ error, loading: false });
    }
  },

  updateLanguage: (lang) => set(state => ({
    customer: { ...state.customer, language: lang }
  }))
}));

export default useCustomerStore;
```

---

### 15.3 File Creation Order for AI Coding

**When starting from scratch, build in this order to avoid import errors:**

```
BACKEND BUILD ORDER:
1. banking_ai/settings.py          (MongoDB, JWT, CORS, Celery config)
2. utils/mongodb_helper.py          (all DB calls go through this)
3. utils/audit.py                   (log_decision() function)
4. ai/feature_engineering.py        (same as Colab — test it matches)
5. ai/segmentation.py               (load PKL, predict_segment())
6. ai/recommendation_engine.py      (load XGB, rank_products())
7. ai/stress_detector.py            (3-layer stress computation)
8. ai/ethical_guardrails.py         (all 7 rules)
9. ai/shap_explainer.py             (explain() + format_for_customer())
10. nlp/intent_classifier.py        (IndicBERT + fallback)
11. nlp/entity_extractor.py         (regex patterns)
12. nlp/lang_detector.py            (fasttext)
13. nlp/dialogue_manager.py         (process_message() orchestrator)
14. apps/customers/views.py         (CRUD customer APIs)
15. apps/transactions/views.py      (insights, categories)
16. apps/consent/views.py           (grant, revoke, download)
17. apps/recommendations/views.py   (full pipeline)
18. apps/stress_detection/views.py  (score, alerts)
19. apps/chatbot/views.py           (POST /chat/message/)
20. apps/loan/views.py              (eligibility, apply, EMI calc)
21. banking_ai/urls.py              (wire all routes)

FRONTEND BUILD ORDER:
1. src/i18n/ (en.json + hi.json)           (must exist before any component)
2. src/services/api.js                      (JWT interceptor)
3. src/store/ (all Zustand stores)          (state before components)
4. src/services/ (all service files)        (before hooks that use them)
5. src/components/Common/ (Layout, etc.)   (before page components)
6. src/pages/OnboardingPage.jsx
7. src/pages/DashboardPage.jsx
8. src/components/Dashboard/ (all widgets)
9. src/components/Chatbot/ (chat UI)
10. src/components/Loan/ (wizard steps)
11. src/components/Stress/ (banners)
12. src/components/Wellness/ (score + charts)
13. src/pages/ (remaining pages)
14. src/App.jsx (routes)

ML BUILD ORDER:
1. generate_synthetic_data.py              (must run first)
2. feature_engineering.ipynb              (define all features)
3. segmentation_model.ipynb               (K-Means training)
4. recommendation_model.ipynb             (XGBoost training)
5. stress_detection_model.ipynb           (3-layer training)
6. intent_classifier.ipynb               (IndicBERT fine-tuning)
7. [Download all .pkl/.json/.h5 files]
8. [Upload to Django backend/ml_models/]
9. [Port feature_engineering.py to Django exactly]
```

---

### 15.4 Key Constants and Enums

Always import from a central constants file — never hardcode these:

```python
# backend/utils/constants.py

SEGMENTS = ['prudent_savers', 'aspiring_spenders', 'family_builders',
            'digital_natives', 'seasonal_earners', 'stressed_accounts']

STRESS_LEVELS = ['GREEN', 'YELLOW', 'ORANGE', 'RED']
STRESS_THRESHOLDS = {'GREEN': 30, 'YELLOW': 60, 'ORANGE': 80}

PRODUCTS = ['savings_account', 'fd', 'credit_card', 'personal_loan',
            'home_loan', 'car_loan', 'health_insurance', 'life_insurance',
            'sip', 'mutual_fund', 'education_loan', 'kisan_credit', 'weather_insurance']

LOAN_PRODUCTS = ['personal_loan', 'home_loan', 'car_loan', 'education_loan',
                 'kisan_credit', 'credit_card', 'credit_line']

LANGUAGES = ['hi', 'en', 'ta', 'bn', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as']

INTENTS = ['check_balance', 'apply_loan', 'track_application', 'report_fraud',
           'get_recommendation', 'emi_calculator', 'product_info',
           'restructure_emi', 'general_query']

CONSENT_TYPES = ['transaction_analysis', 'health_monitoring', 'ai_chat',
                 'life_events', 'marketing']

MONGO_COLLECTIONS = ['customers', 'transactions', 'recommendations',
                     'chat_sessions', 'stress_alerts', 'consent_logs', 'audit_trail']

# Guardrail constants
MAX_RECS_PER_SESSION = 3
COOLDOWN_DAYS = 30
STRESS_LOAN_BLOCK_THRESHOLD = 50
```

```javascript
// frontend/src/constants/index.js

export const SEGMENTS = {
  prudent_savers:    { label: 'Prudent Saver',    emoji: '💰', color: 'green' },
  aspiring_spenders: { label: 'Aspiring Spender', emoji: '🛒', color: 'blue' },
  family_builders:   { label: 'Family Builder',   emoji: '👨‍👩‍👧', color: 'purple' },
  digital_natives:   { label: 'Digital Native',   emoji: '📱', color: 'cyan' },
  seasonal_earners:  { label: 'Farmer',            emoji: '🌾', color: 'yellow' },
  stressed_accounts: { label: 'Needs Support',     emoji: '⚠️', color: 'red' }
};

export const STRESS_COLORS = {
  GREEN:  { bg: '#2e7d32', light: '#e8f5e9', text: 'Financially Healthy' },
  YELLOW: { bg: '#f57f17', light: '#fff8e1', text: 'Monitor Closely' },
  ORANGE: { bg: '#e65100', light: '#fff3e0', text: 'Needs Attention' },
  RED:    { bg: '#c62828', light: '#ffebee', text: 'Critical Support Needed' }
};

export const LANGUAGES = [
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', english: 'Hindi' },
  { code: 'en', name: 'English', flag: '🇬🇧', english: 'English' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', english: 'Tamil' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳', english: 'Bengali' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳', english: 'Telugu' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳', english: 'Marathi' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳', english: 'Gujarati' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳', english: 'Kannada' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳', english: 'Malayalam' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', english: 'Punjabi' },
  { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳', english: 'Odia' },
  { code: 'as', name: 'অসমীয়া', flag: '🇮🇳', english: 'Assamese' }
];
```

---

*This document is the single source of truth for the Banking AI project. Any code generated by AI models should reference this file for architecture decisions, data shapes, API contracts, and coding conventions.*

*Last updated: September 12, 2026 — Hackathon Build*
