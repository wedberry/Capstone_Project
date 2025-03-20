from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
import json
from .models import TreatmentPlan
from .serializers import TreatmentPlanSerializer

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
    
@api_view(['GET', 'POST'])
def get_treatment_plans(request):
    plans = TreatmentPlan.objects.all()
    serializer = TreatmentPlanSerializer(plans, many=True)
    return JsonResponse({"treatmentPlans": serializer.data})

@api_view(['GET', 'POST'])
def get_single_treatment_plan(request, id):
    try:

        treatment_plan = TreatmentPlan.objects.get(id=id)
        serializer = TreatmentPlanSerializer(treatment_plan)

        return JsonResponse(serializer.data)

    except Exception as e:
        return JsonResponse({"error": f"{e}"}, status=400)
    

@api_view(['PUT', 'POST'])
def update_treatment_plan(request):
    try:
        # Parse the request body
        data = json.loads(request.body)
        
        # Try to get the existing treatment plan
        try:
            treatment_plan = TreatmentPlan.objects.get(id=data['treatment_plan_id'])
        except TreatmentPlan.DoesNotExist:
            return JsonResponse({"error": "Treatment plan not found"}, status=404)
        
        treatment_plan.name = data.get('treatment_plan_name', treatment_plan.name)
        treatment_plan.trainer_name = data.get('trainer_name', treatment_plan.trainer_name)
        treatment_plan.injury = data.get('injury', treatment_plan.injury)

        if data.get('estimated_completion'):
            treatment_plan.estimated_RTC = data['estimated_completion']

        detailed_plan = data.get('detailed_plan')
        if detailed_plan:
            if isinstance(detailed_plan, dict):
                treatment_plan.detailed_plan = json.dumps(detailed_plan)
            else:
                treatment_plan.detailed_plan = detailed_plan

        treatment_plan.save()

        return JsonResponse({
            "success": True,
            "message": "Treatment plan updated successfully",
            "id": treatment_plan.id
        })
    
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
