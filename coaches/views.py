from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.models import CustomUser
from django.http import JsonResponse

@api_view(['GET'])
def get_coach_dashboard(request):
    return Response({"message": "Coach Dashboard"})

@api_view(['GET'])
def get_team_members(request, coach_id):
    try:
        # Get the coach's sport
        coach = CustomUser.objects.get(clerk_id=coach_id)
        coach_sport = coach.sport
        
        # Get all athletes with the same sport
        team_members = CustomUser.objects.filter(
            role='athlete',
            sport=coach_sport
        )
        
        # Format the response
        team_data = []
        for athlete in team_members:
            team_data.append({
                'id': athlete.clerk_id,
                'first_name': athlete.first_name,
                'last_name': athlete.last_name,
                'email': athlete.email,
                'phone': athlete.phone,
                'sport': athlete.sport
            })
            
        return JsonResponse({'team_members': team_data})
    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'Coach not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)