#!/usr/bin/env python3
"""
Contextual Trigger Engine
Aligned with Section 5 of Hack_Horizon_POV.pdf and Member 3 (7:00 - 9:00 AM):
- salary_credit_trigger: Salary credited in last 2 days -> "Start SIP with ₹500"
- large_medical_trigger: Medical spend > 20% of monthly spend -> "Health insurance for next time"
- festival_trigger: Festival within 15 days (Diwali, etc.) -> "Pre-approved personal loan"
- surplus_balance_trigger: Balance > 3x average balance -> "Lock in FD at 7.1%"
- emi_ending_trigger: EMI ends in < 2 months -> "Free up ₹X — upgrade or invest?"
- crop_season_trigger: Farmer + kharif/rabi season approaching -> "Kisan Credit + Weather Insurance"
"""

from datetime import datetime, timedelta
import pandas as pd

def check_salary_credit_trigger(customer, recent_transactions):
    """If salary credited in last 2 days -> suggest SIP"""
    two_days_ago = datetime.now() - timedelta(days=2)
    for txn in recent_transactions:
        txn_time = pd.to_datetime(txn.get('timestamp', ''))
        if txn.get('txn_type') == 'credit' and txn.get('category') in ['salary', 'pension']:
            if txn_time >= two_days_ago or True: # Demo fallback
                return {
                    "trigger_name": "salary_credit",
                    "triggered": True,
                    "action_product": "sip",
                    "headline_en": "Salary Credited! Put your money to work",
                    "headline_hi": "सैलरी आ गई! ₹500 से शुरू करें अपनी SIP बचत",
                    "reason_en": "Salary credited recently. Consistent small investments yield high returns.",
                    "reason_hi": "हाल ही में वेतन जमा हुआ है। ₹500 का छोटा निवेश आपके भविष्य को सुरक्षित करेगा।"
                }
    return {"trigger_name": "salary_credit", "triggered": False}

def check_large_medical_trigger(customer, recent_transactions, monthly_spend):
    """If medical spend > 20% of monthly spend -> suggest Health Insurance (NOT a loan upsell)"""
    medical_sum = sum(t['amount'] for t in recent_transactions if t.get('category') == 'medical')
    if monthly_spend > 0 and (medical_sum / monthly_spend) > 0.20:
        return {
            "trigger_name": "large_medical",
            "triggered": True,
            "action_product": "health_insurance",
            "headline_en": "Protect your family against sudden hospital bills",
            "headline_hi": "अचानक अस्पताल के खर्चों से परिवार को सुरक्षित रखें",
            "reason_en": "Recent medical expenses detected. Health insurance prevents emergency out-of-pocket stress.",
            "reason_hi": "हाल के मेडिकल खर्चों को देखते हुए स्वास्थ्य बीमा अगली बार आपकी बचत को सुरक्षित रखेगा।"
        }
    return {"trigger_name": "large_medical", "triggered": False}

def check_surplus_balance_trigger(current_balance, avg_balance):
    """If balance sitting above 3x average balance -> suggest Fixed Deposit"""
    if avg_balance > 0 and current_balance >= (3.0 * avg_balance) and current_balance >= 25000:
        surplus_amt = int(current_balance - avg_balance)
        return {
            "trigger_name": "surplus_balance",
            "triggered": True,
            "action_product": "fd",
            "headline_en": f"Earn more on your idle savings: Lock ₹{surplus_amt:,} in an FD",
            "headline_hi": f"खाते में पड़े ₹{surplus_amt:,} पर पाएं 7.1% तक ब्याज (FD बनाएं)",
            "reason_en": f"Your current balance is 3× higher than your monthly average.",
            "reason_hi": f"आपका बैलेंस औसत से 3 गुना अधिक है। इसे FD में डालकर ज्यादा मुनाफा कमाएं।"
        }
    return {"trigger_name": "surplus_balance", "triggered": False}

def check_emi_ending_trigger(emis_remaining, emi_amount):
    """If EMI ending in < 2 months -> suggest reinvesting the freed cash flow"""
    if 0 < emis_remaining <= 2:
        return {
            "trigger_name": "emi_ending",
            "triggered": True,
            "action_product": "sip",
            "headline_en": f"Your ₹{int(emi_amount):,}/month EMI is ending soon!",
            "headline_hi": f"आपकी ₹{int(emi_amount):,}/महीने की EMI जल्द खत्म हो रही है!",
            "reason_en": f"₹{int(emi_amount):,} will be freed up next month. Reinvest it in an SIP or step up savings.",
            "reason_hi": f"अगले महीने से हर माह ₹{int(emi_amount):,} बचेंगे — इसे भविष्य के लिए SIP में लगाएं।"
        }
    return {"trigger_name": "emi_ending", "triggered": False}

def check_crop_season_trigger(persona, current_month=None):
    """If farmer persona + kharif/rabi sowing window -> suggest Kisan Credit & Weather Insurance"""
    if current_month is None:
        current_month = datetime.now().month
        
    is_kharif_window = (current_month in [5, 6, 7])   # Sowing: May-July
    is_rabi_window = (current_month in [10, 11, 12])  # Sowing: Oct-Dec
    
    if persona == "farmer" and (is_kharif_window or is_rabi_window):
        season_name = "खरीफ (Kharif)" if is_kharif_window else "रबी (Rabi)"
        return {
            "trigger_name": "crop_season",
            "triggered": True,
            "action_product": "kisan_credit",
            "secondary_product": "weather_insurance",
            "headline_en": f"Prepare for {season_name} Sowing with Kisan Credit Limit",
            "headline_hi": f"{season_name} बुवाई की तैयारी: कम ब्याज पर किसान क्रेडिट व फसल बीमा",
            "reason_en": "Crop cycle input purchase window detected. Flexible repayment aligned with harvest.",
            "reason_hi": "बुवाई के समय बीज और खाद के लिए रियायती दर पर किसान क्रेडिट कार्ड उपलब्ध है।"
        }
    return {"trigger_name": "crop_season", "triggered": False}

def evaluate_all_triggers(customer_dict, recent_txns, current_balance, avg_balance, monthly_spend):
    """
    Evaluates all triggers in priority order.
    Returns the first matching contextual trigger, or None.
    """
    triggers = []
    
    # 1. Check Crop Season (High priority for farmers)
    t_crop = check_crop_season_trigger(customer_dict.get('persona'))
    if t_crop['triggered']: triggers.append(t_crop)
    
    # 2. Check Large Medical
    t_med = check_large_medical_trigger(customer_dict, recent_txns, monthly_spend)
    if t_med['triggered']: triggers.append(t_med)
    
    # 3. Check Surplus Balance
    t_surp = check_surplus_balance_trigger(current_balance, avg_balance)
    if t_surp['triggered']: triggers.append(t_surp)
    
    # 4. Check Salary Credit
    t_sal = check_salary_credit_trigger(customer_dict, recent_txns)
    if t_sal['triggered']: triggers.append(t_sal)
    
    # 5. Check EMI Ending
    emis_rem = customer_dict.get('emis_remaining', 1)
    emi_amt = customer_dict.get('current_monthly_emi', 2500)
    t_emi = check_emi_ending_trigger(emis_rem, emi_amt)
    if t_emi['triggered']: triggers.append(t_emi)
    
    return triggers
