"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users import views  # Assuming your users app contains registration views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/trainers/', include('trainers.urls')),
    path('api/athletes/', include('athletes.urls')),
    path('api/coaches/', include('coaches.urls')),
    path('api/users/', include('users.urls')),
    path('api/system/', include('system.urls')),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Register endpoint
    # path('api/register/', views.RegisterView.as_view(), name='register'),
]
