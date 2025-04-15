import os
import subprocess
import time
import signal
import sys

BACKEND_DIR = os.path.join(os.getcwd(), "backend")
FRONTEND_DIR = os.path.join(os.getcwd(), "frontend")
backend_process = None
frontend_process = None
worker_process = None
beat_process = None

def start_backend():
    global backend_process
    print("Starting Django backend...")
    backend_process = subprocess.Popen(["python", "manage.py", "runserver"])


def start_frontend():
    global frontend_process
    print("Starting React frontend...")
    if not os.path.exists(FRONTEND_DIR):
        print(f"Error: Frontend directory not found at {FRONTEND_DIR}")
        print("Please create a React project in the frontend directory first.")
        return

    try:
        # Store original directory
        original_dir = os.getcwd()
        # Change to frontend directory
        os.chdir(FRONTEND_DIR)
        # Use npm from PATH
        npm_cmd = 'npm.cmd' if sys.platform == 'win32' else 'npm'
        print("Installing dependencies...")
        result = subprocess.run([npm_cmd, 'install'], 
                              capture_output=True, 
                              text=True)
        if result.returncode != 0:
            print(f"Error installing dependencies: {result.stderr}")
            return

        print("Starting React development server...")
        frontend_process = subprocess.Popen([npm_cmd, 'start'],
                                          shell=True,
                                          env=dict(os.environ))
        
        # Change back to original directory
        os.chdir(original_dir)

    except subprocess.CalledProcessError as e:
        print(f"Error running npm commands: {e}")
        return

    except FileNotFoundError:
        print("Error: npm not found. Please make sure Node.js is installed and in your PATH.")
        print("You can download Node.js from https://nodejs.org/")
        return

    except Exception as e:
        print(f"Unexpected error: {e}")
        return

def stop_servers():
    if backend_process:
        print("Stopping Django backend...")
        backend_process.terminate()
        backend_process.wait()

    if frontend_process:
        print("Stopping React frontend...")
        frontend_process.terminate()
        frontend_process.wait()
        
    if worker_process:
        print("Stopping Celery worker...")
        worker_process.terminate()
        worker_process.wait()
        
    if beat_process:
        print("Stopping Celery beat scheduler...")
        beat_process.terminate()
        beat_process.wait()

def start_celery():
    """Start the Celery worker and beat scheduler."""
    print("Starting Celery worker and beat scheduler...")
    
    # Start the Celery worker
    worker_process = subprocess.Popen(
        ["celery", "-A", "system.celery", "worker", "--loglevel=info"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    
    # Start the Celery beat scheduler
    beat_process = subprocess.Popen(
        ["celery", "-A", "system.celery", "beat", "--loglevel=info"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    
    return worker_process, beat_process

if __name__ == "__main__":
    try:
        start_backend()
        time.sleep(5)  # Give Django time to start
        start_frontend()
        time.sleep(5)  # Give React time to start
        start_celery()
        # Only enter the loop if all processes started successfully
        if backend_process and frontend_process and worker_process and beat_process:
            print("All servers started successfully.")
            print("Press Ctrl+C to stop all servers.")
            
            # Keep the script running
            while True:
                time.sleep(1)
        else:
            print("Error: One or more servers failed to start.")
            stop_servers()

    except KeyboardInterrupt:
        print("\nShutting down servers...")
        stop_servers()
        print("Servers stopped.")



