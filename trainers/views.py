from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse

@api_view(['GET'])
def get_upcoming_appointments(request, clerk_id):
    return JsonResponse({"appointments": [{"date": "01/01/2025", "time": "12:00:00", "trainer_name": "Alyssa"}]}, safe=False)

