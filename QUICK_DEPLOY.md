# 🚀 Quick Deploy Guide - www.jomicheck.com

## What I've Prepared For You

✅ Deployment configs for multiple platforms (Railway, Vercel, Render, Docker)  
✅ CORS configured in backend  
✅ Environment variable templates  
✅ Production-ready build configurations  

## What You Need To Do

### 1. Choose Your Platform

**Easiest Option: Railway** (Recommended)
- Deploys both frontend and backend
- Free tier available
- Automatic SSL certificates
- Simple domain connection

**Alternative: Vercel (Frontend) + Railway (Backend)**
- Vercel is great for frontend
- Railway for backend API

### 2. Get Your Gemini API Key

If you don't have one:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Save it securely

### 3. Deploy Backend First

**On Railway:**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo
4. Railway should detect `backend/` folder automatically
5. **Add Environment Variable:**
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key
6. Copy the deployment URL (e.g., `https://jomicheck-backend.up.railway.app`)

### 4. Deploy Frontend

**On Railway:**
1. New Service → GitHub Repo (same repo)
2. **Settings:**
   - Root Directory: `/` (root, not backend)
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 3000`
3. **Add Environment Variable:**
   - Key: `VITE_API_BASE_URL`
   - Value: Your backend URL from step 3

**On Vercel:**
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Framework: Vite (auto-detected)
4. **Environment Variable:**
   - `VITE_API_BASE_URL` = your backend URL
5. Deploy!

### 5. Connect Domain

**On Railway:**
1. Frontend service → Settings → Domains
2. Add Custom Domain: `www.jomicheck.com`
3. Railway will show DNS records
4. Go to your domain registrar (where you bought jomicheck.com)
5. Add CNAME record:
   - Name: `www`
   - Value: Railway's provided domain
6. Wait 5-10 minutes
7. SSL auto-generates!

**On Vercel:**
1. Project Settings → Domains
2. Add: `www.jomicheck.com`
3. Follow DNS instructions
4. SSL auto-generates!

## Environment Variables Summary

### Backend (Railway/Render/etc.):
```
GEMINI_API_KEY=your_key_here
PORT=4000
NODE_ENV=production
```

### Frontend (Railway/Vercel):
```
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

## Testing Checklist

After deployment:
- [ ] Visit `https://www.jomicheck.com` (should load)
- [ ] Check browser console (no errors)
- [ ] Upload a test document
- [ ] Test chat functionality
- [ ] Check backend logs if issues

## Need Help?

**Tell me:**
1. Which platform you want to use (Railway, Vercel, Render, or VPS)
2. If you have your Gemini API key ready
3. If you have access to your domain registrar (Namecheap, GoDaddy, etc.)

I can guide you through the specific steps!

## Files Created

- `DEPLOY_STEPS.md` - Detailed step-by-step guide
- `DEPLOYMENT.md` - Overview of all options
- `vercel.json` - Vercel configuration
- `railway.json` - Railway configuration
- `render.yaml` - Render configuration
- `Dockerfile` + `docker-compose.yml` - Docker setup
- `nginx.conf` - Nginx config for VPS
- Backend CORS configured ✅

Everything is ready! Just choose your platform and follow the steps above.

