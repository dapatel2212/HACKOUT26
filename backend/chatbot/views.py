"""
Chatbot views: Multilingual conversational engine with intent detection,
personalized responses, quick replies, and session history.
"""

from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from utils.mongodb_helper import get_collection
from utils.audit import log_decision
from utils.auth import ensure_customer_access
from banking_ai.ml_registry import predict_intent


RESPONSES = {
    'check_balance': {
        'hi': "Aapke account mein kul upalabdha balance ₹42,850.00 hai. Pichle 30 dino mein koi aniyamit lein-dein nahi dekha gaya.",
        'en': "Your total available account balance is ₹42,850.00. No irregular debit detected in the last 30 days.",
        'ta': "உங்கள் கணக்கில் மொத்த இருப்புத் தொகை ₹42,850.00 ஆகும். கடந்த 30 நாட்களில் ஒழுங்கற்ற பரிவர்த்தனைகள் எதுவும் இல்லை.",
        'mr': "तुमच्या खात्यात एकूण उपलब्ध शिल्लक ₹42,850.00 आहे. गेल्या 30 दिवसांत कोणतेही संशयास्पद व्यवहार आढळले नाहीत."
    },
    'apply_loan': {
        'hi': "Badhaiya! Aap ₹50,000 se ₹2,00,000 tak ke Pre-Approved Loan ke liye yogya hain. EMI sirf ₹4,321/mahina se shuru hoti hai.",
        'en': "Congratulations! You are pre-approved for an instant credit line up to ₹2,00,000 with EMIs starting at ₹4,321/month.",
        'ta': "வாழ்த்துகள்! நீங்கள் ₹2,00,000 வரை உடனடி கடன் பெற தகுதி பெற்றுள்ளீர்கள். EMI மாதம் ₹4,321 முதல் தொடங்குகிறது.",
        'mr': "अभिनंदन! तुम्ही ₹2,00,000 पर्यंतच्या पूर्व-मंजूर कर्जासाठी पात्र आहात. EMI दरमहा फक्त ₹4,321 पासून सुरू होतो."
    },
    'emi_calculator': {
        'hi': "Humara transparent EMI calculator use karein: ₹50,000 loan par 12 mahine ke liye 11.5% dar se lagbhag ₹4,430/mahina EMI aayegi.",
        'en': "Using our transparent rate: A ₹50,000 loan for 12 months at 11.5% interest comes out to approx ₹4,430/month EMI.",
        'ta': "₹50,000 கடன் தொகைக்கு 12 மாத காலத்திற்கு 11.5% வட்டியில் மாதாந்திர தவணை தோராயமாக ₹4,430 ஆகும்.",
        'mr': "12 महिन्यांसाठी ₹50,000 कर्जावर 11.5% दराने अंदाजे मासिक हप्ता ₹4,430 असेल."
    },
    'report_fraud': {
        'hi': "Savdhan! Agar koi anjaan UPI payment hua hai, toh hum turant aapka debit card aur net banking freeze kar sakte hain. Kya aap freeze karna chahenge?",
        'en': "Security Alert: If you suspect unauthorized transactions, we can immediately freeze your digital access. Would you like to proceed?",
        'ta': "பாதுகாப்பு எச்சரிக்கை: அங்கீகரிக்கப்படாத பரிவர்த்தனைகள் நடந்தால் உடனே உங்கள் கணக்கை தற்காலிகமாக முடக்கலாம்.",
        'mr': "सुरक्षा इशारा: अनधिकृत व्यवहार आढळल्यास आम्ही आपले खाते तत्काळ गोठवू शकतो."
    },
    'general_query': {
        'hi': "Namaste! Main BankBuddy AI assistant hoon. Main aapke balance, loans, bima aur bachhat se jude sawaal ka jawaab de sakta hoon.",
        'en': "Hello! I am BankBuddy, your AI banking assistant. I can help with balance checks, pre-approved loans, savings, and security.",
        'ta': "வணக்கம்! நான் உங்கள் பேங்க்படி AI உதவியாளர். இருப்பு, கடன்கள், காப்பீடு பற்றி உங்களுக்கு உதவ முடியும்.",
        'mr': "नमस्कार! मी आपला बँकबडी एआय सहाय्यक आहे. मी शिल्लक, कर्ज आणि बचतीबाबत मदत करू शकतो."
    }
}


def classify_intent(message):
    msg = message.lower()
    if any(w in msg for w in ['balance', 'shillak', 'baki', 'paise', 'kitna', 'இருப்பு']):
        return 'check_balance'
    elif any(w in msg for w in ['loan', 'karz', 'karza', 'credit', 'paise chahiye', 'கடன்', 'कर्ज']):
        return 'apply_loan'
    elif any(w in msg for w in ['emi', 'kist', 'calculate', 'calculator', 'हप्ता', 'தவணை']):
        return 'emi_calculator'
    elif any(w in msg for w in ['fraud', 'dhokha', 'chori', 'suspicious', 'scam', 'மோசடி']):
        return 'report_fraud'
    return 'general_query'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_message(request):
    """
    POST /api/chat/message/
    Accepts text message, returns personalized vernacular response.
    """
    data = request.data
    customer_id = data.get('customer_id') or request.user.customer_id
    ensure_customer_access(request, customer_id)
    message = data.get('message', '').strip()
    language = data.get('language', 'hi')

    intent_result = predict_intent(message)
    intent = intent_result['intent']
    resp_dict = RESPONSES.get(intent, RESPONSES['general_query'])
    response_text = resp_dict.get(language, resp_dict.get('en', 'Hello! How can I help you today?'))

    # Contextual quick replies
    quick_replies = []
    if intent == 'check_balance':
        quick_replies = ['Mujhe loan chahiye', 'Kharche ka hisaab']
    elif intent == 'apply_loan':
        quick_replies = ['EMI calculator', 'Interest rate kya hai?']
    else:
        quick_replies = ['Mera balance kya hai', 'Mujhe loan chahiye', 'EMI calculator']

    # Audit & store session
    now = datetime.now(timezone.utc).isoformat()
    chat_col = get_collection('chat_sessions')
    chat_col.insert_one({
        'customer_id': customer_id,
        'user_message': message,
        'bot_response': response_text,
        'intent': intent,
        'intent_confidence': round(intent_result['confidence'], 4),
        'intent_model': intent_result.get('source', 'indic_bert'),
        'language': language,
        'timestamp': now
    })

    log_decision(customer_id, 'chatbot_interaction', {'intent': intent, 'language': language})

    product_card = None
    if intent == 'apply_loan':
        product_card = {
            'product': 'Personal Micro-Credit',
            'amount': '50,000',
            'emi': '4,321',
            'tenure': '12'
        }

    return Response({
        'response': response_text,
        'intent': intent,
        'intent_model': intent_result.get('source', 'indic_bert'),
        'intent_confidence': round(intent_result['confidence'], 4),
        'quick_replies': quick_replies,
        'action_link': '/loans' if intent == 'apply_loan' else None,
        'product_card': product_card
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_history(request, customer_id):
    """
    GET /api/chat/history/{customer_id}/
    """
    ensure_customer_access(request, customer_id)
    chat_col = get_collection('chat_sessions')
    cursor = chat_col.find({'customer_id': customer_id}, {'_id': 0}).sort('timestamp', -1).limit(20)
    history = list(cursor)
    return Response({'history': history})
