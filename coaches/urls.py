from django.urls import path
from .views import get_coach_dashboard

urlpatterns = [
    path('dashboard/', get_coach_dashboard),
]