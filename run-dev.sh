#!/bin/bash

# Research Assistant AI - Development Startup Script
echo "🚀 Starting Research Assistant AI Development Environment"
echo "=============================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -f "backend/main.py" ]; then
    echo "❌ Backend files not found. Please ensure backend/main.py exists."
    exit 1
fi

# Set up Python virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "📦 Installing backend dependencies..."
source venv/bin/activate
pip install -r requirements.txt

echo ""
echo "🔑 API Key Configuration:"
echo "Make sure you have set your Tavily API key:"
echo "  export TAVILY_API_KEY='your-actual-tavily-api-key'"
echo ""

# Function to start backend
start_backend() {
    echo "🔧 Starting FastAPI backend on port 8000..."
    cd backend
    python start.py &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend started with PID: $BACKEND_PID"
}

# Function to start frontend
start_frontend() {
    echo "⚛️  Starting Next.js frontend on port 3000..."
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend started with PID: $FRONTEND_PID"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    echo "👋 Thanks for using Research Assistant AI!"
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

# Start services
start_backend
sleep 3
start_frontend

echo ""
echo "🎉 Research Assistant AI is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop the script
wait 