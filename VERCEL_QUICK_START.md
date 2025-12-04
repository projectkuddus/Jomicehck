# 🚀 Vercel Deployment - Quick Start

## ✅ What I've Done:

1. ✅ Created API routes in `/api` folder:
   - `api/analyze.ts` - Document analysis endpoint
   - `api/chat.ts` - Chat endpoint  
   - `api/health.ts` - Health check

2. ✅ Updated `package.json` - Added `@vercel/node` dependency

3. ✅ Updated `vercel.json` - Configured for API routes

4. ✅ Updated frontend service - Uses relative URLs on Vercel

## 📋 Now You Need To:

### STEP 1: Push Changes to GitHub

```bash
cd /Users/macbookpro/jomicheck.com
git add .
git commit -m "Add Vercel API routes"
git push
```

### STEP 2: Deploy on Vercel (5 minutes)

1. Go to: https://vercel.com
2. Sign in
3. Click **"Add New..."** → **"Project"**
4. Click **"Import Git Repository"**
5. Find: **`projectkuddus/Jomicehck`**
6. Click **"Import"**

### STEP 3: Configure (2 minutes)

Vercel should auto-detect:
- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`

**Add Environment Variable:**
1. Scroll to **"Environment Variables"**
2. Click **"Add"**
3. Add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyARb5sQAd-nxftgG7ju-J8uaLgberP70Pg`
   - ✅ Check: Production, Preview, Development
4. Click **"Add"**

**IMPORTANT:** Do NOT add `VITE_API_BASE_URL` - leave it empty! The frontend will use relative URLs automatically.

### STEP 4: Deploy

1. Click **"Deploy"** button
2. Wait 1-2 minutes
3. Vercel will deploy both frontend AND backend!
4. You'll get a URL like: `https://jomicehck.vercel.app`

### STEP 5: Test

1. Visit your Vercel URL
2. Test document upload
3. Test chat
4. Everything should work! 🎉

### STEP 6: Connect Domain (5 minutes)

1. In Vercel → Your project → **"Settings"** → **"Domains"**
2. Enter: `www.jomicheck.com`
3. Vercel will show DNS records
4. Go to your domain registrar
5. Add CNAME record:
   - Name: `www`
   - Points to: `cname.vercel-dns.com` (or what Vercel shows)
6. Wait 5-10 minutes
7. Visit: `https://www.jomicheck.com` ✅

---

## 🎯 API Endpoints

Your API will be available at:
- `https://your-domain.vercel.app/api/analyze`
- `https://your-domain.vercel.app/api/chat`
- `https://your-domain.vercel.app/api/health`

The frontend automatically uses these (same domain = no CORS issues!)

---

## 💰 Cost

- **Vercel**: Free tier (generous limits)
- **Total**: $0/month

---

## 🐛 Troubleshooting

**"Build fails"**
- Check Vercel logs
- Make sure all files are pushed to GitHub

**"API not working"**
- Check `GEMINI_API_KEY` is set correctly
- Check Vercel function logs

**"CORS error"**
- Shouldn't happen (same domain)
- Check API routes have CORS headers

---

## ✅ You're Done!

Everything is set up. Just:
1. Push to GitHub
2. Deploy on Vercel
3. Add environment variable
4. Connect domain

That's it! 🚀

