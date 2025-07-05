#!/usr/bin/env python3
"""
Script to restart the backend server with proper error checking.
"""

import subprocess
import sys
import os
import time

def check_dependencies():
    """Check if all required dependencies are installed"""
    print("🔍 Checking dependencies...")
    try:
        import fastapi
        import uvicorn
        import tavily
        import google.generativeai
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install missing dependencies with: pip install -r requirements.txt")
        return False

def check_imports():
    """Check if all custom modules import correctly"""
    print("🔍 Checking custom module imports...")
    try:
        from tavily_mapper import tavily_mapper
        from llm_analyzer import llm_analyzer
        print("✅ All custom modules imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def check_syntax():
    """Check if main.py has correct syntax"""
    print("🔍 Checking main.py syntax...")
    try:
        import ast
        with open('main.py', 'r') as f:
            source = f.read()
        ast.parse(source)
        print("✅ main.py syntax is correct")
        return True
    except SyntaxError as e:
        print(f"❌ Syntax error in main.py: {e}")
        return False
    except Exception as e:
        print(f"❌ Error checking syntax: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting backend server...")
    try:
        # Kill any existing server on port 8000
        print("🔄 Stopping any existing server...")
        subprocess.run(["pkill", "-f", "uvicorn.*main:app"], capture_output=True)
        time.sleep(2)
        
        # Start the new server
        print("🌟 Starting new server on port 8000...")
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    print("🔧 Backend Server Restart Tool")
    print("=" * 40)
    
    # Change to backend directory if not already there
    if not os.path.exists('main.py'):
        if os.path.exists('backend/main.py'):
            os.chdir('backend')
            print("📁 Changed to backend directory")
        else:
            print("❌ Cannot find main.py. Please run from project root or backend directory.")
            return
    
    # Run checks
    if not check_dependencies():
        return
    
    if not check_syntax():
        return
        
    if not check_imports():
        return
    
    print("\n✅ All checks passed! Starting server...")
    print("📝 The server will start with auto-reload enabled")
    print("🌐 Visit http://localhost:8000/docs to see API documentation")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 40)
    
    start_server()

if __name__ == "__main__":
    main() 