from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """Base user model extending Django's AbstractUser."""
    ROLE_CHOICES = (
        ('trainer', 'Trainer'),
        ('athlete', 'Athlete'),
        ('coach', 'Coach'),
    )
    clerk_id = models.CharField(max_length=255, unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='athlete')
    phone = models.BigIntegerField(blank=True, null=True, default=1234567890)

    """
    Django AbstractUser provides the following built in fields
    username, password, first_name, last_name, email
    """

    def __str__(self):
        return f"{self.first_name} ({self.last_name})"

class Trainer(models.Model):
    """Trainer model extending CustomUser."""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)

    def __str__(self):
        return f"Trainer: {self.user.username}"

class Athlete(models.Model):
    """Athlete model extending CustomUser."""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    sport = models.CharField(max_length=100, blank=True, null=True)
    injury_status = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Athlete: {self.user.username}"

class Coach(models.Model):
    """Coach model extending CustomUser."""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)

    def __str__(self):
        return f"Coach: {self.user.username}"
