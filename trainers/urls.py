from django.urls import path
from . import views

urlpatterns = [
    path("get-appointments/<str:clerk_id>/",views.get_upcoming_appointments, name='get_appointments'),
    path("save-treatment-plan/", views.save_treatment_plan, name='save_treatment_plan'),
    path("get-treatment-plans/", views.get_treatment_plans, name='get_treatment_plans'),
    path("get-single-treatment-plan/<int:id>/", views.get_single_treatment_plan, name="get_single_treatment_plan"),
    path("update-treatment-plan/", views.update_treatment_plan, name='update_treatment-plan'),
]