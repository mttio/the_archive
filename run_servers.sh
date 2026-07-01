#!/bin/bash

# Resolve the absolute path of the project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "=========================================================="
echo "Launching Portfolio & Blog Workspace Servers..."
echo "Project Path: $PROJECT_DIR"
echo "=========================================================="

# 1. Launch FastAPI Backend in a new Terminal window
osascript -e "tell application \"Terminal\"
    activate
    do script \"cd '$PROJECT_DIR/backend' && echo 'Starting Backend (Port 8000)...' && python3 -m uvicorn main:app --host 127.0.0.1 --port 8000\"
end tell"

# 2. Launch Vite Frontend in a new Terminal window
osascript -e "tell application \"Terminal\"
    activate
    do script \"cd '$PROJECT_DIR/frontend' && echo 'Starting Frontend Client (Port 5174)...' && npm run dev\"
end tell"

echo "Success: Servers launched in separate macOS Terminal windows."
