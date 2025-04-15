from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from twilio.rest import Client
from .models import SMSReminder
from trainers.models import Appointment
from users.models import CustomUser
from django.conf import settings
import logging
from .config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_VIRTUAL_NUMBER

# Set up logging
logger = logging.getLogger(__name__)

@shared_task
def send_sms_reminder(appointment_id):
    """
    Send an SMS reminder for a specific appointment.
    
    Args:
        appointment_id: The ID of the appointment to send a reminder for.
    """
    try:
        # Get the appointment
        appointment = Appointment.objects.get(id=appointment_id)
        
        # Check if a reminder has already been sent
        if SMSReminder.objects.filter(appointment=appointment).exists():
            logger.info(f"Reminder already sent for appointment {appointment_id}")
            return
        
        # Get the athlete's phone number
        athlete = CustomUser.objects.get(clerk_id=appointment.athlete_id)
        phone_number = f"{athlete.phone}"
        
        # Get the trainer's name
        trainer = CustomUser.objects.get(clerk_id=appointment.trainer_id)
        trainer_name = f"{trainer.first_name} {trainer.last_name}"
        
        # Format the message
        message = (
            f"Reminder: You have an appointment with {trainer_name} "
            f"on {appointment.date} at {appointment.time}. "
            f"Type: {appointment.appointment_type}. "
        )
        
        # Initialize Twilio client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Send the message
        message = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=TWILIO_VIRTUAL_NUMBER
        )
        
        # Log the successful reminder
        logger.info(f"Sent SMS reminder for appointment {appointment_id} to {TWILIO_VIRTUAL_NUMBER}")
        
        # Create a record of the sent reminder
        SMSReminder.objects.create(
            appointment=appointment,
            phone_number=phone_number,
            message=message,
            status='sent'
        )
        
    except Appointment.DoesNotExist:
        logger.error(f"Appointment {appointment_id} not found")
    except CustomUser.DoesNotExist:
        logger.error(f"User not found for appointment {appointment_id}")
    except Exception as e:
        logger.error(f"Error sending SMS reminder for appointment {appointment_id}: {str(e)}")
        
        # Create a record of the failed reminder
        try:
            SMSReminder.objects.create(
                appointment=appointment,
                phone_number=phone_number,
                message=message,
                status='failed',
                error_message=str(e)
            )
        except:
            pass

@shared_task
def check_and_send_reminders():
    """
    Check for appointments that are coming up in the next 2 hours and send reminders.
    """
    # Calculate the time window (2 hours from now, with a 15-minute buffer)
    now = timezone.now()
    start_time = now + timedelta(hours=1, minutes=45)  # 1 hour and 45 minutes from now
    end_time = now + timedelta(hours=2, minutes=15)    # 2 hours and 15 minutes from now
    
    # Get appointments in the time window
    upcoming_appointments = Appointment.objects.filter(
        date=now.date(),
        time__gte=start_time.time(),
        time__lte=end_time.time()
    )
    
    # Send reminders for each appointment
    for appointment in upcoming_appointments:
        # Check if a reminder has already been sent
        if not SMSReminder.objects.filter(appointment=appointment).exists():
            # Send the reminder
            send_sms_reminder.delay(appointment.id)
            logger.info(f"Scheduled reminder for appointment {appointment.id}") 