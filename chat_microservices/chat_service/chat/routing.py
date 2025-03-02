from django.urls import path

def get_chat_consumer():
    from .consumers import ChatConsumer
    return ChatConsumer.as_asgi()

websocket_urlpatterns = [
    path('ws/chat/room1', get_chat_consumer()),
]