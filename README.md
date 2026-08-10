# AI Business Manager — frontend

A real React app (not a chat artifact) that talks to your deployed backend.
Login and admin access both go through this.

## Deploy from your phone — step by step

### 1. Push this folder to GitHub
- On github.com, create a new repository, e.g. `ai-business-manager-frontend`
- Open it → "Add file" → "Upload files"
- Upload every file/folder in this project (keep the folder structure: `src/pages/...`
  must stay nested, not flattened)
- Commit

### 2. Deploy the backend first (you need its URL before the frontend works)
- Push the backend zip's contents to a separate repo, e.g. `ai-business-manager-backend`
- Go to railway.app → "New Project" → "Deploy from GitHub repo" → pick that repo
- Railway auto-detects Node and runs `npm install` + `npm start` for you
- In Railway's dashboard → Variables tab, paste in everything from `.env.example`:
  `ANTHROPIC_API_KEY`, `JWT_SECRET`, `ADMIN_EMAILS=michaelchilano07@gmail.com`, etc.
- Once deployed, copy the public URL Railway gives you (e.g. `https://ai-business-manager-backend-production.up.railway.app`)

### 3. Deploy this frontend
- Go to vercel.com → "Add New Project" → import the frontend repo
- Before deploying, add an environment variable:
  `VITE_API_URL` = the Railway URL from step 2
- Deploy — Vercel builds and gives you a URL like `https://ai-business-manager.vercel.app`

### 4. Log in
- Open your Vercel URL → you'll land on the login screen
- As the platform owner, log in with `michaelchilano07@gmail.com`
- Owner app: `https://ai-business-manager.vercel.app/#/`
- Admin console: `https://ai-business-manager.vercel.app/#/admin` — only that email gets in;
  anyone else sees "Access denied"

## Making changes later (from your phone)
- Go to your repo on github.com, open any file, tap the pencil icon to edit directly,
  or press `.` on the repo's main page to open github.dev, a full code editor in the browser
- Any push to GitHub triggers Railway/Vercel to redeploy automatically — no manual step

## If something doesn't work
- Blank page / login fails → check `VITE_API_URL` in Vercel's environment variables
  matches your Railway URL exactly (including `https://`, no trailing slash)
- "Access denied" in admin → check `ADMIN_EMAILS` in Railway's variables includes the
  exact email you logged in with
- Chat entry not recording → check `ANTHROPIC_API_KEY` is set correctly in Railway
