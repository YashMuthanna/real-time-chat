import json
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
import urllib

import requests

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_params = urllib.parse.parse_qs(self.scope["query_string"].decode())
        token = query_params.get("token", [None])[0]
        if token:
            # Call your verify endpoint or decode token
            user_name = await self.verify_token(token)
            self.sender = user_name or "Anonymous23"
        else:
            self.sender = "Anonymous4"
        # Hardcode room name as 'room1'
        self.room_name = "room1"
        self.room_group_name = f"chat_{self.room_name}"


        # Join WebSocket room
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave WebSocket room
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')  # Get message or empty string

        # Store message in the database
        await self.save_message(self.sender, message)

        # Broadcast message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': self.sender,
            }
        )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
        }))

    @sync_to_async
    def save_message(self, sender, message):
        from .models import ChatMessage
        # Save the chat message in the database
        ChatMessage.objects.create(sender=sender, message=message)

    async def verify_token(self, token):
        url = "http://localhost:8000/api/users/verify/" 
        headers = {"Authorization": f"Bearer {token}"}
        response = await sync_to_async(requests.get)(url, headers=headers)
        if response.status_code == 200:
            return response.json().get('username')
        return None

