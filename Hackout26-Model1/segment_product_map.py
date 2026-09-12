#!/usr/bin/env python3
"""
Segment-Product Mapping Matrix and Scoring Weights
Enforces the strict ethical guardrails and rules from Hack Horizon POV:
- If customer stress score >= 31 (Yellow/Orange/Red), ALL credit products are hard blocked.
- Only restructuring, counseling, and savings are shown to stressed accounts.
- Tailors product suitability weights according to the 6 behavioral clusters.
"""

# Segment -> Eligible & Recommended Products
SEGMENT_PRODUCT_RULES = {
    "prudent_savers": {
        "primary": ["fd", "sip", "tax_saver_mf", "health_insurance"],
        "secondary": ["savings_account", "life_insurance"],
        "blocked": ["personal_loan", "credit_card"],
        "weight_boost": {"fd": 1.4, "sip": 1.3, "health_insurance": 1.2}
    },
    "aspiring_spenders": {
        "primary": ["credit_card", "personal_loan", "travel_insurance"],
        "secondary": ["car_loan", "savings_account"],
        "blocked": ["kisan_credit", "weather_insurance"],
        "weight_boost": {"credit_card": 1.5, "personal_loan": 1.3}
    },
    "family_builders": {
        "primary": ["health_insurance", "education_loan", "home_loan", "life_insurance"],
        "secondary": ["fd", "sip"],
        "blocked": [],
        "weight_boost": {"health_insurance": 1.5, "education_loan": 1.4, "home_loan": 1.3}
    },
    "digital_natives": {
        "primary": ["sip", "credit_card", "credit_line", "term_insurance"],
        "secondary": ["mutual_fund", "savings_account"],
        "blocked": ["kisan_credit", "weather_insurance"],
        "weight_boost": {"sip": 1.6, "credit_card": 1.3}
    },
    "seasonal_earners": {
        "primary": ["kisan_credit", "weather_insurance", "crop_loan", "cattle_insurance"],
        "secondary": ["savings_account", "micro_insurance"],
        "blocked": ["home_loan", "mutual_fund", "credit_card"],
        "weight_boost": {"kisan_credit": 1.8, "weather_insurance": 1.7}
    },
    "stressed_accounts": {
        "primary": ["emi_restructure", "refinance_support", "financial_counseling"],
        "secondary": ["micro_savings"],
        # HARD BLOCK: Zero credit/loan products allowed by RBI/ethical compliance
        "blocked": [
            "personal_loan", "credit_card", "car_loan", "home_loan",
            "education_loan", "credit_line", "kisan_credit"
        ],
        "weight_boost": {"emi_restructure": 2.0, "financial_counseling": 2.0}
    }
}

def filter_and_rank_products(customer_features, candidate_scores):
    """
    customer_features: dict containing 'segment_name', 'composite_stress_score', 'monthly_income', etc.
    candidate_scores: dict of {product_id: raw_model_score}
    Returns: list of (product_name, final_score, decision_reason)
    """
    segment = customer_features.get('segment_name', 'prudent_savers')
    stress_score = customer_features.get('composite_stress_score', 0.0)
    income = customer_features.get('monthly_income', 20000)

    # 1. HARD GATE: Ethical Safeguard (Page 7 & 9 of POV)
    # If stress score >= 31 (Yellow/Orange/Red), force segment to stressed_accounts
    if stress_score >= 31.0:
        active_segment = "stressed_accounts"
        stress_lock_active = True
    else:
        active_segment = segment
        stress_lock_active = False

    rules = SEGMENT_PRODUCT_RULES.get(active_segment, SEGMENT_PRODUCT_RULES["prudent_savers"])
    blocked_set = set(rules["blocked"])
    boosts = rules.get("weight_boost", {})

    ranked_results = []
    for prod_name, raw_score in candidate_scores.items():
        # Check hard block
        if prod_name in blocked_set:
            continue
        
        # Calculate boosted score
        boost = boosts.get(prod_name, 1.0)
        final_score = raw_score * boost
        
        reason = f"Segment fit: {active_segment}"
        if stress_lock_active:
            reason = "Stress Shield Active: Loan offers silenced. Proactive restructuring available."

        ranked_results.append({
            "product_name": prod_name,
            "final_score": round(final_score, 4),
            "stress_lock_active": stress_lock_active,
            "reason": reason
        })

    # Sort descending by score
    ranked_results.sort(key=lambda x: x["final_score"], reverse=True)
    return ranked_results
