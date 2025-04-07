from django.urls import path
from . import views

urlpatterns = [
    path("get-notifications/<str:clerk_id>/",views.get_notifications, name='get_notifications'),
    path("send-message/",views.send_message, name='send_message'),
    path("standings/", views.get_standings, name='get_standings'),
]