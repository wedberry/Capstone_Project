from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
import json
from .models import TreatmentPlan
from .models import TrainerAvailability
from rest_framework.response import Response
from .models import Appointment

@api_view(['GET'])
def get_appointments(request, athlete_id):
    appts = Appointment.objects.filter(athlete_id=athlete_id)
    data = []
    for a in appts:
        data.append({
            "id": a.id,
            "date": str(a.date),
            "time": str(a.time),
            "trainer_name": a.trainer_id,  # or real name if you have it
        })
    return Response({"appointments": data})

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

    unique_trainers = TrainerAvailability.objects.values_list('trainer_id', flat=True).distinct()
    data = [{"trainer_id": t} for t in unique_trainers]
    return Response(data)

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