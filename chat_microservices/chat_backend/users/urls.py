from django.urls import path
from .views import register, login, verify_token

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('verify/', verify_token, name='verify_token')
]