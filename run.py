import os
import subprocess
import time
import signal
import sys

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

if __name__ == "__main__":
    try:
        start_backend()
        time.sleep(5)  # Give Django time to start
        start_frontend()
        # Only enter the loop if both processes started successfully
        if backend_process and frontend_process:
            print("Both backend and frontend are running. Press Ctrl+C to stop.")
            while backend_process.poll() is None and frontend_process and frontend_process.poll() is None:
                time.sleep(1)
        else:
            print("Error: One or both servers failed to start.")
            stop_servers()

    except KeyboardInterrupt:
        print("\nShutting down servers...")
        stop_servers()
        print("Servers stopped.")


