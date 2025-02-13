from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def get_coach_dashboard(request):
    return Response({"message": "Coach Dashboard"})