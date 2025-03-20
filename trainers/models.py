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


