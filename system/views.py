from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from .models import Message
from users.models import CustomUser
import json
from django.utils import timezone
import requests
from bs4 import BeautifulSoup
import re

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

@api_view(['GET'])
def get_standings(request):
    try:
        # URL of the SSC standings page
        url = "https://sunshinestateconference.com/standings.aspx?path=mlax"
        
        # Add headers to mimic a browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        
        # Send GET request to the URL with headers and SSL verification disabled
        response = requests.get(url, headers=headers, verify=False, timeout=10)
        
        if response.status_code != 200:
            return JsonResponse({"error": f"Failed to fetch standings. Status code: {response.status_code}"}, status=500)
        
        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the standings table
        table = soup.find('table', {'class': 'sidearm-table'})
        if not table:
            return JsonResponse({"error": "Standings table not found"}, status=404)
        
        # Extract standings data
        standings = []
        rows = table.find_all('tr')[1:]  # Skip header row
        
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 8:  # Ensure we have enough columns
                try:
                    school = cols[1].get_text(strip=True)
                    conf = cols[2].get_text(strip=True)
                    overall = cols[4].get_text(strip=True)
                    pct = cols[5].get_text(strip=True)
                    streak = cols[7].get_text(strip=True)
                    
                    standings.append({
                        "school": school,
                        "conf": conf,
                        "overall": overall,
                        "pct": pct,
                        "streak": streak
                    })
                except IndexError as e:
                    continue
        
        if not standings:
            return JsonResponse({"error": "No standings data found"}, status=404)
            
        return JsonResponse({"standings": standings}, safe=False)
        
    except requests.RequestException as e:
        return JsonResponse({"error": f"Failed to fetch standings: {str(e)}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)

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

