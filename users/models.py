from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """Base user model extending Django's AbstractUser."""
    ROLE_CHOICES = (
        ('trainer', 'Trainer'),
        ('athlete', 'Athlete'),
        ('coach', 'Coach'),
    )

    SPORT_CHOICES = (
        ('baseball', 'Baseball'), 
        ('mbasketball', 'Mens Basketball'),
        ('mgolf', 'Mens Golf'),
        ('mlax', 'Mens Lacrosse'),
        ('mrowing', 'Mens Rowing'),
        ('msailing', 'Mens Sailing'),
        ('msoccer', 'Mens Soccer'),
        ('mswim', 'Mens Swimming'),
        ('mtennis', 'Mens Tennis'),
        ('mski', 'Mens Waterski'),

        ('softball', 'Softball'),
        ('volleyball', 'Volleyball'),
        ('wbasketball', 'Womens Basketball'),
        ('wgolf', 'Womens Golf'),
        ('wlax', 'Womens Lacrosse'),
        ('wrowing', 'Womens Rowing'),
        ('wsailing', 'Womens Sailing'),
        ('wsoccer', 'Womens Soccer'),
        ('wswim', 'Womens Swimming'),
        ('wtennis', 'Womens Tennis'),
        ('wski', 'Womens Waterski'),
    )

    clerk_id = models.CharField(max_length=255, unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='athlete')
    phone = models.BigIntegerField(blank=True, null=True, default=1234567890)
    sport = models.CharField(max_length=64, choices=SPORT_CHOICES, default='baseball')

    """
    Django AbstractUser provides the following built in fields
    username, password, first_name, last_name, email
    """

    def __str__(self):
        return f"{self.first_name} ({self.last_name})"
