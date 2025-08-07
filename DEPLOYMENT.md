# DEPLOYMENT GUIDE

## THE ONLY DEPLOYMENT SCRIPT YOU NEED

**Use `dr1.ps1` for all deployments. All other deployment files have been deleted.**

## Quick Deploy

```powershell
# Deploy with custom commit message
.\dr1.ps1 "Your commit message here"

# Deploy with default commit message
.\dr1.ps1
```

## What dr1.ps1 Does

1. **Backend Deployment (Render)**
   - Commits and pushes backend changes
   - Updates submodule reference
   - Triggers Render deployment

2. **Frontend Deployment (GitHub Pages)**
   - Builds React app (`npm run build`)
   - Deploys to GitHub Pages (`npx gh-pages -d build`)

3. **Verification**
   - Waits for backend to be ready
   - Performs health checks
   - Verifies frontend accessibility

## URLs

- **Frontend**: https://leewaller93.github.io/leeprojstatus/
- **Backend**: https://has-status-backend.onrender.com/
- **Health Check**: https://has-status-backend.onrender.com/health

## Troubleshooting

If deployment fails:
1. Check git status: `git status`
2. Ensure you're in the main project directory
3. Verify backend submodule is properly configured
4. Check that all dependencies are installed: `npm install`

## Notes

- Backend deployment may take 1-2 minutes to fully deploy
- Frontend deployment is usually instant
- Health checks may fail initially while backend is still deploying 