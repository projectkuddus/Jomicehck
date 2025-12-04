# What You Actually Need to Deploy

## Required Items:

### 1. ✅ Google Gemini API Key (You have this or can get it)
- Get from: https://aistudio.google.com/app/apikey
- **Cost**: Usually has free tier, then pay-per-use
- **What it does**: Powers the AI analysis

### 2. ✅ Domain Access (You have this - www.jomicheck.com)
- Access to your domain registrar (where you bought jomicheck.com)
- **What it does**: Points your domain to your website

### 3. ⚠️ **Hosting Account (You NEED this - it's free)**
- You need a place to run your code (frontend + backend)
- **Options** (all have free tiers):
  - **Railway** (easiest) - Free tier available
  - **Vercel** (frontend) + **Railway** (backend)
  - **Render** - Free tier available
  - **VPS** (DigitalOcean, etc.) - Paid, but more control

## Why You Need Hosting:

Your code needs to run somewhere 24/7. You can't just put it on your computer because:
- Your computer needs to be on all the time
- Your IP address changes
- No SSL certificate
- Not reliable

Hosting services provide:
- ✅ Servers that run 24/7
- ✅ Free SSL certificates (HTTPS)
- ✅ Easy domain connection
- ✅ Automatic deployments from GitHub

---

## Simplest Path: Railway (Recommended)

### Why Railway?
- ✅ Free tier (enough to start)
- ✅ Deploys both frontend AND backend
- ✅ No credit card needed for free tier
- ✅ Easy GitHub connection
- ✅ Automatic SSL
- ✅ Simple domain setup

### What You'll Do:
1. Sign up for Railway (free) - takes 2 minutes
2. Connect your GitHub account (one click)
3. Deploy backend → add API key
4. Deploy frontend → point to backend
5. Connect domain → add DNS record
6. Done!

---

## Step-by-Step: Railway Deployment

### Step 1: Create Accounts (5 minutes)

1. **Railway Account:**
   - Go to: https://railway.app
   - Click "Start a New Project"
   - Sign up with GitHub (easiest)
   - Authorize Railway to access your repos

2. **GitHub Account** (if you don't have one):
   - Go to: https://github.com
   - Sign up (free)
   - Create a new repository
   - Push your code there

### Step 2: Get Gemini API Key (2 minutes)

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (save it somewhere safe!)

### Step 3: Deploy Backend (10 minutes)

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will detect it's a Node.js project
5. **Important**: Set the root directory to `backend`
   - Click on the service → Settings → Root Directory
   - Enter: `backend`
6. **Add Environment Variable:**
   - Go to Variables tab
   - Add: `GEMINI_API_KEY` = (paste your key)
   - Add: `NODE_ENV` = `production`
7. Railway will auto-deploy!
8. Wait for deployment (2-3 minutes)
9. Copy the URL (e.g., `https://jomicheck-backend-production.up.railway.app`)

### Step 4: Deploy Frontend (10 minutes)

1. In Railway, click "New" → "GitHub Repo" (same repo)
2. **Settings:**
   - Root Directory: `/` (leave empty or put `/`)
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 3000`
3. **Add Environment Variable:**
   - `VITE_API_BASE_URL` = (your backend URL from Step 3)
4. Railway will deploy!
5. Copy the frontend URL

### Step 5: Connect Domain (5 minutes)

1. In Railway, go to your **frontend** service
2. Click "Settings" → "Domains"
3. Click "Custom Domain"
4. Enter: `www.jomicheck.com`
5. Railway will show you DNS records:
   - Type: CNAME
   - Name: `www`
   - Value: (Railway's domain, like `xxxxx.railway.app`)
6. **Go to your domain registrar** (where you bought jomicheck.com):
   - Log in
   - Find DNS settings / DNS management
   - Add a CNAME record:
     - Host/Name: `www`
     - Points to/Value: (Railway's domain from step 5)
     - TTL: 3600 (or default)
   - Save
7. Wait 5-10 minutes for DNS to propagate
8. Railway will auto-generate SSL certificate
9. Visit `https://www.jomicheck.com` - it should work!

---

## Cost Breakdown:

### Free Tier (Railway):
- ✅ $5 free credit per month
- ✅ Enough for small-medium traffic
- ✅ No credit card needed

### If You Need More:
- Railway: ~$5-20/month for more resources
- Or switch to Render free tier
- Or use VPS ($5-10/month)

### Google Gemini API:
- Free tier usually covers moderate usage
- Pay-per-use after that (very affordable)

---

## Alternative: If You Don't Want to Use Hosting Services

You CAN host on your own server/VPS, but you'll need:
- A VPS (Virtual Private Server) - costs $5-10/month
- Some server knowledge (Linux, SSH, etc.)
- More setup time

**Recommendation**: Start with Railway (free, easy), then migrate later if needed.

---

## Quick Checklist:

Before starting:
- [ ] GitHub account (free)
- [ ] Railway account (free)
- [ ] Gemini API key (free tier)
- [ ] Domain registrar access (you have this)

Time needed: ~30 minutes total

---

## Need Help?

Tell me:
1. Do you have a GitHub account? (If not, I'll help you create one)
2. Do you have your Gemini API key? (If not, I'll guide you)
3. Which step are you on? (I'll help with that specific step)

Let's get you deployed! 🚀

