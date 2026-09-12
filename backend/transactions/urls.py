from django.urls import path
from . import views

urlpatterns = [
    path('', views.transaction_list, name='transaction-list'),
    path('insights/<str:customer_id>/', views.transaction_insights, name='transaction-insights'),
    path('spending-categories/<str:customer_id>/', views.spending_categories, name='spending-categories'),
]
