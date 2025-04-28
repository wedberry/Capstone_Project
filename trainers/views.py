from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
import json
from .models import TreatmentPlan, TrainerAvailability, Appointment
from .serializers import TreatmentPlanSerializer, AppointmentSerializer
from users.models import CustomUser
from datetime import datetime, timedelta

@api_view(['GET', 'POST'])
def save_treatment_plan(request):
    if request.method == "POST":
        data = json.loads(request.body)
        TreatmentPlan.objects.create(
            name=data["treatment_plan_name"],
            trainer_name=data["trainer_name"],
            injury=data["injury"],
            detailed_plan=data["detailed_plan"],
            duration=data["duration"],
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

        if data.get('duration'):
            try:
                days_str = data['duration'].split(' ')[0]  # Extract the number of days
                days = int(days_str)
                treatment_plan.duration = timedelta(days=days)
            except (ValueError, IndexError):
                return JsonResponse({"error": "Invalid duration format"}, status=400)
            
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

        trainer_clerk_id = a.trainer_id
        trainer = CustomUser.objects.get(clerk_id=trainer_clerk_id)

        trainer_name = f"{trainer.first_name} {trainer.last_name}"

        athlete_clerk_id = a.athlete_id
        athlete = CustomUser.objects.get(clerk_id=athlete_clerk_id)

        athlete_name = f"{athlete.first_name} {athlete.last_name}"

        data.append({
            "id": a.id,
            "date": str(a.date),
            "time": str(a.time),
            "trainer_id": a.trainer_id,
            "trainer_name": trainer_name,
            "athlete_name": athlete_name
        })

    print(data)
    return Response({"appointments": data})

@api_view(['GET'])
def get_appointment_by_id(request, appt_id):
    try:

        appointment = Appointment.objects.get(id=appt_id)

        try: 
            trainer = CustomUser.objects.get(id=int(appointment.trainer_id))
        except ValueError:
            trainer = CustomUser.objects.get(clerk_id=appointment.trainer_id)
        except Exception as e:
            return JsonResponse({"error": f"{e}", "TrainerNotFound": True}, status=400)
        
        trainer_name = trainer.first_name + " " + trainer.last_name

        serializer = AppointmentSerializer(appointment)

        serializer_data = serializer.data
        serializer_data["trainer_name"] = trainer_name

        return JsonResponse(serializer_data)

    except Exception as e:
        return JsonResponse({"error": f"{e}"}, status=400)


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
    date_str = request.GET.get('date')

    slots = TrainerAvailability.objects.filter(trainer_id=trainer_id, is_booked=False)

    if date_str:
        slots = slots.filter(date=date_str)  # exact match on date

    data = []
    for slot in slots:
        data.append({
            "id": slot.id,
            "trainer_id": slot.trainer_id,
            "trainer_name": slot.trainer_name,
            "date": str(slot.date),
            "start_time": str(slot.start_time),
            "end_time": str(slot.end_time),
            "is_booked": slot.is_booked,
        })
    return Response(data)


@api_view(['POST'])
def book_availability(request):
    slot_ids = request.data.get('slot_ids', [])
    athlete_id = request.data.get('athlete_id')
    appointment_type = request.data.get('appointment_type', 'treatment')
    notes = request.data.get('notes', '')

    # 1) Validate we got a non-empty array
    if not isinstance(slot_ids, list) or len(slot_ids) == 0:
        return Response({"error": "slot_ids must be a non-empty array"}, status=400)

    # 2) Check each slot in the DB
    for sid in slot_ids:
        try:
            slot = TrainerAvailability.objects.get(id=sid)
        except TrainerAvailability.DoesNotExist:
            return Response({"error": f"Slot {sid} not found"}, status=404)

        if slot.is_booked:
            return Response({"error": f"Slot {sid} already booked"}, status=400)

    # 3) If all are free, mark them all as booked
    for sid in slot_ids:
        slot = TrainerAvailability.objects.get(id=sid)
        slot.is_booked = True
        slot.save()

    first_slot = TrainerAvailability.objects.get(id=slot_ids[0])
    Appointment.objects.create(
        athlete_id=athlete_id,
        trainer_id=first_slot.trainer_id,
        date=first_slot.date,
        time=first_slot.start_time,
        appointment_type=appointment_type,
        notes=notes
    )

    return Response({"success": True, "message": "Appointment created"})


@api_view(['POST'])
def bulk_set_availability(request):
    """
    Allows a trainer to set availability for multiple weeks in 15-min increments.
    Expects JSON like:
    {
      "trainer_id": "user_123",
      "trainer_name": "Coach Alyssa",
      "selected_days": ["monday","tuesday","wednesday","thursday"],
      "start_time": "09:00",
      "end_time": "15:00",
      "num_weeks": 2
    }
    """
    trainer_id = request.data.get('trainer_id')
    trainer_name = request.data.get('trainer_name', "")
    selected_days = request.data.get('selected_days', [])
    start_time_str = request.data.get('start_time')
    end_time_str = request.data.get('end_time')
    num_weeks = int(request.data.get('num_weeks', 2))

    # parse start/end times
    fmt = "%H:%M"
    start_dt = datetime.strptime(start_time_str, fmt)
    end_dt = datetime.strptime(end_time_str, fmt)

    # e.g. 15 min increments or 30. We'll do 15 min to accommodate 15/30 type bookings
    slot_length = timedelta(minutes=15)

    # day-of-week mapping for convenience
    dow_map = {
        'sunday': 6,
        'monday': 0,
        'tuesday': 1,
        'wednesday': 2,
        'thursday': 3,
        'friday': 4,
        'saturday': 5,
    }

    # Starting from "today"
    now = datetime.now().date()

    created_count = 0

    for w in range(num_weeks):
        # For each day in this week
        for d in range(7):
            current_date = now + timedelta(days=(w * 7 + d))
            weekday_index = current_date.weekday()  # Monday=0, Sunday=6 in Python

            # check if user selected that day
            # we find if the textual day (monday=0) matches
            # We'll invert dow_map so python Monday=0 -> 'monday'
            python_to_name = {v: k for k, v in dow_map.items()}

            day_name = python_to_name.get(weekday_index, None)
            if day_name in selected_days:
                # generate 15-min increments
                slot_start = datetime(
                    year=current_date.year,
                    month=current_date.month,
                    day=current_date.day,
                    hour=start_dt.hour,
                    minute=start_dt.minute
                )
                slot_end = datetime(
                    year=current_date.year,
                    month=current_date.month,
                    day=current_date.day,
                    hour=end_dt.hour,
                    minute=end_dt.minute
                )

                while slot_start < slot_end:
                    next_slot = slot_start + slot_length
                    if next_slot <= slot_end:
                        # create availability record
                        TrainerAvailability.objects.create(
                            trainer_id=trainer_id,
                            trainer_name=trainer_name,
                            date=current_date,
                            start_time=slot_start.time(),
                            end_time=next_slot.time(),
                            is_booked=False
                        )
                        created_count += 1
                    slot_start = next_slot

    return Response({
        "success": True,
        "message": f"Created {created_count} availability slots."
    })

@api_view(['GET'])
def fetchAllAthletes(request):

    athletes = CustomUser.objects.filter(role='athlete')

    athletes_data = []
    for athlete in athletes:
        athletes_data.append({
            'id': athlete.id,
            'username': athlete.username,
            'first_name': athlete.first_name,
            'last_name': athlete.last_name,
            'email': athlete.email,
            'role': athlete.role,
            'phone': athlete.phone,
            'sport': athlete.sport,
            'clerk_id': athlete.clerk_id,
        })
    return JsonResponse(athletes_data, safe=False)


@api_view(['GET', 'DELETE', 'OPTIONS'])
def delete_plan(request, id):
    try:
        # get plan to delete
        plan = TreatmentPlan.objects.get(id=id)
        plan.delete()

        return JsonResponse({"success": True}, status=200)

    except Exception as e:
        return JsonResponse({"error": f"{e}"}, status=400)