from django.urls import path
from . import views

urlpatterns = [
    path('data-download/', views.data_download, name='consent-data-download'),
    path('delete-request/', views.request_delete, name='consent-delete-request'),
    path('<str:customer_id>/', views.get_consent, name='consent-detail'),
    path('<str:customer_id>/grant/', views.grant_consent, name='consent-grant'),
    path('<str:customer_id>/revoke/', views.revoke_consent, name='consent-revoke'),
]
