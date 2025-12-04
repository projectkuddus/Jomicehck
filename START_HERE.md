# 🚀 START HERE - Deploy www.jomicheck.com

## TL;DR - What You Need:

1. **GitHub account** (free) - to store your code
2. **Railway account** (free) - to host your website
3. **Gemini API key** (free tier) - for AI features
4. **Domain access** - you already have www.jomicheck.com

**Total time: 30 minutes**  
**Total cost: $0 (free tier)**

---

## Step 1: Push Code to GitHub (5 min)

### If you don't have GitHub:

1. Go to https://github.com
2. Sign up (free)
3. Create new repository:
   - Name: `jomicheck` (or any name)
   - Make it **Public** (easier for free hosting)
   - Don't initialize with README

### Push your code:

```bash
# In your project folder
cd /Users/macbookpro/jomicheck.com

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/jomicheck.git

# Push
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username**

---

## Step 2: Get Gemini API Key (2 min)

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. **Copy and save it** (you'll need it in Step 4)

---

## Step 3: Sign Up for Railway (2 min)

1. Go to: https://railway.app
2. Click "Start a New Project"
3. Sign up with **GitHub** (easiest option)
4. Authorize Railway to access your repos

---

## Step 4: Deploy Backend (10 min)

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `jomicheck` repository
4. Railway will start deploying automatically
5. **Wait for it to finish**, then:
   - Click on the service
   - Go to **Settings** tab
   - Find **"Root Directory"**
   - Change it to: `backend`
   - Click **Save**
6. Go to **Variables** tab
7. Click **"New Variable"**
   - Name: `GEMINI_API_KEY`
   - Value: (paste your API key from Step 2)
   - Click **Add**
8. Add another variable:
   - Name: `NODE_ENV`
   - Value: `production`
   - Click **Add**
9. Railway will redeploy automatically
10. Wait for deployment (green checkmark)
11. Click **"Settings"** → **"Domains"**
12. Copy the URL (e.g., `https://jomicheck-backend-production.up.railway.app`)
13. **Save this URL** - you'll need it for frontend!

---

## Step 5: Deploy Frontend (10 min)

1. In Railway dashboard, click **"New"** (top right)
2. Select **"GitHub Repo"**
3. Choose the **same repository** (`jomicheck`)
4. Railway will start deploying
5. Click on the new service
6. Go to **Settings** tab
7. Set:
   - **Root Directory**: `/` (or leave empty)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l 3000`
8. Go to **Variables** tab
9. Add variable:
   - Name: `VITE_API_BASE_URL`
   - Value: (the backend URL from Step 4, e.g., `https://jomicheck-backend-production.up.railway.app`)
10. Railway will redeploy
11. Wait for deployment to finish

---

## Step 6: Connect Domain (5 min)

1. In Railway, go to your **frontend** service
2. Click **Settings** → **Domains**
3. Click **"Custom Domain"**
4. Enter: `www.jomicheck.com`
5. Railway will show you a CNAME record:
   - Something like: `xxxxx.railway.app`
6. **Go to your domain registrar** (where you bought jomicheck.com):
   - Log in
   - Find **DNS Management** or **DNS Settings**
   - Look for **CNAME Records** section
   - Add new CNAME:
     - **Name/Host**: `www`
     - **Points to/Value**: (the Railway domain from step 5)
     - **TTL**: 3600 (or default)
   - **Save**
7. Go back to Railway
8. Wait 5-10 minutes
9. Railway will automatically generate SSL certificate
10. Visit `https://www.jomicheck.com` - it should work! 🎉

---

## Troubleshooting

**"Railway can't find my repo"**
- Make sure repo is public, or
- Check Railway has access to your GitHub account

**"Backend deployment fails"**
- Check Root Directory is set to `backend`
- Verify `GEMINI_API_KEY` is set correctly

**"Frontend can't connect to backend"**
- Check `VITE_API_BASE_URL` matches your backend URL exactly
- Make sure backend URL starts with `https://`

**"Domain not working"**
- Wait 10-15 minutes for DNS propagation
- Check DNS record is correct (CNAME, not A record)
- Verify Railway shows domain as "Active"

---

## You're Done! 🎊

Your website should now be live at:
- **Frontend**: https://www.jomicheck.com
- **Backend API**: (your Railway backend URL)

Test it:
1. Visit www.jomicheck.com
2. Upload a document
3. Check if analysis works
4. Test the chat

---

## Need Help?

Tell me which step you're on and I'll help you through it!

