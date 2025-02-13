from django.urls import path
from .views import get_trainer_dashboard

urlpatterns = [
    path('dashboard/', get_trainer_dashboard),
]