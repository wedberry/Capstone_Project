from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def get_trainer_dashboard(request):
    return Response({"message": "Trainer Dashboard"})