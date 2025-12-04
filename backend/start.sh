#!/bin/bash
# Startup script for Render deployment
# Binds to 0.0.0.0 to allow external access and uses PORT environment variable

PORT=${PORT:-8000}
uvicorn main:app --host 0.0.0.0 --port $PORT

