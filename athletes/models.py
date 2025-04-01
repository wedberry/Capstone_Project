from django.db import models
from users.models import CustomUser
from trainers.models import TreatmentPlan

class Appointment(models.Model):
    # define your fields here
    athlete_id = models.CharField(max_length=50)
    date = models.DateField()
    time = models.TimeField()
    notes = models.TextField(blank=True, null=True)

class AthleteStatus(models.Model):
   athlete_id = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
   status = models.CharField(max_length=10, choices=[('healthy', 'Healthy'), ('restricted', 'Restricted'), ('out', 'Out')], default='healthy')
   trainer_restrictions= models.TextField(max_length=500, default='No Restrictions')
   treatment_plan_id = models.ForeignKey(TreatmentPlan, on_delete=models.CASCADE)
   estimated_RTC = models.DateField(null=True, default=None)