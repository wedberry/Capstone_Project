from django.urls import path
from . import views

urlpatterns = [
    path("get-notifications/<str:clerk_id>/",views.get_notifications, name='get_notifications')
]