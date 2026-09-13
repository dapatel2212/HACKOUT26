from django.urls import path
from . import views

urlpatterns = [
    path('eligibility/<str:customer_id>/', views.loan_eligibility, name='loan-eligibility'),
    path('emi-calculate/', views.emi_calculate, name='emi-calculate'),
    path('apply/', views.loan_apply, name='loan-apply'),
    path('status/<str:application_id>/', views.loan_status, name='loan-status'),
    path('my-loans/<str:customer_id>/', views.customer_loans, name='customer-loans'),
]
