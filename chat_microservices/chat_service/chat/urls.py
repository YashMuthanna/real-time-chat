from django.urls import path
from .views import chat_history

urlpatterns = [
    path('history/', chat_history, name='chat-history'),
]
