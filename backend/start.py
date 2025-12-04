#!/usr/bin/env python3
"""
Startup script for Render deployment.
Binds to 0.0.0.0 to allow external access and uses PORT environment variable.
"""
import os
import uvicorn
from main import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        # Remove --reload in production for better performance
        reload=False
    )

