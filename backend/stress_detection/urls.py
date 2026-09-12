from django.urls import path
from . import views

urlpatterns = [
    path('status/<str:customer_id>/', views.get_stress_status, name='stress-status'),
]
