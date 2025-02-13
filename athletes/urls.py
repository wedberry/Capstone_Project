from django.urls import path
from .views import get_athlete_dashboard

urlpatterns = [
    path('dashboard/', get_athlete_dashboard),
]