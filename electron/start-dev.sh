#!/bin/bash

echo "🚀 Starting BethPresenter Development Environment..."
echo ""

# Check if frontend is already running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend already running on port 3000"
else
    echo "📦 Starting Frontend (Vite)..."
    cd ../frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ../electron
    
    # Wait for frontend to be ready
    echo "⏳ Waiting for frontend to start..."
    for i in {1..10}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Frontend is ready!"
            break
        fi
        sleep 1
    done
fi

echo ""

# Check if port 3131 is in use
if lsof -ti:3131 > /dev/null 2>&1; then
    echo "⚠️  Port 3131 already in use. Killing old process..."
    lsof -ti:3131 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "🖥️  Starting Electron..."
echo ""

# Start Electron
npm start
