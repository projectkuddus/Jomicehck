# Step-by-Step Deployment Guide

You have GitHub ✅ - Let's deploy!

---

## STEP 1: Push Your Code to GitHub (5 minutes)

### 1.1 Check if your code is already on GitHub

Open terminal in your project folder:
```bash
cd /Users/macbookpro/jomicheck.com
git remote -v
```

**If you see a GitHub URL**, skip to Step 2.

**If you see "fatal: not a git repository" or nothing**, continue below.

### 1.2 Create GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name**: `jomicheck` (or any name you like)
   - **Description**: (optional) "Property Risk Analyzer"
   - **Visibility**: Choose **Public** (easier for free hosting) or Private
   - **DO NOT** check "Initialize with README"
4. Click **"Create repository"**

### 1.3 Push Your Code

In your terminal (still in `/Users/macbookpro/jomicheck.com`):

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - ready for deployment"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/jomicheck.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**If it asks for username/password:**
- Use a **Personal Access Token** (not your password)
- Get one here: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Check "repo" scope
- Copy the token and use it as password

**Done!** Your code is now on GitHub. ✅

---

## STEP 2: Get Gemini API Key (2 minutes)

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (it looks like: `AIza...`)
5. **Save it somewhere safe** - you'll need it in Step 4

---

## STEP 3: Sign Up for Railway (2 minutes)

1. Go to: https://railway.app
2. Click **"Start a New Project"** (big button)
3. Click **"Login with GitHub"**
4. Authorize Railway to access your repositories
5. You're in! You'll see the Railway dashboard

---

## STEP 4: Deploy Backend (10 minutes)

### 4.1 Create Backend Service

1. In Railway dashboard, click **"New Project"** (top left)
2. Select **"Deploy from GitHub repo"**
3. You'll see your repositories - click on **`jomicheck`** (or whatever you named it)
4. Railway will start deploying automatically

### 4.2 Configure Backend

1. Wait for the deployment to start (you'll see logs)
2. Click on the service (it might be named "jomicheck" or similar)
3. Click the **"Settings"** tab (gear icon)
4. Scroll down to **"Root Directory"**
5. Change it from `/` to: `backend`
6. Click **"Save"** or press Enter
7. Railway will automatically redeploy

### 4.3 Add Environment Variables

1. Still in Settings, click the **"Variables"** tab
2. Click **"New Variable"** button
3. Add first variable:
   - **Variable Name**: `GEMINI_API_KEY`
   - **Value**: (paste your API key from Step 2)
   - Click **"Add"**
4. Click **"New Variable"** again:
   - **Variable Name**: `NODE_ENV`
   - **Value**: `production`
   - Click **"Add"**

### 4.4 Get Backend URL

1. Wait for deployment to finish (green checkmark ✅)
2. Click **"Settings"** tab again
3. Click **"Domains"** (or "Generate Domain")
4. Railway will show a URL like: `https://jomicheck-backend-production.up.railway.app`
5. **Copy this URL** - you'll need it for the frontend!

**Backend is deployed!** ✅

---

## STEP 5: Deploy Frontend (10 minutes)

### 5.1 Create Frontend Service

1. In Railway dashboard, click **"New"** button (top right, next to your backend service)
2. Select **"GitHub Repo"**
3. Choose the **same repository** (`jomicheck`)
4. Railway will start deploying

### 5.2 Configure Frontend

1. Click on the new service (it will be a second service)
2. Go to **"Settings"** tab
3. Set these values:
   - **Root Directory**: `/` (leave empty or type `/`)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l 3000`
4. Click **"Save"**

### 5.3 Add Environment Variable

1. Still in Settings, go to **"Variables"** tab
2. Click **"New Variable"**
3. Add:
   - **Variable Name**: `VITE_API_BASE_URL`
   - **Value**: (paste your backend URL from Step 4.4, e.g., `https://jomicheck-backend-production.up.railway.app`)
   - Click **"Add"**

### 5.4 Wait for Deployment

1. Railway will automatically rebuild and deploy
2. Wait for the green checkmark ✅ (takes 2-3 minutes)
3. Your frontend is deployed!

**Frontend is deployed!** ✅

---

## STEP 6: Connect Your Domain (5 minutes)

### 6.1 Add Domain in Railway

1. In Railway, click on your **frontend** service (not backend)
2. Go to **"Settings"** → **"Domains"**
3. Click **"Custom Domain"** button
4. Enter: `www.jomicheck.com`
5. Click **"Add"** or **"Save"**
6. Railway will show you a CNAME record value
   - It will look like: `xxxxx.railway.app` or `xxxxx.up.railway.app`
   - **Copy this value** - you'll need it next!

### 6.2 Add DNS Record at Your Domain Registrar

1. **Log in to your domain registrar** (where you bought jomicheck.com)
   - Common ones: Namecheap, GoDaddy, Google Domains, Cloudflare, etc.

2. **Find DNS Management:**
   - Look for: "DNS Settings", "DNS Management", "Manage DNS", or "DNS Records"
   - Usually under "Domain Settings" or "Advanced Settings"

3. **Add CNAME Record:**
   - Click "Add Record" or "+"
   - **Type**: Select "CNAME" (not A record!)
   - **Name/Host**: `www`
   - **Points to/Value/Target**: (paste the Railway domain from Step 6.1)
   - **TTL**: 3600 (or leave default)
   - Click **"Save"** or **"Add Record"**

4. **Important**: Make sure there's NO other `www` record. If there is, delete it first or edit it.

### 6.3 Wait and Verify

1. Go back to Railway
2. Wait 5-10 minutes (DNS propagation takes time)
3. Railway will automatically generate an SSL certificate
4. The domain status in Railway should change to "Active" ✅
5. Visit: `https://www.jomicheck.com`
6. **It should work!** 🎉

---

## Troubleshooting

### "Railway can't see my GitHub repo"
- Make sure you authorized Railway to access your repositories
- Check the repo is in the list when you click "Deploy from GitHub repo"

### "Backend deployment fails"
- Check Root Directory is exactly `backend` (not `/backend` or `./backend`)
- Verify `GEMINI_API_KEY` is set correctly (no extra spaces)
- Check the "Deployments" tab for error logs

### "Frontend can't connect to backend"
- Verify `VITE_API_BASE_URL` matches your backend URL exactly
- Make sure it starts with `https://` (not `http://`)
- Check backend is deployed and running (green checkmark)

### "Domain not working"
- Wait 10-15 minutes for DNS to propagate
- Verify CNAME record is correct (not A record)
- Check Railway shows domain as "Active"
- Try: `https://www.jomicheck.com` (with https, not http)

### "Build fails"
- Check the "Deployments" tab for error messages
- Make sure all files are pushed to GitHub
- Verify package.json has correct scripts

---

## You're Done! 🎊

Your website is now live at:
- **https://www.jomicheck.com**

Test it:
1. ✅ Visit the website
2. ✅ Upload a test document
3. ✅ Check if analysis works
4. ✅ Test the chat feature

---

## Need Help?

Tell me:
- Which step are you on?
- What error message do you see?
- What's not working?

I'll help you fix it! 🚀

