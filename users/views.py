from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import CustomUser

import logging
logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def check_user(request, clerk_id):
    
    logger.info(f"Received request for clerk_id: {clerk_id}")
    user_queryset = CustomUser.objects.filter(clerk_id=clerk_id)
    exists = user_queryset.exists()
    
    # Get role only if user exists
    role = user_queryset.first().role if exists else None

    # Don't manually set CORS headers here, let middleware handle it
    return JsonResponse({"role": role, "exists": exists})

@csrf_exempt
def create_user(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if not CustomUser.objects.filter(clerk_id=data["clerk_id"]).exists():
            CustomUser.objects.create(
                clerk_id=data["clerk_id"],
                email=data["email"],
                phone=data["phone"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                role=data["role"],
            )
            return JsonResponse({"success": True})
        return JsonResponse({"error": "User already exists"}, status=400)