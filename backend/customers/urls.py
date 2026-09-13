from django.urls import path
from . import views

auth_urlpatterns = [
    path('register/', views.register, name='auth-register'),
    path('login/', views.login, name='auth-login'),
    path('login-otp/', views.login_with_otp, name='auth-login-otp'),
    path('otp/send/', views.send_otp, name='auth-send-otp'),
    path('otp/verify/', views.verify_otp, name='auth-verify-otp'),
    path('token/refresh/', views.token_refresh, name='auth-token-refresh'),
    path('profile/', views.profile, name='auth-profile'),
]

urlpatterns = [
    path('<str:customer_id>/', views.customer_detail, name='customer-detail'),
    path('<str:customer_id>/segment/', views.customer_segment, name='customer-segment'),
]
