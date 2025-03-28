from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from .models import Message
from users.models import CustomUser
import json
from django.utils import timezone

@api_view(['GET'])
def get_notifications(request, clerk_id):
    try:
        # Get the user's role to determine which messages to show
        user = CustomUser.objects.get(clerk_id=clerk_id)
        
        # If user is an athlete or trainer, show messages where their role matches recipient_type
        messages = Message.objects.filter(recipient_type=user.role.lower())
        
        notifications = []
        for msg in messages:
            notifications.append({
                "id": msg.id,
                "date": msg.created_at.strftime("%m/%d/%Y"),
                "time": msg.created_at.strftime("%H:%M:%S"),
                "message": msg.content,
                "sender": f"{msg.sender.first_name} {msg.sender.last_name}"
            })
        
        return JsonResponse({"notifications": notifications}, safe=False)
        
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@api_view(['POST'])
def send_message(request):
    try:
        data = json.loads(request.body)
        sender = CustomUser.objects.get(clerk_id=data.get('clerk_id'))
        
        message = Message.objects.create(
            sender=sender,
            recipient_type=data.get('recipient_type'),
            content=data.get('content')
        )
        
        return JsonResponse({
            "success": True,
            "message": "Message sent successfully",
            "data": {
                "id": message.id,
                "content": message.content,
                "recipient_type": message.recipient_type,
                "created_at": message.created_at.isoformat()
            }
        })
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

