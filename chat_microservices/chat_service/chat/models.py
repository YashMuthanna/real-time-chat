from django.db import models

class ChatMessage(models.Model):
    sender = models.CharField(max_length=100)  # Store sender's username
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    room_name = models.CharField(max_length=50, default='room1')

    def __str__(self):
        return f"{self.sender}: {self.message}"
