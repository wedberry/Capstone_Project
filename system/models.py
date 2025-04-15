from django.db import models
<<<<<<< Updated upstream

# Create your models here.
=======
from users.models import CustomUser
from trainers.models import Appointment

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

class SMSReminder(models.Model):
    """
    Model to track SMS reminders sent for appointments.
    """
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='sms_reminders')
    phone_number = models.CharField(max_length=20)
    message = models.TextField()
    status = models.CharField(max_length=10, choices=[
        ('sent', 'Sent'),
        ('failed', 'Failed')
    ])
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"SMS Reminder for {self.appointment} - {self.status}"
>>>>>>> Stashed changes
