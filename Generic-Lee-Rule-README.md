# Generic Lee Rule Instructions

## Best Ways to Store and Reference a Generic Lee Rule Script

### 1. Create a Dedicated GitHub Repo (Recommended)
- Create a new repo (e.g., `lee-rule-deploy` or `lee-rule-scripts`) on GitHub.
- Put your generic script(s) and a sample config file in this repo.
- Add a README with usage instructions.
- **How to use in a new project:**
  - Clone or download the script into your new project.
  - Or, add as a git submodule if you want to keep it updated across projects:
    ```sh
    git submodule add https://github.com/yourusername/lee-rule-deploy lee-rule
    ```
  - Reference or copy the script and config into your project root.

### 2. Store in a Cloud Drive or Shared Folder
- Save the script in a folder on Google Drive, Dropbox, OneDrive, etc.
- Download/copy it into each new project as needed.

### 3. Use a Global Location on Your Computer
- Place the script in a directory that’s in your system’s `PATH` (e.g., `~/bin` on Mac/Linux, or a custom scripts folder on Windows).
- You can then run it from anywhere, e.g.:
  ```sh
  lee-rule.sh
  ```
- For project-specific config, the script can look for a `lee-rule.config.json` in the current directory.

### 4. Use a Project Template/Starter Repo
- Create a starter repo (template) that includes the Lee Rule script and config.
- When starting a new project, use “Use this template” on GitHub to create a new repo with the script already included.

---

## Recommended Approach for Most Users
**Create a dedicated GitHub repo for your Lee Rule scripts and config.**
- Easy to update and maintain.
- Can be cloned, forked, or added as a submodule to any project.
- Keeps your deployment automation in one place.

---

## How to Reference in a New Project
1. **Clone or copy the script** into your new project.
2. **Customize the config** for the new project (or let the script prompt you).
3. **Run the script** from your project root.

---

## How to Make It “Learn” the Project
- **Auto-detect** common folder names (`backend`, `has-status-backend`, `api`, `frontend`, `src`, etc.).
- **Prompt** the user for anything it can’t guess, then save the answers.
- **Use environment variables** or `.env` for secrets (like deploy hooks).

---

## Using a Free Cloud Database for Persistence (MongoDB Atlas Example)

If your backend needs persistent data and you want to avoid paid hosting, use a free cloud database like MongoDB Atlas:

1. Sign up at https://www.mongodb.com/atlas/database and create a free cluster.
2. Get your connection string (with username, password, and dbname).
3. Set the connection string as an environment variable (e.g., MONGODB_URI) in your backend host (Render, etc.) and locally (in a .env file).
4. Update your backend code to use MongoDB (e.g., with Mongoose).
5. Deploy as usual with the Lee Rule script.

This allows you to share your app with persistent demo data for free.

---

## Step-by-Step: Using MongoDB Atlas for Persistence in Any Project

1. Go to https://cloud.mongodb.com/ and sign up or log in.
2. Create a new project and click "Create Deployment" (cluster).
3. Choose the Free Tier (Shared, M0) and follow the prompts.
4. Create a database user (username and password).
5. Click "Connect" and choose "Shell" or "Compass" to get your connection string (mongodb+srv://...).
6. Fill in your username, password, and database name.
7. In your backend host (e.g., Render), add an environment variable:
   - Key: MONGODB_URI
   - Value: (your full connection string)
8. Save and redeploy your backend.

This ensures your app is persistent and shareable for all users.

---

## Checklist & Shell Script: Ensure Backend is Deployed from Correct Subdirectory

Before deploying, always check:
- The backend code is in a subdirectory (e.g., has-status-backend, backend, api, etc.)
- Render (or your host) is configured with:
  - Root Directory: (your backend folder)
  - Build Command: npm install
  - Start Command: node server.js

### Example shell script to check backend subdirectory and settings

```sh
if [ -d "has-status-backend" ]; then
  echo "Backend subdirectory detected: has-status-backend"
  echo "Make sure your Render Root Directory is set to: has-status-backend"
  echo "Build Command: npm install"
  echo "Start Command: node server.js"
else
  echo "No backend subdirectory detected. Check your project structure."
fi
```

Always verify these settings before deploying to avoid running the wrong server (e.g., React dev server instead of Node/Express backend).

---

## Next Steps
You can return to this file for reference any time. When you’re ready, I can help you generate a starter repo structure and script, or walk you through customizing it for your stack.

**File location:** `Generic-Lee-Rule-README.md` in your project root. 