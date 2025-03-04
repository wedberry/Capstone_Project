from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse

@api_view(['GET'])
def get_notifications(request, clerk_id):
    return JsonResponse({"notifications": [{"date": "01/01/2025", "time": "12:00:00", "message": "This is a fake notification \n skdjnfso ewoirf sodifs osid"}]}, safe=False)

