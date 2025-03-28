from django.db import models
from users.models import CustomUser

class TreatmentPlan(models.Model):
    id = models.IntegerField(unique=True, primary_key=True)
    name = models.CharField(max_length=64)
    injury = models.TextField() # a comma separated list of all inuries this treatment plan serves
    detailed_plan = models.TextField() # a json object in the form {"exercises": {name = {"name": ex.name, "reps": ex.reps, "weight": ex.weight, "notes": ex.notes}, name2: {...}}, "treatments": {name = {"name": ex.name, "reps": ex.reps, "weight": ex.weight, "notes": ex.notes}, name2: {...}}} 
    estimated_RTC = models.DateField() # Estimated Return to competition date
    trainer_name = models.CharField(max_length=64)
    #trainers = models.OneToOneField('User')

    def __str__(self):
        return f"{self.name}"


class TrainerAvailability(models.Model):
    trainer_id = models.CharField(max_length=100)
    trainer_name = models.CharField(max_length=100, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.trainer_name} - {self.date} {self.start_time}-{self.end_time}"
    
# Example: trainers/models.py

class Appointment(models.Model):
    athlete_id = models.CharField(max_length=100)
    trainer_id = models.CharField(max_length=100)
    date = models.DateField()
    time = models.TimeField()
    appointment_type = models.CharField(max_length=50)  # e.g. "Consultation", "Treatment", "Clearance"
    max_length=50, 
    notes = models.TextField(blank=True)
    default="treatment"

    def __str__(self):
        return f"Athlete={self.athlete_id}, Trainer={self.trainer_id}, {self.date} {self.time}, type={self.appointment_type}"