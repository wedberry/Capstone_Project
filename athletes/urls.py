from django.urls import path
from .views import get_athlete_dashboard, create_appointment

urlpatterns = [
    path('dashboard/', get_athlete_dashboard),
     path('api/appointments/create/', create_appointment, name='create_appointment'),
]