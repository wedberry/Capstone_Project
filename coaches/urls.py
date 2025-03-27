from django.urls import path
from .views import get_coach_dashboard, get_team_members

urlpatterns = [
    path('dashboard/', get_coach_dashboard),
    path('team-members/<str:coach_id>/', get_team_members),
]