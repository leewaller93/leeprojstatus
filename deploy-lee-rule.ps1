# deploy-lee-rule.ps1
# Bulletproof Lee Rule deployment script
# 1. Commit and push ALL changes (frontend + backend)
# 2. Update and push backend submodule reference
# 3. Trigger Render backend deploy via deploy hook
# 4. Build and deploy frontend
# 5. Verify deployment

Write-Host "[Lee Rule] Starting bulletproof deployment..." -ForegroundColor Green

# 1. Commit and push ALL changes in main repo first
Write-Host "[Lee Rule] Committing and pushing ALL changes..." -ForegroundColor Yellow
git add .
$main_msg = "Update frontend and configuration - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m "$main_msg"
if ($LASTEXITCODE -ne 0) {
    Write-Host "No main repo changes to commit." -ForegroundColor Yellow
}
git push

# 2. Commit and push backend changes
Write-Host "[Lee Rule] Committing and pushing backend changes..." -ForegroundColor Yellow
Push-Location has-status-backend
git add .
$backend_msg = "Update backend - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m "$backend_msg"
if ($LASTEXITCODE -ne 0) {
    Write-Host "No backend changes to commit." -ForegroundColor Yellow
}
git push
Pop-Location

# 3. Update submodule reference in main repo and push
Write-Host "[Lee Rule] Updating submodule reference..." -ForegroundColor Yellow
git add has-status-backend
git commit -m "Update backend submodule ref - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
if ($LASTEXITCODE -ne 0) {
    Write-Host "No submodule changes to commit." -ForegroundColor Yellow
}
git push

# 4. Trigger Render backend deploy
Write-Host "[Lee Rule] Triggering Render backend deploy..." -ForegroundColor Yellow
$renderResponse = curl.exe -fsSL "https://api.render.com/deploy/srv-d1se50je5dus739jr700?key=PEv39pOpIA4"
if ($LASTEXITCODE -eq 0) {
    Write-Host "[Lee Rule] Render backend deploy triggered successfully!" -ForegroundColor Green
    Write-Host "[Lee Rule] Waiting for backend to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 45
    
    # Verify backend is responding
    $maxAttempts = 10
    $attempt = 0
    do {
        $attempt++
        Write-Host "[Lee Rule] Verifying backend (attempt $attempt/$maxAttempts)..." -ForegroundColor Yellow
        try {
            $response = Invoke-WebRequest -Uri "https://has-status-backend.onrender.com/api/phases?clientId=demo" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "[Lee Rule] Backend is responding! Status: $($response.StatusCode)" -ForegroundColor Green
                break
            }
        } catch {
            Write-Host "[Lee Rule] Backend not ready yet, waiting..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    } while ($attempt -lt $maxAttempts)
    
    if ($attempt -eq $maxAttempts) {
        Write-Host "[Lee Rule] WARNING: Backend verification failed after $maxAttempts attempts" -ForegroundColor Red
    }
    
    # Seed backend data
    Write-Host "[Lee Rule] Seeding backend demo data..." -ForegroundColor Yellow
    $seedResponse = curl.exe -X POST "https://has-status-backend.onrender.com/api/seed"
    Write-Host "[Lee Rule] Seed response: $seedResponse" -ForegroundColor Green
} else {
    Write-Host "[Lee Rule] ERROR: Render backend deploy failed!" -ForegroundColor Red
    exit 1
}

# 5. Build and deploy frontend
Write-Host "[Lee Rule] Building and deploying frontend..." -ForegroundColor Yellow
npm run deploy:full
if ($LASTEXITCODE -eq 0) {
    Write-Host "[Lee Rule] Frontend deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "[Lee Rule] ERROR: Frontend deployment failed!" -ForegroundColor Red
    exit 1
}

# 6. Final verification
Write-Host "[Lee Rule] Performing final verification..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

try {
    $frontendResponse = Invoke-WebRequest -Uri "https://leewaller93.github.io/leeprojstatus/" -UseBasicParsing -TimeoutSec 15
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "[Lee Rule] ✅ FRONTEND VERIFIED: https://leewaller93.github.io/leeprojstatus/" -ForegroundColor Green
    } else {
        Write-Host "[Lee Rule] ⚠️ Frontend verification failed: Status $($frontendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[Lee Rule] ⚠️ Frontend verification failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

try {
    $backendResponse = Invoke-WebRequest -Uri "https://has-status-backend.onrender.com/api/phases?clientId=demo" -UseBasicParsing -TimeoutSec 10
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "[Lee Rule] ✅ BACKEND VERIFIED: https://has-status-backend.onrender.com/" -ForegroundColor Green
    } else {
        Write-Host "[Lee Rule] ⚠️ Backend verification failed: Status $($backendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[Lee Rule] ⚠️ Backend verification failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "[Lee Rule] 🚀 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "[Lee Rule] Frontend: https://leewaller93.github.io/leeprojstatus/" -ForegroundColor Cyan
Write-Host "[Lee Rule] Backend: https://has-status-backend.onrender.com/" -ForegroundColor Cyan
Write-Host "[Lee Rule] All systems are live and verified!" -ForegroundColor Green 