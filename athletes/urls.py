from django.urls import path
from .views import get_athlete_dashboard, create_appointment, get_status, update_status, cancel_appointment

urlpatterns = [
    path('dashboard/', get_athlete_dashboard),
     path('api/appointments/create/', create_appointment, name='create_appointment'),
     path('get-status/<str:athlete_id>/', get_status, name='get_status'),
     path('api/trainers/cancel-appointment/<int:appt_id>',cancel_appointment, name='cancel-appointment'),
     path('update-status/', update_status, name='update_status')
]