from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
import json
from .models import TreatmentPlan, TrainerAvailability, Appointment
from .serializers import TreatmentPlanSerializer
from users.models import CustomUser

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


@api_view(['GET'])
def get_appointments(request, athlete_id):
    appts = Appointment.objects.filter(athlete_id=athlete_id)
    data = []
    for a in appts:

        clerk_id = a.trainer_id
        trainer = CustomUser.objects.get(clerk_id=clerk_id)

        trainer_name = f"{trainer.first_name} {trainer.last_name}"
        data.append({
            "id": a.id,
            "date": str(a.date),
            "time": str(a.time),
            "trainer_id": a.trainer_id,
            "trainer_name": trainer_name
        })

    print(data)
    return Response({"appointments": data})

@api_view(['POST'])
def set_availability(request):
    trainer_id = request.data.get('trainer_id')
    trainer_name = request.data.get('trainer_name', "")  # get from the POST body
    date = request.data.get('date')
    start_time = request.data.get('start_time')
    end_time = request.data.get('end_time')

    # Create a new availability entry in the DB
    new_slot = TrainerAvailability.objects.create(
        trainer_id=trainer_id,
        trainer_name=trainer_name,  # store the name
        date=date,
        start_time=start_time,
        end_time=end_time
    )

    return Response({"success": True, "availability_id": new_slot.id})


@api_view(['GET'])
def get_trainers_list(request):

    trainers = CustomUser.objects.filter(role='trainer')

    trainers_data = []
    for trainer in trainers:
        trainers_data.append({
            'id': trainer.id,
            'username': trainer.username,
            'first_name': trainer.first_name,
            'last_name': trainer.last_name,
            'email': trainer.email,
            'role': trainer.role,
            'phone': trainer.phone,
            'sport': trainer.sport,
            'clerk_id': trainer.clerk_id,
        })
    return JsonResponse(trainers_data, safe=False)


@api_view(['GET'])
def get_availabilities(request):
    trainer_id = request.GET.get('trainer_id')
    slots = TrainerAvailability.objects.filter(
        trainer_id=trainer_id, is_booked=False
    )

    data = []
    for slot in slots:
        data.append({
            "id": slot.id,
            "trainer_id": slot.trainer_id,
            "trainer_name": slot.trainer_name,  # Return the name
            "date": str(slot.date),
            "start_time": str(slot.start_time),
            "end_time": str(slot.end_time),
            "is_booked": slot.is_booked,
        })
    return Response(data)


@api_view(['POST'])
def book_availability(request):
    slot_id = request.data.get('slot_id')
    athlete_id = request.data.get('athlete_id')

    try:
        slot = TrainerAvailability.objects.get(id=slot_id)
    except TrainerAvailability.DoesNotExist:
        return Response({"error": "Slot not found"}, status=404)

    if slot.is_booked:
        return Response({"error": "Slot already booked"}, status=400)

    # Mark slot as booked
    slot.is_booked = True
    slot.save()

    # Create the Appointment record
    Appointment.objects.create(
        athlete_id=athlete_id,
        trainer_id=slot.trainer_id,
        date=slot.date,
        time=slot.start_time,
        # notes or other fields if needed
    )

    return Response({"success": True, "message": "Appointment created"})