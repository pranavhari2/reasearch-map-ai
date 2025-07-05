#!/usr/bin/env python3
"""
Startup script for the Research Assistant API backend.
Run this to start the FastAPI server.
"""

import uvicorn
from main import app

if __name__ == "__main__":
    print("🚀 Starting Research Assistant API...")
    print("📊 API Documentation will be available at: http://localhost:8000/docs")
    print("🔍 Health check: http://localhost:8000/health")
    print("📝 Frontend should connect to: http://localhost:8000")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    ) 