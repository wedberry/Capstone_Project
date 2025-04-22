import time
import threading
from datetime import datetime, timedelta
from django.utils import timezone
from trainers.models import Appointment
from system.models import Message
from users.models import CustomUser
import traceback

class AppointmentChecker:
    """
    A service that continuously checks for upcoming appointments and sends notifications.
    """
    def __init__(self, check_interval=300, notification_window=60, window_start=57, window_end=62):
        """
        Initialize the appointment checker.
        
        Args:
            check_interval (int): How often to check for appointments (in seconds)
            notification_window (int): How many minutes before an appointment to send a notification
            window_start (int): Start of the notification window in minutes before appointment
            window_end (int): End of the notification window in minutes before appointment
        """
        self.check_interval = check_interval
        self.notification_window = notification_window
        self.window_start = window_start
        self.window_end = window_end
        self.running = False
        self.thread = None
        self.notified_appointments = set()  # Track appointments we've already notified about
        
    def start(self):
        """Start the appointment checker in a background thread."""
        if self.running:
            print("Appointment checker is already running.")
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._run)
        self.thread.daemon = True
        self.thread.start()
        
        # Get current time in local timezone and subtract 4 hours
        now = timezone.localtime(timezone.now()) - timedelta(hours=4)
        
        print("\n" + "="*50)
        print("APPOINTMENT CHECKER SERVICE STARTED")
        print("="*50)
        print(f"Check interval: {self.check_interval} seconds ({self.check_interval/60:.1f} minutes)")
        print(f"Notification window: {self.window_start}-{self.window_end} minutes before appointment")
        print(f"Current time: {now.strftime('%Y-%m-%d %H:%M:%S')} (local time, adjusted)")
        print("="*50 + "\n")
        
    def stop(self):
        """Stop the appointment checker."""
        self.running = False
        if self.thread:
            self.thread.join()
            print("Appointment checker stopped.")
            
    def _run(self):
        """The main loop that checks for appointments."""
        while self.running:
            try:
                self._check_appointments()
            except Exception as e:
                print(f"Error checking appointments: {e}")
                
            # Sleep for the check interval
            time.sleep(self.check_interval)
            
    def _check_appointments(self):
        """Check for upcoming appointments and send notifications."""
        try:
            # Use local time for all calculations
            now = timezone.localtime(timezone.now()) - timedelta(hours=4)
            
            # Calculate the time range for notifications (in local time)
            start_time = now + timedelta(minutes=self.window_start)
            end_time = now + timedelta(minutes=self.window_end)
            
            print(f"\n[{now.strftime('%Y-%m-%d %H:%M:%S')}] Checking for appointments between {start_time.strftime('%H:%M')} and {end_time.strftime('%H:%M')} (local time)")
            
            # Get appointments for today and tomorrow
            today = now.date()
            tomorrow = today + timedelta(days=1)
            
            upcoming_appointments = Appointment.objects.filter(
                date__in=[today, tomorrow]
            )
            
            print(f"Found {upcoming_appointments.count()} scheduled appointments for today and tomorrow")
            
            for appointment in upcoming_appointments:
                # Skip if we've already notified about this appointment
                if appointment.id in self.notified_appointments:
                    print(f"  - Skipping appointment #{appointment.id} (already notified)")
                    continue
                
                # Convert appointment date and time to datetime for comparison
                # First create a naive datetime
                appointment_datetime = datetime.combine(appointment.date, appointment.time)
                # Then make it timezone-aware using the local timezone
                appointment_datetime = timezone.make_aware(appointment_datetime)
                # Convert to local time
                appointment_datetime_local = timezone.localtime(appointment_datetime)
                
                # Calculate minutes until appointment (using local time)
                minutes_until = int((appointment_datetime_local - now).total_seconds() / 60)
                
                print(f"  - Appointment #{appointment.id}: {appointment_datetime_local.strftime('%Y-%m-%d %H:%M')} ({minutes_until} minutes away)")
                
                # Check if the appointment is within our notification window
                if self.window_start <= minutes_until <= self.window_end:
                    print(f"    ✓ SENDING NOTIFICATION: Appointment is {minutes_until} minutes away (within window {self.window_start}-{self.window_end})")
                    
                    # Get the trainer and athlete names
                    trainer_name = self._get_trainer_name(appointment.trainer_id)
                    athlete_name = self._get_athlete_name(appointment.athlete_id)
                    
                    # Send notification to athlete
                    self._send_notification(
                        appointment.athlete_id, 
                        "athlete", 
                        f"You have an appointment with {trainer_name} in {minutes_until} minutes."
                    )
                    
                    # Send notification to trainer
                    self._send_notification(
                        appointment.trainer_id, 
                        "trainer", 
                        f"You have an appointment with {athlete_name} in {minutes_until} minutes."
                    )
                    
                    # Mark this appointment as notified
                    self.notified_appointments.add(appointment.id)
                    print(f"    ✓ Notification sent to athlete and trainer")
                else:
                    print(f"    ✗ No notification: Appointment is {minutes_until} minutes away (outside window {self.window_start}-{self.window_end})")
            
        except Exception as e:
            print(f"Error checking appointments: {str(e)}")
            traceback.print_exc()
            
    def _send_notification(self, user_id, recipient_type, message_content):
        """Send a notification message to a user."""
        try:
            # Find a user to use as the sender (preferably a trainer)
            sender = CustomUser.objects.filter(role="trainer").first()
            if not sender:
                # If no trainer found, try to find any user
                sender = CustomUser.objects.first()
                if not sender:
                    print("No users found in the database. Cannot send notifications.")
                    return
                
            print(f"Using {sender.first_name} {sender.last_name} as the sender for notifications")
                
            # Create the notification message
            Message.objects.create(
                sender=sender,
                recipient_type=recipient_type,
                content=message_content
            )
            print(f"Notification sent to {recipient_type} {user_id}: {message_content}")
        except Exception as e:
            print(f"Error sending notification: {e}")
            traceback.print_exc()
            
    def _get_trainer_name(self, trainer_id):
        """Get the trainer's full name."""
        try:
            trainer = CustomUser.objects.get(clerk_id=trainer_id)
            return f"{trainer.first_name} {trainer.last_name}"
        except CustomUser.DoesNotExist:
            return "your trainer"
            
    def _get_athlete_name(self, athlete_id):
        """Get the athlete's full name."""
        try:
            athlete = CustomUser.objects.get(clerk_id=athlete_id)
            return f"{athlete.first_name} {athlete.last_name}"
        except CustomUser.DoesNotExist:
            return "an athlete" 