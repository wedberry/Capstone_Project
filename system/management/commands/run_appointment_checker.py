from django.core.management.base import BaseCommand
from system.appointment_checker import AppointmentChecker
import time
import signal
import sys

class Command(BaseCommand):
    help = 'Runs the appointment checker service to notify users of upcoming appointments'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=300,
            help='Check interval in seconds (default: 300)'
        )
        parser.add_argument(
            '--window',
            type=int,
            default=60,
            help='Notification window in minutes (default: 60)'
        )
        parser.add_argument(
            '--window-start',
            type=int,
            default=57,
            help='Start of notification window in minutes (default: 57)'
        )
        parser.add_argument(
            '--window-end',
            type=int,
            default=62,
            help='End of notification window in minutes (default: 62)'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting appointment checker service...'))
        
        # Create the appointment checker with the specified parameters
        checker = AppointmentChecker(
            check_interval=options['interval'],
            notification_window=options['window'],
            window_start=options['window_start'],
            window_end=options['window_end']
        )
        
        # Set up signal handlers for graceful shutdown
        def signal_handler(sig, frame):
            self.stdout.write(self.style.WARNING('Shutting down appointment checker...'))
            checker.stop()
            sys.exit(0)
            
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # Start the appointment checker
        checker.start()
        
        # Keep the main thread alive
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('Shutting down appointment checker...'))
            checker.stop() 