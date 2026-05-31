from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

urlpatterns = [
    # JWT Token
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Auth
    path('api/auth/register/', views.register, name='register'),
    path('api/auth/logout/', views.logout, name='logout'),
    path('api/auth/me/', views.me, name='me'),
]
