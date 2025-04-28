from django.urls import path
from . import views

urlpatterns = [
    path("save-treatment-plan/", views.save_treatment_plan, name='save_treatment_plan'),
    path("get-treatment-plans/", views.get_treatment_plans, name='get_treatment_plans'),
    path("get-single-treatment-plan/<int:id>/", views.get_single_treatment_plan, name="get_single_treatment_plan"),
    path("update-treatment-plan/", views.update_treatment_plan, name='update_treatment-plan'),
    path('bulk-set-availability/', views.bulk_set_availability, name='bulk_set_availability'),
    path('list', views.get_trainers_list, name='get_trainers_list'),
    path('availabilities', views.get_availabilities, name='get_availabilities'),
    path('book-availability/', views.book_availability, name='book_availability'),
    path('set-availability/', views.set_availability, name='set_availability'),
    path('get-appointments/<str:athlete_id>/', views.get_appointments, name='get_appointments'),
    path('fetchAllAthletes/', views.fetchAllAthletes, name='fetch_all_athletes'),
    path('delete-plan/<int:id>/', views.delete_plan, name="delete_plan"),
    path('get-appointment-details/<int:appt_id>/', views.get_appointment_by_id, name="get_appointment_details")
]