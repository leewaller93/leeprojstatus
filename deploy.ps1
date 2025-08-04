# deploy.ps1 - Simple, reliable deployment script
# This script deploys both frontend and backend

Write-Host "=== DEPLOYMENT STARTING ===" -ForegroundColor Green

# Step 1: Deploy Frontend (GitHub Pages)
Write-Host "Step 1: Deploying frontend to GitHub Pages..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}

npx gh-pages -d build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Frontend deployed successfully" -ForegroundColor Green

# Step 2: Deploy Backend (Render)
Write-Host "Step 2: Deploying backend to Render..." -ForegroundColor Yellow

# Commit and push backend changes
cd has-status-backend
git add .
git commit -m "Backend update $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push
cd ..

# Update submodule reference
git add has-status-backend
git commit -m "Update backend submodule $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push

Write-Host "Backend deployment triggered" -ForegroundColor Green

# Step 3: Wait and verify
Write-Host "Step 3: Waiting for backend to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

try {
    $response = Invoke-WebRequest -Uri "https://has-status-backend.onrender.com/api/phases?clientId=demo" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "Backend is ready!" -ForegroundColor Green
    }
} catch {
    Write-Host "Backend not ready yet, but deployment was triggered" -ForegroundColor Yellow
}

Write-Host "=== DEPLOYMENT COMPLETE ===" -ForegroundColor Green
Write-Host "Frontend: https://leewaller93.github.io/leeprojstatus/" -ForegroundColor Cyan
Write-Host "Backend: https://has-status-backend.onrender.com/" -ForegroundColor Cyan 