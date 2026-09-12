from django.urls import path
from . import views

auth_urlpatterns = [
    path('register/', views.register, name='auth-register'),
    path('login/', views.login, name='auth-login'),
    path('token/refresh/', views.token_refresh, name='auth-token-refresh'),
    path('profile/', views.profile, name='auth-profile'),
]

urlpatterns = [
    path('<str:customer_id>/', views.customer_detail, name='customer-detail'),
    path('<str:customer_id>/segment/', views.customer_segment, name='customer-segment'),
]
