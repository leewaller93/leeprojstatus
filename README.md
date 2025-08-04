# HAS Status Report Application

A comprehensive project status tracking application with multi-tenant support, team management, and automated task templates.

## 🏗️ Architecture

### Frontend (React)
- **Location**: Root directory (`src/App.js`)
- **Deployment**: GitHub Pages
- **URL**: https://leewaller93.github.io/leeprojstatus/

### Backend (Node.js + Express + MongoDB)
- **Location**: `has-status-backend/` submodule
- **Deployment**: Render
- **URL**: https://has-status-backend.onrender.com/

## 🚀 Quick Start

### For Development:
```bash
# Install frontend dependencies
npm install

# Start frontend development server
npm start

# Backend is deployed on Render (auto-deploys on git push)
```

### For Deployment:
```bash
# Deploy everything (frontend + backend)
.\deploy.ps1
```

## 📋 Core Features

### 1. Multi-Tenant Architecture
- Each client has isolated data via `clientId`
- Separate team members, phases, and projects per client
- No data leakage between clients

### 2. PHGHAS Team Management
- **Automatic Creation**: PHGHAS team member created when applying standard template
- **Email**: phghas@phg.com
- **Organization**: PHG
- **Assignment**: All standard template tasks automatically assigned to PHGHAS

### 3. Standard Task Template
- **16 predefined tasks** covering project lifecycle
- **Automatic Assignment**: All tasks assigned to PHGHAS
- **Status**: All tasks start as "Outstanding"
- **One-Click Application**: Apply to any client instantly

### 4. Team Member Management
- **Add Members**: Manual addition with email and organization
- **Delete Members**: 
  - No tasks: Direct deletion
  - With tasks: Prompts for reassignment (defaults to PHGHAS)
- **Audit Trail**: All deletions logged with reassignment details

## 🔧 Key Functions

### Frontend (`src/App.js`)

#### `applyPHGStandardTemplate()`
- Creates PHGHAS team member if doesn't exist
- Applies 16 standard tasks
- Assigns all tasks to PHGHAS
- Sets all tasks to "Outstanding" status

#### `deleteTeamMember()`
- Checks if member has assigned tasks
- If yes: Prompts for reassignment (defaults to PHGHAS)
- If no: Direct deletion
- Logs all actions to audit trail

#### `PHG_STANDARD_TEMPLATE`
- Array of 16 predefined tasks
- All `assigned_to` fields set to "PHGHAS"
- Covers: Planning, Development, Testing, Deployment, etc.

### Backend (`has-status-backend/server.js`)

#### `seedDemoData()`
- Creates only PHGHAS team member (no unwanted members)
- Sets up demo client data
- Initializes MongoDB collections

#### API Endpoints:
- `GET /api/phases` - Get phases for client
- `POST /api/phases` - Create new phase
- `GET /api/team` - Get team members for client
- `POST /api/invite` - Add team member
- `DELETE /api/team/:id` - Delete team member
- `POST /api/seed` - Seed demo data

## 🗄️ Database Schema

### Phase Schema
```javascript
{
  name: String,
  tasks: [{
    title: String,
    assigned_to: String,
    status: String,
    due_date: Date
  }],
  clientId: String
}
```

### Team Schema
```javascript
{
  name: String,
  email: String,
  organization: String,
  clientId: String
}
```

### Audit Trail Schema
```javascript
{
  action: String,
  details: String,
  timestamp: Date,
  clientId: String
}
```

## 🚀 Deployment Process

### Frontend (GitHub Pages)
1. `npm run build` - Build React app
2. `npx gh-pages -d build` - Deploy to GitHub Pages
3. Available at: https://leewaller93.github.io/leeprojstatus/

### Backend (Render)
1. Commit changes to `has-status-backend/` submodule
2. Push to trigger Render auto-deploy
3. Available at: https://has-status-backend.onrender.com/

### Complete Deployment
```bash
.\deploy.ps1
```

## 🧪 Testing Checklist

### Standard Template Functionality
- [ ] Click "Apply Standard Template" → PHGHAS created
- [ ] All 16 tasks assigned to PHGHAS
- [ ] All tasks in "Outstanding" status
- [ ] No duplicate PHGHAS members

### Team Member Management
- [ ] Add new team member manually
- [ ] Delete member without tasks (direct deletion)
- [ ] Delete member with tasks (reassignment prompt)
- [ ] Verify audit trail entries

### Multi-tenancy
- [ ] Client data isolation
- [ ] PHGHAS per client (not global)
- [ ] No cross-client data leakage

## 🔍 Troubleshooting

### If PHGHAS not created:
- Check browser console for errors
- Verify backend health: https://has-status-backend.onrender.com/health
- Check `/api/invite` endpoint

### If tasks not assigned to PHGHAS:
- Verify `PHG_STANDARD_TEMPLATE` has `assigned_to: "PHGHAS"`
- Clear browser cache and retry
- Check `applyPHGStandardTemplate` function

### If deployment fails:
- Use `.\deploy.ps1` for complete deployment
- Check git status is clean
- Verify both services are responding

## 📁 File Structure

```
├── src/
│   └── App.js                 # Main React application
├── has-status-backend/        # Backend submodule
│   ├── server.js             # Express server + API
│   └── package.json          # Backend dependencies
├── package.json              # Frontend dependencies
├── render.yaml               # Render deployment config
├── .renderignore             # Render ignore rules
├── deploy.ps1               # Deployment script
└── README.md                # This file
```

## 🎯 Business Rules

1. **PHGHAS Creation**: Only via standard template application
2. **Task Assignment**: Standard template tasks → PHGHAS only
3. **Team Member Deletion**: With tasks requires reassignment
4. **Multi-tenancy**: Complete data isolation per client
5. **Audit Trail**: All deletions logged with reassignment details

## 🔗 URLs

- **Frontend**: https://leewaller93.github.io/leeprojstatus/
- **Backend**: https://has-status-backend.onrender.com/
- **Health Check**: https://has-status-backend.onrender.com/health

---

**Note**: This application is designed for professional project management with automated team member creation and task assignment workflows.
