from django.urls import path
from . import views

urlpatterns = [
    path('message/', views.chat_message, name='chat-message'),
    path('history/<str:customer_id>/', views.chat_history, name='chat-history'),
]
