from django.db import models

class Appointment(models.Model):
    # define your fields here
    athlete_id = models.CharField(max_length=50)
    date = models.DateField()
    time = models.TimeField()
    notes = models.TextField(blank=True, null=True)

    