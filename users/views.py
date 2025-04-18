from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import CustomUser

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def check_user(request, clerk_id):    
    user_queryset = CustomUser.objects.filter(clerk_id=clerk_id)
    exists = user_queryset.exists()
    
    # Get role only if user exists
    role = user_queryset.first().role if exists else None

    # Don't manually set CORS headers here, let middleware handle it
    return JsonResponse({"role": role, "exists": exists})

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def get_user(request, clerk_id):
    try:
        user = CustomUser.objects.get(clerk_id=clerk_id)
        exists = True if user else False

        id = user.clerk_id
        first_name = user.first_name
        last_name = user.last_name

        role = user.role

        sport = user.sport
        
        phone = user.phone
        email = user.email

        return JsonResponse({'exists': exists, 'id': id, 'first_name': first_name, 'last_name': last_name, 'role': role, 'sport': sport, 'phone': phone, 'email': email})
    
    except Exception as e:
        return JsonResponse({"error": f"{e}"}, status=400)


@csrf_exempt
def create_user(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if not CustomUser.objects.filter(clerk_id=data["clerk_id"]).exists():
            CustomUser.objects.create(
                clerk_id=data["clerk_id"],
                username = data["clerk_id"],
                email=data["email"],
                phone=data["phone"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                role=data["role"],
                sport=data["sport"],
            )
            return JsonResponse({"success": True})
        return JsonResponse({"error": "User already exists"}, status=400)

# Used by profile page to update user info. Can be used in all dashboards
@csrf_exempt
@require_http_methods(["PUT"])
def update_user(request, clerk_id):
    try:
        user = CustomUser.objects.get(clerk_id=clerk_id)
        data = json.loads(request.body)
        
        # Update fields if they exist in the request
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        if 'sport' in data:
            user.sport = data['sport']
            
        # Save the changes
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Profile updated successfully',
            'data': {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone': user.phone,
                'sport': user.sport
            }
        })
        
    except CustomUser.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)