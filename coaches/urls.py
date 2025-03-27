from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.get_coach_dashboard, name='coach-dashboard'),
    path('team-members/<str:coach_id>/', views.get_team_members, name='team-members'),
]