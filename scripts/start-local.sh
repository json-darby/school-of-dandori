#!/bin/bash

echo "Starting School of Dandori locally..."

echo "Starting Flask backend..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

sleep 3

echo "Starting Vite frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Application started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
