from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Appointment
from django.utils import timezone

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