# Your Deployment Guide - www.jomicheck.com

## Your Details:
- **GitHub Repo**: https://github.com/projectkuddus/Jomicehck
- **Gemini API Key**: ✅ (You have it)
- **Domain**: www.jomicheck.com

## Recommended Setup: Vercel (Frontend) + Railway (Backend)

**Why this combo:**
- ✅ Vercel: Best for frontend (you know it, great performance, free tier)
- ✅ Railway: Best for backend (Node.js, easy env vars, free tier)
- ✅ Both have excellent free tiers
- ✅ Best value and performance

---

## STEP 1: Deploy Backend on Railway (10 minutes)

### 1.1 Sign Up for Railway
1. Go to: https://railway.app
2. Click **"Start a New Project"**
3. Click **"Login with GitHub"**
4. Authorize Railway

### 1.2 Deploy Backend
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select: **`projectkuddus/Jomicehck`**
4. Railway will start deploying

### 1.3 Configure Backend
1. Click on the service (it will be named "Jomicehck" or similar)
2. Go to **"Settings"** tab
3. Find **"Root Directory"**
4. Change it to: `backend`
5. Click **"Save"**
6. Railway will automatically redeploy

### 1.4 Add Environment Variables
1. Still in Settings, click **"Variables"** tab
2. Click **"New Variable"**
3. Add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyARb5sQAd-nxftgG7ju-J8uaLgberP70Pg`
   - Click **"Add"**
4. Add another:
   - **Name**: `NODE_ENV`
   - **Value**: `production`
   - Click **"Add"**

### 1.5 Get Backend URL
1. Wait for deployment to finish (green checkmark ✅)
2. Go to **"Settings"** → **"Domains"**
3. Click **"Generate Domain"** (if no domain shown)
4. Copy the URL (e.g., `https://jomicehck-production.up.railway.app`)
5. **Save this URL** - you'll need it for Vercel!

**Backend is deployed!** ✅

---

## STEP 2: Deploy Frontend on Vercel (10 minutes)

### 2.1 Connect Repository
1. Go to: https://vercel.com
2. Sign in (you already have an account)
3. Click **"Add New..."** → **"Project"**
4. Click **"Import Git Repository"**
5. Find: **`projectkuddus/Jomicehck`**
6. Click **"Import"**

### 2.2 Configure Build Settings
Vercel should auto-detect Vite, but verify:
- **Framework Preset**: Vite (should be auto-detected)
- **Root Directory**: `./` (leave as is)
- **Build Command**: `npm run build` (should be auto-filled)
- **Output Directory**: `dist` (should be auto-filled)
- **Install Command**: `npm install` (should be auto-filled)

### 2.3 Add Environment Variable
1. Scroll down to **"Environment Variables"**
2. Click **"Add"**
3. Add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: (paste your Railway backend URL from Step 1.5)
   - Example: `https://jomicehck-production.up.railway.app`
   - Make sure it's for **Production**, **Preview**, and **Development**
4. Click **"Save"**

### 2.4 Deploy
1. Click **"Deploy"** button
2. Wait for deployment (1-2 minutes)
3. Vercel will give you a URL like: `https://jomicehck.vercel.app`
4. **Test it** - make sure it loads!

**Frontend is deployed!** ✅

---

## STEP 3: Connect Domain to Vercel (5 minutes)

### 3.1 Add Domain in Vercel
1. In Vercel dashboard, go to your project
2. Click **"Settings"** tab
3. Click **"Domains"** in the sidebar
4. Enter: `www.jomicheck.com`
5. Click **"Add"**

### 3.2 Configure DNS
Vercel will show you DNS records. You need to add:

**Option A: CNAME (Recommended)**
- **Type**: CNAME
- **Name**: `www`
- **Value**: `cname.vercel-dns.com` (or what Vercel shows)

**Option B: A Record** (if CNAME doesn't work)
- Vercel will show you A record IPs to add

### 3.3 Add DNS Record at Your Domain Registrar
1. Log in to your domain registrar (where you bought jomicheck.com)
2. Go to **DNS Management** / **DNS Settings**
3. Add the record Vercel shows you:
   - If CNAME: Add CNAME record with `www` pointing to Vercel's value
   - If A Record: Add A records with the IPs Vercel provides
4. **Save**

### 3.4 Wait for SSL
1. Go back to Vercel
2. Wait 5-10 minutes
3. Vercel will automatically generate SSL certificate
4. The domain status will change to **"Valid"** ✅
5. Visit: `https://www.jomicheck.com`
6. **It should work!** 🎉

---

## Important Notes

### Backend URL Format
Make sure your `VITE_API_BASE_URL` in Vercel is:
- ✅ `https://your-backend-url.railway.app` (with https://)
- ❌ NOT `http://` (must be https)
- ❌ NOT with `/api` at the end (the frontend adds that)

### CORS
The backend already has CORS configured to allow:
- `https://www.jomicheck.com`
- `https://jomicheck.com`
- Your Vercel preview URLs

If you get CORS errors, add your Vercel URL to the backend CORS settings.

---

## Testing Checklist

After deployment:
- [ ] Visit `https://www.jomicheck.com` - should load
- [ ] Check browser console (F12) - no errors
- [ ] Upload a test document
- [ ] Check if analysis works
- [ ] Test chat functionality
- [ ] Check backend logs in Railway if issues

---

## Cost Breakdown

### Free Tier:
- **Vercel**: Free for personal projects (generous limits)
- **Railway**: $5 free credit/month (enough for moderate traffic)
- **Total**: $0/month

### If You Need More:
- **Vercel Pro**: $20/month (if you exceed free tier)
- **Railway**: Pay-as-you-go after free credit (~$5-20/month)
- **Total**: ~$25-40/month for high traffic

---

## Troubleshooting

### "Vercel can't find my repo"
- Make sure Railway/Vercel has access to your GitHub account
- Check the repo is public (or you've given access)

### "Frontend can't connect to backend"
- Verify `VITE_API_BASE_URL` in Vercel matches Railway URL exactly
- Check backend is running (green in Railway)
- Check browser console for errors

### "CORS error"
- Add your Vercel URL to backend CORS settings
- Or use same domain with proxy (more complex)

### "Domain not working"
- Wait 10-15 minutes for DNS propagation
- Check DNS records are correct
- Verify Vercel shows domain as "Valid"

---

## Quick Commands (If Needed)

### Update Backend CORS (if needed):
Edit `backend/src/index.ts` and add your Vercel URL to allowed origins.

### Check Backend Logs:
Railway → Your service → "Deployments" → Click latest → "View Logs"

### Check Frontend Logs:
Vercel → Your project → "Deployments" → Click latest → "View Function Logs"

---

## You're Done! 🎊

Your website is live at:
- **Frontend**: https://www.jomicheck.com
- **Backend API**: (your Railway URL)

Everything should be working! 🚀

