Write-Host "Starting School of Dandori locally..." -ForegroundColor Green

Write-Host "`nStarting Flask backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python app.py"

Start-Sleep -Seconds 3

Write-Host "`nStarting Vite frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "`n✅ Application started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "`nTwo new PowerShell windows opened. Close them to stop the servers." -ForegroundColor Yellow
