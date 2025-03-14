from django.urls import path
from . import views

urlpatterns = [
    path("get-appointments/<str:clerk_id>/",views.get_upcoming_appointments, name='get_appointments'),
    path("save-treatment-plan/", views.save_treatment_plan, name='save_treatment_plan')
]