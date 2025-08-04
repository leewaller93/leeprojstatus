# Deployment Guide

## Quick Deploy

```bash
# Deploy everything (frontend + backend)
.\deploy.ps1
```

## Manual Deployment

### Frontend Only
```bash
npm run build
npx gh-pages -d build
```

### Backend Only
```bash
cd has-status-backend
git add .
git commit -m "Backend update"
git push
cd ..
git add has-status-backend
git commit -m "Update submodule"
git push
```

## URLs
- **Frontend**: https://leewaller93.github.io/leeprojstatus/
- **Backend**: https://has-status-backend.onrender.com/

## Troubleshooting

### If Render build fails:
1. Check `render.yaml` has correct `rootDir: has-status-backend`
2. Verify `.renderignore` excludes frontend files
3. Ensure backend `package.json` exists and is valid

### If frontend deployment fails:
1. Check `npm run build` works locally
2. Verify GitHub Pages settings
3. Check for syntax errors in `src/App.js`

### If backend is not responding:
1. Check Render dashboard for deployment status
2. Verify MongoDB connection
3. Check backend logs in Render dashboard

## Health Checks
```bash
# Test backend
curl https://has-status-backend.onrender.com/api/phases?clientId=demo

# Test frontend
curl https://leewaller93.github.io/leeprojstatus/
``` 