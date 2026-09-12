# Model Card: Hyper-Personalized Product Ranker (XGBoost)

## Model Overview
- **Model Name:** HackHorizon XGBoost Pairwise Ranker
- **Model Version:** 1.0.0
- **Model Type:** Gradient Boosted Decision Trees (`rank:pairwise`)
- **Primary Objective:** Rank bank financial products tailored to affordability, life-stage need, and persona rather than mere click propensity.
- **Explainability:** SHAP feature attribution decomposed to customer-facing plain language (Hindi & English).

## Intended Use
- Surface top 1-3 tailored banking products on the user's dashboard and conversational banking flow.
- Support pre-approved limits for low-risk, verified customers.
- **Out-of-Scope / Prohibited:** Cannot recommend credit or loan products to any customer with a Financial Stress Score $\ge 31$ (Stress Lock Gate).

## Input Features (14 Features)
1. `monthly_income`: Customer monthly net income.
2. `credit_score`: Bureau credit score (300-900).
3. `savings_rate`: Ratio of retained credits to total credits.
4. `digital_maturity`: Ratio of UPI transactions to total transactions.
5. `emi_burden_ratio`: Current monthly EMI divided by monthly income.
6. `composite_stress_score`: Output from Engine 3 (0-100).
7. `prod_min_income`: Minimum income requirement for the candidate product.
8. `prod_min_score`: Minimum credit score for the candidate product.
9. `prod_is_credit`: Binary flag indicating loan/card product.
10. `prod_is_investment`: Binary flag indicating SIP/MF.
11. `prod_is_insurance`: Binary flag indicating health/life insurance.
12. `prod_is_deposit`: Binary flag indicating FD/RD.
13. `income_to_min_income`: Affordability ratio.
14. `score_diff`: Customer credit score buffer above minimum requirement.

## Performance Metrics
- **NDCG@5:** 0.892
- **Precision@3:** 0.841
- **Catalog Coverage:** 100% across all 13 products
- **Inference Latency:** < 8 ms on CPU

## Ethical & Fairness Considerations
- **DPDP Act & RBI Compliance:** Pre-checked consent required; recommendations suppressed if consent is revoked.
- **Cool-Down Safeguard:** No product repeated within 30 days of dismissal.
- **Anti-Predatory Lock:** High-debt and stressed customers are strictly shown debt-restructuring or savings options.
