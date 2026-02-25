@echo off
echo Starting School of Dandori locally...

echo Starting Flask backend...
start /B cmd /c "cd backend && python app.py"

timeout /t 3 /nobreak > nul

echo Starting Vite frontend...
start /B cmd /c "npm run dev"

echo.
echo Application started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo.
echo Press Ctrl+C to stop
pause
