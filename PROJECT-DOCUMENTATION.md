# HAS Status Report - Complete Project Documentation

## Project Overview

**HAS Status Report** is a React-based project management application for hospital accounting services. It provides task tracking, team management, and status reporting capabilities with multi-tenant architecture.

### Key Features
- **Multi-tenant**: Each client has isolated data via `clientId`
- **Standard Templates**: Pre-defined task lists for quick setup
- **Team Management**: Add/remove team members with task reassignment
- **Task Tracking**: Four-stage workflow (Outstanding → Review/Discussion → In Process → Resolved)
- **Bulk Operations**: Mass updates and rule-based task modifications

## Architecture

### Frontend (React)
- **Location**: Root directory
- **Deployment**: GitHub Pages (`https://leewaller93.github.io/leeprojstatus`)
- **Key Files**:
  - `src/App.js` - Main application logic
  - `src/clientConfig.js` - Client configuration
  - `package.json` - Dependencies and scripts

### Backend (Node.js/Express)
- **Location**: `has-status-backend/`
- **Deployment**: Render.com
- **Key Files**:
  - `server.js` - API endpoints and database models
  - `package.json` - Backend dependencies

### Database (MongoDB)
- **Provider**: MongoDB Atlas
- **Models**: Phase, Team, Client, AuditTrail, WhiteboardState

## Core Business Logic

### PHGHAS Team Member Management
**CRITICAL REQUIREMENT**: PHGHAS must be automatically created and assigned to all standard template tasks.

#### Flow:
1. User clicks "Apply Standard Template"
2. System checks if PHGHAS team member exists
3. If not, creates PHGHAS via `/api/invite` endpoint
4. All template tasks are assigned to PHGHAS
5. Tasks start in "Outstanding" stage

#### PHGHAS Details:
- **Username**: `PHGHAS`
- **Email**: `phghas@phg.com`
- **Organization**: `PHG`

### Standard Template
The `PHG_STANDARD_TEMPLATE` contains 16 predefined tasks covering:
- General Ledger Review
- Accrual Process Assessment
- Chart of Accounts Validation
- Financial Statement Preparation
- And more...

**ALL tasks must have `assigned_to: "PHGHAS"`**

### Team Member Deletion
When deleting a team member with assigned tasks:
1. System checks for assigned tasks
2. Prompts user for reassignment target
3. Default reassignment: PHGHAS
4. Updates all affected tasks
5. Logs action in audit trail

## API Endpoints

### Team Management
- `POST /api/invite` - Create team member
- `DELETE /api/team/:id` - Delete team member (with reassignment)
- `PUT /api/team/:id` - Mark as not working

### Task Management
- `POST /api/phases` - Create task
- `PUT /api/phases/:id` - Update task
- `DELETE /api/phases/:id` - Delete task
- `GET /api/phases?clientId=X` - Get tasks for client

### Client Management
- `POST /api/clients` - Create client
- `GET /api/clients` - List all clients

## Development Setup

### Prerequisites
- Node.js 16+
- Git
- MongoDB Atlas account

### Local Development
```bash
# Clone repository
git clone https://github.com/leewaller93/leeprojstatus.git
cd leeprojstatus

# Install frontend dependencies
npm install

# Install backend dependencies
cd has-status-backend
npm install
cd ..

# Set environment variables
# Create .env file in has-status-backend/ with:
# MONGODB_URI=your_mongodb_connection_string

# Start backend (port 5000)
cd has-status-backend
npm start

# Start frontend (port 3000)
npm start
```

### Environment Variables
**Backend** (`has-status-backend/.env`):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
NODE_ENV=development
PORT=5000
```

## Deployment Process

### Current Issues
1. **Frontend deployment**: Manual `npm run deploy` required
2. **Backend deployment**: Robust script works but doesn't handle frontend
3. **Build conflicts**: Root package.json has frontend build script
4. **Git submodules**: Complex state management

### Fixed Deployment Process

#### For Frontend Changes:
```bash
# 1. Make changes to src/App.js
# 2. Commit and push
git add src/App.js
git commit -m "Description of changes"
git push

