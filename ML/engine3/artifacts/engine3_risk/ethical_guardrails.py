"""Cross-engine ethical guardrail module. Import this in Django views/serializers
that assemble the final recommendation list, AFTER Engine-1's ranker produces candidates and
AFTER Engine-3's stress score is computed for the customer."""

CREDIT_CATEGORIES = {"personal_loan", "credit_card", "buy_now_pay_later", "gold_loan", "loan", "credit"}


def compute_stress_band(anomaly_rate_30d, recon_error, recon_alert_threshold,
                         emi_bounce_count_30d, income_drop_pct):
    score = 0
    score += min(2, anomaly_rate_30d * 20)
    score += min(2, recon_error / (recon_alert_threshold + 1e-9))
    score += min(3, emi_bounce_count_30d * 1.5)
    score += min(3, max(0, income_drop_pct) * 10)
    if score >= 7:
        return "RED"
    if score >= 5:
        return "ORANGE"
    if score >= 2.5:
        return "YELLOW"
    return "GREEN"


def apply_ethical_gate(stress_band, candidate_recommendations):
    """PDF rule: stress >= YELLOW blocks new credit-product recs, substitutes
    support/restructuring, and enforces the max-3-recommendations guardrail."""
    if stress_band in ("YELLOW", "ORANGE", "RED"):
        filtered = [r for r in candidate_recommendations if r["category"] not in CREDIT_CATEGORIES]
        support = [
            {"category": "restructure_emi", "reason": f"stress_band={stress_band}"},
            {"category": "financial_counseling", "reason": f"stress_band={stress_band}"},
        ]
        return (support + filtered)[:3]
    return candidate_recommendations[:3]
