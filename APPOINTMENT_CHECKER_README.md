# Appointment Checker Service

This service continuously monitors upcoming appointments and sends notifications to both athletes and trainers when an appointment is approaching.

## Features

- Runs in the background as a separate process
- Checks for upcoming appointments every 5 minutes by default
- Sends notifications to both athletes and trainers
- Configurable notification window (default: 57-62 minutes before appointment)
- Prevents duplicate notifications for the same appointment
- Checks for appointments within a specific time range to ensure no appointments are missed

## How to Run

### Using Django Management Command

```bash
# Run with default settings (check every 5 minutes, notify 57-62 minutes before appointment)
python manage.py run_appointment_checker

# Customize check interval and notification window
python manage.py run_appointment_checker --interval 600 --window 60 --window-start 55 --window-end 65
```

### Using Standalone Script

```bash
# Run with default settings
python run_appointment_checker.py

# Customize check interval and notification window
python run_appointment_checker.py --interval 600 --window 60 --window-start 55 --window-end 65
```

## How It Works

1. The service runs in a background thread and checks for upcoming appointments every 5 minutes.
2. It looks for appointments scheduled for today and tomorrow that fall within the notification window (57-62 minutes away by default).
3. For each appointment found, it calculates the exact minutes until the appointment and includes this in the notification.
4. Notifications are sent using the existing notification system and will appear in the user's dashboard.
5. The service keeps track of which appointments it has already notified about to prevent duplicate notifications.

### Time Range Checking

The service uses a specific time range approach to ensure no appointments are missed:

- It checks for appointments that are scheduled between (now + window_start) and (now + window_end) minutes
- By default, it looks for appointments between 57 and 62 minutes away
- This ensures that even if an appointment falls between check intervals, it will still be detected
- For example, if the check interval is 5 minutes and the window is 57-62 minutes, it will find all appointments scheduled in that 5-minute window

## Requirements

- A system user must exist in the database with the role "system" to send notifications.
- The Django server must be running for the management command to work.

## Troubleshooting

- If notifications aren't being sent, check that a system user exists in the database.
- If the service isn't finding appointments, check that the date and time fields in the database are correctly formatted.
- For debugging, you can reduce the check interval to see results more quickly. 