from django.urls import path
from . import views

urlpatterns = [
    path("check-user/<str:clerk_id>/", views.check_user, name='check_user'),
    path("create-user/", views.create_user, name="create_user"),
]