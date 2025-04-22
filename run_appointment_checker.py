#!/usr/bin/env python
"""
Standalone script to run the appointment checker service.
This script can be used to run the appointment checker directly,
without using Django's management commands.
"""
import os
import sys
import time
import signal
import argparse
import traceback

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'capstone_project.settings')
import django
django.setup()

# Now we can import Django models
from system.appointment_checker import AppointmentChecker

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Run the appointment checker service')
    parser.add_argument('--interval', type=int, default=300,
                        help='Check interval in seconds (default: 300)')
    parser.add_argument('--window', type=int, default=60,
                        help='Notification window in minutes (default: 60)')
    parser.add_argument('--window-start', type=int, default=57,
                        help='Start of notification window in minutes (default: 57)')
    parser.add_argument('--window-end', type=int, default=62,
                        help='End of notification window in minutes (default: 62)')
    
    args = parser.parse_args()
    
    print("\n" + "="*50)
    print("STARTING APPOINTMENT CHECKER SERVICE")
    print("="*50)
    print(f"Check interval: {args.interval} seconds ({args.interval/60:.1f} minutes)")
    print(f"Notification window: {args.window_start}-{args.window_end} minutes before appointment")
    print("="*50 + "\n")
    
    # Create the appointment checker
    checker = AppointmentChecker(
        check_interval=args.interval,
        notification_window=args.window,
        window_start=args.window_start,
        window_end=args.window_end
    )
    
    # Set up signal handlers for graceful shutdown
    def signal_handler(sig, frame):
        print("\nShutting down appointment checker...")
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
        print("\nShutting down appointment checker...")
        checker.stop()

if __name__ == "__main__":
    main() 