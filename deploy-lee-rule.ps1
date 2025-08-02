# deploy-lee-rule.ps1
# Simple, reliable Lee Rule deployment script
# This script actually works and deploys changes properly

Write-Host "[Lee Rule] Starting deployment..." -ForegroundColor Green

# 1. Commit and push backend changes
Write-Host "[Lee Rule] Committing backend changes..." -ForegroundColor Yellow
Push-Location has-status-backend
git add .
git commit -m "Update backend - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push
Pop-Location

# 2. Update submodule reference and commit main repo
Write-Host "[Lee Rule] Updating main repo..." -ForegroundColor Yellow
git add has-status-backend
git commit -m "Update backend submodule - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push

# 3. Trigger Render backend deploy
Write-Host "[Lee Rule] Triggering Render deploy..." -ForegroundColor Yellow
$renderResponse = curl.exe -fsSL "https://api.render.com/deploy/srv-d1se50je5dus739jr700?key=PEv39pOpIA4"
Write-Host "[Lee Rule] Render response: $renderResponse" -ForegroundColor Green

# 4. Wait for backend to be ready
Write-Host "[Lee Rule] Waiting for backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 5. Seed backend data
Write-Host "[Lee Rule] Seeding backend..." -ForegroundColor Yellow
$seedResponse = curl.exe -X POST "https://has-status-backend.onrender.com/api/seed"
Write-Host "[Lee Rule] Seed response: $seedResponse" -ForegroundColor Green

# 6. Build and deploy frontend
Write-Host "[Lee Rule] Building frontend..." -ForegroundColor Yellow
npx react-scripts build
Write-Host "[Lee Rule] Deploying frontend..." -ForegroundColor Yellow
npx gh-pages -d build

Write-Host "[Lee Rule] ✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "[Lee Rule] Frontend: https://leewaller93.github.io/leeprojstatus/" -ForegroundColor Cyan
Write-Host "[Lee Rule] Backend: https://has-status-backend.onrender.com/" -ForegroundColor Cyan 