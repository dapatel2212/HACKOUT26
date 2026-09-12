"""banking_ai URL Configuration"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from customers.urls import auth_urlpatterns


def health(request):
    return JsonResponse({'status': 'ok', 'service': 'banking-ai-backend'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health),
    path('api/auth/', include(auth_urlpatterns)),
    path('api/customers/', include('customers.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/recommendations/', include('recommendations.urls')),
    path('api/chat/', include('chatbot.urls')),
    path('api/stress/', include('stress_detection.urls')),
    path('api/consent/', include('consent.urls')),
    path('api/audit/', include('audit.urls')),
    path('api/loan/', include('loan.urls')),
]