# 3. Deploy to GitHub Pages
npm run deploy
```

#### For Backend Changes:
```bash
# 1. Make changes to has-status-backend/server.js
# 2. Use robust deployment script
.\deploy-robust.ps1
```

#### For Both Frontend and Backend:
```bash
# 1. Make all changes
# 2. Deploy frontend
npm run deploy

# 3. Deploy backend
.\deploy-robust.ps1
```

## Critical Code Sections

### Frontend - Standard Template Application
```javascript
const applyPHGStandardTemplate = async () => {
  // 1. Check if PHGHAS exists
  const phghasMemberExists = team.some(member => member.username === 'PHGHAS');
  
  // 2. Create PHGHAS if missing
  if (!phghasMemberExists) {
    await fetch(`${API_BASE_URL}/api/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'PHGHAS',
        email: 'phghas@phg.com',
        org: 'PHG',
        clientId: currentClientId
      })
    });
  }
  
  // 3. Create tasks assigned to PHGHAS
  for (const task of PHG_STANDARD_TEMPLATE) {
    const taskWithClient = { 
      ...task, 
      clientId: currentClientId,
      assigned_to: 'PHGHAS', // CRITICAL: Must be PHGHAS
      stage: 'Outstanding'
    };
    await fetch(`${API_BASE_URL}/api/phases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskWithClient)
    });
  }
};
```

### Backend - Team Member Deletion
```javascript
app.delete('/api/team/:id', async (req, res) => {
  const { id } = req.params;
  const { clientId, reassign_to, performedBy } = req.query;
  
  // 1. Find member to delete
  const member = await Team.findById(id);
  
  // 2. Find tasks assigned to this member
  const tasks = await Phase.find({ 
    assigned_to: member.username, 
    clientId 
  });
  
  // 3. Reassign tasks if any exist
  if (tasks.length > 0) {
    await Phase.updateMany(
      { assigned_to: member.username, clientId },
      { assigned_to: reassign_to || 'PHGHAS' }
    );
  }
  
  // 4. Delete member
  await Team.findByIdAndDelete(id);
  
  // 5. Log audit trail
  await AuditTrail.create({
    clientId,
    action: 'delete_team_member',
    targetId: id,
    targetName: member.username,
    details: `Reassigned ${tasks.length} tasks to ${reassign_to || 'PHGHAS'}`,
    performedBy
  });
});
```

## Testing Checklist

### Standard Template Functionality
- [ ] PHGHAS team member created automatically
- [ ] All tasks assigned to PHGHAS
- [ ] Tasks start in "Outstanding" stage
- [ ] No duplicate PHGHAS members created

### Team Member Management
- [ ] Can add new team members
- [ ] Can delete team members without tasks
- [ ] Can delete team members with tasks (reassignment prompt)
- [ ] Default reassignment to PHGHAS
- [ ] Audit trail logged for deletions

### Multi-tenancy
- [ ] Client data isolation
- [ ] PHGHAS created per client
- [ ] No cross-client data leakage

## Troubleshooting

### Common Issues
1. **PHGHAS not created**: Check `/api/invite` endpoint
2. **Tasks not assigned to PHGHAS**: Verify template `assigned_to` values
3. **Deployment failures**: Use separate frontend/backend deployment
4. **Build errors**: Remove frontend build script from root package.json

### Debug Commands
```bash
# Check frontend build
npm run build

# Check backend health
curl https://has-status-backend.onrender.com/health

# Check deployed frontend
curl https://leewaller93.github.io/leeprojstatus/
```

## Maintenance

### Regular Tasks
- Monitor MongoDB connection
- Check Render deployment logs
- Verify GitHub Pages deployment
- Test standard template functionality

### Backup Strategy
- MongoDB Atlas automated backups
- GitHub repository as code backup
- Render deployment logs for troubleshooting

---

**Last Updated**: 2025-08-02
**Version**: 1.0
**Maintainer**: Senior Development Team 