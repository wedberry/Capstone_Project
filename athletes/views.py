from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Appointment, AthleteStatus
from users.models import CustomUser
from trainers.models import TreatmentPlan
from django.utils import timezone
import json
from datetime import datetime, date
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.http import require_http_methods
from .models import Appointment
from system.models import Message
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.decorators import authentication_classes, permission_classes


@api_view(['GET'])
def get_athlete_dashboard(request):
    return Response({"message": "Athlete Dashboard"})


@api_view(['POST'])
def create_appointment(request):
    # example fields: athlete_id, date, time, trainer_name, notes
    athlete_id = request.data.get('athlete_id')
    date = request.data.get('date')
    time = request.data.get('time')
    trainer_name = request.data.get('trainer_name', "")
    notes = request.data.get('notes', "")

    # parse date/time or store as strings, up to you
    # example:
    appt_date = date  # might parse to a datetime object
    appt_time = time

    # create the record
    new_appt = Appointment.objects.create(
        athlete_id=athlete_id,
        date=appt_date,
        time=appt_time,
        trainer_name=trainer_name,
        notes=notes
    )

    return Response({"success": True, "appointment_id": new_appt.id})

@api_view(['GET'])
def get_status(request, athlete_id):

    try: 
        athlete = CustomUser.objects.get(id=int(athlete_id))
    except ValueError:
        athlete = CustomUser.objects.get(clerk_id=athlete_id)
    
    try:
        status_object = AthleteStatus.objects.get(athlete_id=athlete)


        return JsonResponse({
            'athlete_id': athlete.id,
            'athlete_name': f"{athlete.first_name} {athlete.last_name}",
            'athlete_sport': athlete.sport,
            'status': status_object.status,
            'injury': status_object.injury,
            'trainer_restrictions': status_object.trainer_restrictions,
            'date_of_injury': status_object.date_of_injury,
            'estimated_rtc': status_object.estimated_RTC,
            'detailed_plan': status_object.detailed_plan,
            'trainer_name': status_object.trainer_name,
            'exists' : True
        }, status=200)
    
    except ObjectDoesNotExist:
        athlete_queryset = AthleteStatus.objects.filter(athlete_id=athlete)
        if not athlete_queryset.exists():

            default_status = AthleteStatus.objects.create(
                athlete_id = athlete,
            )
            return JsonResponse({
                'athlete_id': athlete.id,
                'athlete_name': f"{athlete.first_name} {athlete.last_name}",
                'athlete_sport': athlete.sport,
                'status': default_status.status,
                'injury': default_status.injury,
                'trainer_restrictions': default_status.trainer_restrictions,
                'treatment_plan_id': default_status.treatment_plan_id.id if status_object.treatment_plan_id else None,
                'estimated_RTC': default_status.estimated_RTC,
                'date_of_injury': default_status.date_of_injury,
                'detailed_plan': default_status.detailed_plan,
                'trainer_name': default_status.trainer_name,
                'exists' : True
            }, status=200)
        
        else:
            return JsonResponse({"error": "ATHLETE STATUS DATABASE ERROR"}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"{e}"}, status=400)
    
    
@csrf_exempt
@api_view(['PUT', 'POST', 'GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def update_status(request):
    print("=== update_status view hit ===")
    try:
        athlete_id = request.data.get('athlete_id')
        athlete = CustomUser.objects.get(id=int(athlete_id))

        status_object = AthleteStatus.objects.get(athlete_id=athlete)

        """
        date_of_injury: null
        estimated_RTC: null
        injury:  null
        status: "healthy"
        trainer_restrictions: "No Restrictions"
        treatment_plan_id: null
        """

        status = request.data.get('status')
        injury = request.data.get('inj')  # Using 'inj' to match your frontend
        trainer_restrictions = request.data.get('restrictions') # Using 'restrictions'

        estimated_RTC_str = request.data.get('estimated_return') # Using 'estimated_return'
        date_of_injury_str = request.data.get('date_of_injury')

        detailed_plan = request.data.get('detailed_plan')

        trainer_name = request.data.get('trainer_name')

        if status:
            if status in ['healthy', 'restricted', 'out']:
                status_object.status = status
            else:
                return JsonResponse({"error": "Invalid status value"}, status=400)

        if injury is not None:
            status_object.injury = injury

        if trainer_restrictions is not None:
            status_object.trainer_restrictions = trainer_restrictions

        if detailed_plan is not None and detailed_plan != '':
            status_object.detailed_plan = detailed_plan

        if estimated_RTC_str:
            try:
                status_object.estimated_RTC = date.fromisoformat(estimated_RTC_str)
            except ValueError:
                return JsonResponse({"error": "Invalid date format for estimated_return (YYYY-MM-DD)"}, status=400)
        elif 'estimated_return' in request.data and request.data['estimated_return'] is None:
            status_object.estimated_RTC = None

        if date_of_injury_str:
            try:
                status_object.date_of_injury = date.fromisoformat(date_of_injury_str)
            except ValueError:
                return JsonResponse({"error": "Invalid date format for date_of_injury (YYYY-MM-DD)"}, status=400)
        elif 'date_of_injury' in request.data and request.data['date_of_injury'] is None:
            status_object.date_of_injury = None

        if trainer_name:
            status_object.trainer_name = trainer_name

        status_object.save()

        sport_coaches = CustomUser.objects.get(sport=athlete.sport, role="coach")
        sender = CustomUser.objects.get(first_name="Edward", last_name="Berry")

        message = Message.objects.create(
            sender= sender,
            recipients=sport_coaches,
            recipient_type='coach',
            content=f"{athlete.first_name} {athlete.last_name}'s status has been updated to {status_object.status}"
        )

        print(message)

        return JsonResponse({"success": True, "message": "Athlete status updated successfully"}, status=200)

    except Exception as e:
        return JsonResponse({"error": f"{e}"}, status=400)

@require_http_methods(["POST", "DELETE"])
def cancel_appointment(request, appt_id):
    try:
        appointment = Appointment.objects.get(id=appt_id)
        appointment.delete()  # if you want to delete it
        # OR you can do appointment.status = 'Cancelled' and appointment.save()
        return JsonResponse({'message': 'Appointment canceled successfully'}, status=200)
    except Appointment.DoesNotExist:
        return JsonResponse({'error': 'Appointment not found'}, status=404)