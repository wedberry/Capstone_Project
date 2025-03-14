from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
import json
from .models import TreatmentPlan

@api_view(['GET'])
def get_upcoming_appointments(request, clerk_id):
    return JsonResponse({"appointments": [{"date": "01/01/2025", "time": "12:00:00", "trainer_name": "Alyssa"}]}, safe=False)

@api_view(['GET', 'POST'])
def save_treatment_plan(request):
    if request.method == "POST":
        data = json.loads(request.body)
        TreatmentPlan.objects.create(
            name=data["treatment_plan_name"],
            trainer_name=data["trainer_name"],
            injury=data["injury"],
            detailed_plan=data["detailed_plan"],
            estimated_RTC=data["estimated_completion"],
        )
        return JsonResponse({"success": True})