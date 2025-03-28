from django.db import models
from users.models import CustomUser

# Create your models here.

class Message(models.Model):
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages')
    recipient_type = models.CharField(max_length=10, choices=[('athlete', 'Athlete'), ('trainer', 'Trainer')])
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Message from {self.sender.first_name} {self.sender.last_name} to {self.recipient_type}s"
