#!/usr/bin/env python3
"""
Customer-Facing Explainability Engine (SHAP-to-Language)
Aligned with Section 5.1 of Hack_Horizon_POV.pdf:
Converts model feature attributions into intuitive, plain-language
explanations in English and Hindi ("Why am I seeing this?").
"""

FEATURE_EXPLANATION_TEMPLATES = {
    "monthly_income": {
        "en": "Your steady monthly income supports this product comfortably.",
        "hi": "आपकी मासिक आय इस उत्पाद के लिए पूरी तरह अनुकूल है।"
    },
    "savings_rate": {
        "en": "You have maintained a healthy savings habit over recent months.",
        "hi": "पिछले कुछ महीनों में आपने लगातार अच्छी बचत बनाए रखी है।"
    },
    "digital_maturity": {
        "en": "You are an active digital UPI user eligible for instant pre-approval.",
        "hi": "आप एक सक्रिय UPI डिजिटल उपयोगकर्ता हैं, इसलिए तुरंत स्वीकृति उपलब्ध है।"
    },
    "emi_burden_ratio": {
        "en": "Your current EMI outgo is well within the safe financial limit.",
        "hi": "आपकी मासिक किस्त (EMI) सुरक्षित सीमा के भीतर है।"
    },
    "credit_score": {
        "en": "Your disciplined repayment history earns you our best interest rate.",
        "hi": "आपके उत्कृष्ट क्रेडिट स्कोर के कारण आपको सबसे कम ब्याज दर मिल रही है।"
    },
    "spend_farm_input": {
        "en": "Sowing and harvesting season investment detected.",
        "hi": "फसल बुवाई और खेती से जुड़े खर्चों को ध्यान में रखते हुए यह सुझाव दिया गया है।"
    },
    "spend_medical": {
        "en": "Recent medical expenses detected — protects against sudden hospital bills.",
        "hi": "अचानक अस्पताल के खर्चों से सुरक्षा प्रदान करने हेतु यह बीमा सुझाव है।"
    }
}

def generate_plain_language_reason(top_feature_name, language="hi"):
    """
    Given the top contributing feature from SHAP or Tree attributions,
    returns a transparent explanation for the customer dashboard.
    """
    template = FEATURE_EXPLANATION_TEMPLATES.get(
        top_feature_name,
        {
            "en": "Matched based on your verified banking transactions and financial profile.",
            "hi": "आपके बैंकिंग लेन-देन और वित्तीय प्रोफ़ाइल के आधार पर तैयार किया गया सुझाव।"
        }
    )
    return template.get(language, template["en"])

def explain_recommendation(customer_feature_dict, product_name, language="hi"):
    """
    Synthesizes a human-understandable explanation for why a product was ranked #1.
    """
    # Heuristic top attribution determination
    if customer_feature_dict.get('savings_rate', 0) > 0.25 and product_name in ['fd', 'sip']:
        top_feat = "savings_rate"
    elif customer_feature_dict.get('digital_maturity', 0) > 0.70 and product_name == 'credit_card':
        top_feat = "digital_maturity"
    elif customer_feature_dict.get('spend_farm_input', 0) > 0.05 and product_name in ['kisan_credit', 'weather_insurance']:
        top_feat = "spend_farm_input"
    elif customer_feature_dict.get('credit_score', 0) >= 740:
        top_feat = "credit_score"
    else:
        top_feat = "monthly_income"

    explanation_text = generate_plain_language_reason(top_feat, language=language)
    
    return {
        "product": product_name,
        "primary_feature": top_feat,
        "explanation": explanation_text,
        "language": language
    }

if __name__ == "__main__":
    sample_cust = {"savings_rate": 0.35, "credit_score": 760, "digital_maturity": 0.85}
    print("Hindi Explainer:")
    print(explain_recommendation(sample_cust, "sip", language="hi"))
    print("\nEnglish Explainer:")
    print(explain_recommendation(sample_cust, "sip", language="en"))
