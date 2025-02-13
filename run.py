import os
import subprocess
import time
import signal

BACKEND_DIR = os.path.join(os.getcwd(), "backend")
FRONTEND_DIR = os.path.join(os.getcwd(), "frontend")

backend_process = None
frontend_process = None

def start_backend():
    global backend_process
    print("Starting Django backend...")
    backend_process = subprocess.Popen(["python", "manage.py", "runserver"])

def start_frontend():
    global frontend_process
    print("Starting React frontend...")
    os.chdir(FRONTEND_DIR)
    frontend_process = subprocess.Popen(["npm", "start"])

def stop_servers():
    if backend_process:
        print("Stopping Django backend...")
        backend_process.terminate()  # Try to terminate
        backend_process.wait()       # Wait for it to exit
    
    if frontend_process:
        print("Stopping React frontend...")
        frontend_process.terminate()  # Try to terminate
        frontend_process.wait()       # Wait for it to exit

if __name__ == "__main__":
    try:
        start_backend()
        time.sleep(5)  # Give Django time to start
        start_frontend()

        print("Both backend and frontend are running. Press Ctrl+C to stop.")
        
        # Keep script running by waiting for processes
        while backend_process.poll() is None and frontend_process.poll() is None:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nShutting down servers...")
        stop_servers()
        print("Servers stopped.")
