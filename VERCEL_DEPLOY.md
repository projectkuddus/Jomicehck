# Deploy to Vercel - Complete Guide

## Setup: Frontend + Backend on Vercel

Vercel can host both! We'll use:
- **Frontend**: Vercel static hosting
- **Backend**: Vercel Serverless Functions (API routes)

---

## STEP 1: Prepare Backend for Vercel (2 minutes)

Vercel needs the backend in a specific format. Let's create the API routes.

### 1.1 Create API Directory Structure

We need to move backend code to `api/` folder for Vercel.

**Don't worry - I'll create the files for you!**

---

## STEP 2: Deploy to Vercel (10 minutes)

### 2.1 Connect Repository

1. Go to: https://vercel.com
2. Sign in (you already have an account)
3. Click **"Add New..."** → **"Project"**
4. Click **"Import Git Repository"**
5. Find: **`projectkuddus/Jomicehck`**
6. Click **"Import"**

### 2.2 Configure Project

Vercel should auto-detect Vite, but verify:
- **Framework Preset**: Vite ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅

### 2.3 Add Environment Variables

1. Scroll to **"Environment Variables"**
2. Click **"Add"** and add:

**Variable 1:**
- **Name**: `GEMINI_API_KEY`
- **Value**: `AIzaSyARb5sQAd-nxftgG7ju-J8uaLgberP70Pg`
- Check: Production, Preview, Development ✅

**Variable 2:**
- **Name**: `VITE_API_BASE_URL`
- **Value**: Leave empty for now (we'll set it after deployment)
- Check: Production, Preview, Development ✅

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Vercel will give you a URL like: `https://jomicehck.vercel.app`
4. **Copy this URL** - you'll need it!

---

## STEP 3: Set Up Backend API Routes

After frontend deploys, we'll add the backend API routes. Vercel will automatically detect them in the `api/` folder.

---

## STEP 4: Connect Domain

1. In Vercel dashboard → Your project → **"Settings"** → **"Domains"**
2. Enter: `www.jomicheck.com`
3. Follow DNS instructions
4. Wait 5-10 minutes
5. Done! 🎉

---

## Quick Start - Let's Do It!

1. **First**: Deploy frontend (Step 2 above)
2. **Then**: I'll help you add the backend API routes
3. **Finally**: Connect your domain

Ready? Start with Step 2.1 above!

