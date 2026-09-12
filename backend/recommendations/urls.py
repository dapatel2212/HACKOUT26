from django.urls import path
from . import views

urlpatterns = [
    path('<str:customer_id>/', views.get_recommendations, name='recommendation-list'),
    path('<str:pk>/accept/', views.accept_recommendation, name='recommendation-accept'),
    path('<str:pk>/reject/', views.reject_recommendation, name='recommendation-reject'),
]
