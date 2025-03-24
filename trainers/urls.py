from django.urls import path
from . import views
from .views import get_trainers_list, get_availabilities, book_availability, get_appointments, set_availability

urlpatterns = [
    path('list', get_trainers_list, name='get_trainers_list'),
    path('availabilities', get_availabilities, name='get_availabilities'),
    path('book-availability/', book_availability, name='book_availability'),
    path("save-treatment-plan/", views.save_treatment_plan, name='save_treatment_plan'),
  path('get-appointments/<str:athlete_id>/', get_appointments, name='get_appointments'),
   path('set-availability/', set_availability, name='set_availability'),
]