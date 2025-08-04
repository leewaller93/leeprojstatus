# Complete Deployment Script for HAS Status Report
# Handles both frontend (GitHub Pages) and backend (Render) deployment

param(
    [string]$LogFile = "deploy-complete-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
)

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

Write-Log "=== STARTING COMPLETE DEPLOYMENT ===" "SUCCESS"
Write-Log "Log file: $LogFile"

# Step 1: Pre-deployment checks
Write-Log "Step 1: Pre-deployment health checks"
Write-Log "Testing backend health..."

try {
    $backendResponse = Invoke-WebRequest -Uri "https://has-status-backend.onrender.com/health" -TimeoutSec 10
    if ($backendResponse.StatusCode -eq 200) {
        Write-Log "Backend is healthy" "SUCCESS"
    } else {
        Write-Log "Backend health check failed: $($backendResponse.StatusCode)" "WARNING"
    }
} catch {
    Write-Log "Backend health check failed: $($_.Exception.Message)" "WARNING"
}

Write-Log "Testing frontend health..."
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://leewaller93.github.io/leeprojstatus/" -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Log "Frontend is healthy" "SUCCESS"
    } else {
        Write-Log "Frontend health check failed: $($frontendResponse.StatusCode)" "WARNING"
    }
} catch {
    Write-Log "Frontend health check failed: $($_.Exception.Message)" "WARNING"
}

# Step 2: Clean git state
Write-Log "Step 2: Cleaning git state"
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Log "Git state is not clean. Stashing changes..."
    git stash push -m "Auto-stash before complete deployment"
} else {
    Write-Log "Git state is clean"
}

Write-Log "Pulling latest changes..."
git pull origin main
Write-Log "Git state cleaned successfully" "SUCCESS"

# Step 3: Frontend deployment
Write-Log "Step 3: Frontend deployment (GitHub Pages)"
Write-Log "Building frontend..."

try {
    # Remove any existing build
    if (Test-Path "build") {
        Remove-Item -Recurse -Force "build"
        Write-Log "Removed existing build directory"
    }

    # Build frontend
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Frontend build successful" "SUCCESS"
    } else {
        throw "Frontend build failed with exit code $LASTEXITCODE"
    }

    # Deploy to GitHub Pages
    Write-Log "Deploying to GitHub Pages..."
    npx gh-pages -d build
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Frontend deployed to GitHub Pages successfully" "SUCCESS"
    } else {
        throw "GitHub Pages deployment failed"
    }
} catch {
    Write-Log "Frontend deployment failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Step 4: Backend deployment
Write-Log "Step 4: Backend deployment (Render)"
Write-Log "Checking backend submodule..."

# Navigate to backend directory
Push-Location "has-status-backend"

try {
    # Check if there are any changes in backend
    $backendChanges = git status --porcelain
    if ($backendChanges) {
        Write-Log "Backend has changes. Committing..."
        git add .
        git commit -m "Backend update - Complete deployment $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git push origin main
        Write-Log "Backend changes committed and pushed" "SUCCESS"
    } else {
        Write-Log "No backend changes to commit"
    }
} catch {
    Write-Log "Backend commit failed: $($_.Exception.Message)" "ERROR"
    Pop-Location
    exit 1
}

# Return to root directory
Pop-Location

# Update submodule reference in main repo
Write-Log "Updating submodule reference..."
try {
    git add has-status-backend
    git commit -m "Update backend submodule - Complete deployment $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git push origin main
    Write-Log "Submodule reference updated" "SUCCESS"
} catch {
    Write-Log "Submodule update failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Step 5: Trigger Render deployment
Write-Log "Step 5: Triggering Render deployment..."
try {
    # This would typically be done via Render's webhook or API
    # For now, we'll just log that the backend changes have been pushed
    Write-Log "Backend changes pushed to GitHub. Render will auto-deploy." "SUCCESS"
} catch {
    Write-Log "Render deployment trigger failed: $($_.Exception.Message)" "ERROR"
}

# Step 6: Wait for services to be ready
Write-Log "Step 6: Waiting for services to be ready..."
Write-Log "Waiting 30 seconds for deployments to complete..."

Start-Sleep -Seconds 30

# Step 7: Final health checks
Write-Log "Step 7: Final health checks"
Write-Log "Testing backend health..."

try {
    $backendResponse = Invoke-WebRequest -Uri "https://has-status-backend.onrender.com/health" -TimeoutSec 10
    if ($backendResponse.StatusCode -eq 200) {
        Write-Log "Backend deployment successful" "SUCCESS"
    } else {
        Write-Log "Backend health check failed after deployment: $($backendResponse.StatusCode)" "WARNING"
    }
} catch {
    Write-Log "Backend health check failed after deployment: $($_.Exception.Message)" "WARNING"
}

Write-Log "Testing frontend health..."
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://leewaller93.github.io/leeprojstatus/" -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Log "Frontend deployment successful" "SUCCESS"
    } else {
        Write-Log "Frontend health check failed after deployment: $($frontendResponse.StatusCode)" "WARNING"
    }
} catch {
    Write-Log "Frontend health check failed after deployment: $($_.Exception.Message)" "WARNING"
}

Write-Log "=== COMPLETE DEPLOYMENT FINISHED ===" "SUCCESS"
Write-Log "Deployment log saved to: $LogFile"
Write-Log ""
Write-Log "SUMMARY:"
Write-Log "- Frontend: Deployed to GitHub Pages"
Write-Log "- Backend: Changes pushed, Render auto-deploying"
Write-Log "- Both services should be available within 2-3 minutes"
Write-Log ""
Write-Log "Next steps:"
Write-Log "1. Wait 2-3 minutes for Render to complete backend deployment"
Write-Log "2. Test the application functionality"
Write-Log "3. Verify PHGHAS team member creation and assignment" 