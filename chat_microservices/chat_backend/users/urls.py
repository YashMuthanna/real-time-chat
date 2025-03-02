from django.urls import path
from .views import register, login, verify_token
from rest_framework_simplejwt.views import TokenVerifyView

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('verify/', TokenVerifyView.as_view(), name='verify_token')
]