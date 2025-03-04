from django.urls import path
from . import views

urlpatterns = [
    path("get-appointments/<str:clerk_id>/",views.get_upcoming_appointments, name='get_appointments')
]