# 🔑 API Setup Guide - Complete Step-by-Step

## Overview

Your system needs **3 API keys** for full functionality. Here's exactly what to add and where.

---

## 📋 Required API Keys

### 1. **GEMINI_API_KEY** (REQUIRED - Both PLUS & PRO)
- **What it does**: Powers document analysis (Gemini models)
- **Used by**: PLUS and PRO analysis
- **Priority**: ⭐⭐⭐ CRITICAL

### 2. **GOOGLE_CLOUD_VISION_API_KEY** (REQUIRED - PRO only)
- **What it does**: OCR for old/faded/handwritten Bengali documents
- **Used by**: PRO analysis only
- **Priority**: ⭐⭐⭐ CRITICAL for PRO

### 3. **OPENAI_API_KEY** (OPTIONAL - Fallback)
- **What it does**: GPT-5.1 fallback if Gemini fails
- **Used by**: Both PLUS and PRO (as fallback)
- **Priority**: ⭐⭐ RECOMMENDED (for reliability)

---

## 🚀 Step-by-Step Setup

### Step 1: Get Gemini API Key

1. **Go to**: https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click**: "Create API Key" or "Get API Key"
4. **Select**: Your project (or create new one)
5. **Copy** the API key (starts with `AIza...`)

**Example**: `AIzaSyBb845MgZ2xWCjFPeaK8QnUpKbInYCIshw`

---

### Step 2: Get Google Cloud Vision API Key

1. **Go to**: https://console.cloud.google.com/
2. **Sign in** with your Google account
3. **Create/Select Project**:
   - Click project dropdown (top bar)
   - Click "New Project"
   - Name: "JomiCheck Vision OCR"
   - Click "Create"

4. **Enable Vision API**:
   - Go to: https://console.cloud.google.com/apis/library/vision.googleapis.com
   - Click "Enable"

5. **Create API Key**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "API Key"
   - **IMPORTANT**: Click "Restrict Key"
   - Under "API restrictions":
     - Select "Restrict key"
     - Check "Cloud Vision API"
   - Click "Save"
   - **Copy** the API key

**Example**: `AIzaSyD...` (different from Gemini key)

---

### Step 3: Get OpenAI API Key (Optional but Recommended)

1. **Go to**: https://platform.openai.com/api-keys
2. **Sign in** with your OpenAI account
3. **Click**: "Create new secret key"
4. **Name it**: "JomiCheck Fallback"
5. **Copy** the API key (starts with `sk-...`)

**Note**: Make sure your OpenAI account has access to GPT-5.1

---

## 🔧 Step 4: Add Keys to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to**: https://vercel.com/dashboard
2. **Select**: Your JomiCheck project
3. **Click**: "Settings" (top menu)
4. **Click**: "Environment Variables" (left sidebar)
5. **Add each key**:

   **Key 1: GEMINI_API_KEY**
   - Click "Add New"
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Paste your Gemini API key
   - **Environment**: Select "Production", "Preview", "Development" (all)
   - Click "Save"

   **Key 2: GOOGLE_CLOUD_VISION_API_KEY**
   - Click "Add New"
   - **Name**: `GOOGLE_CLOUD_VISION_API_KEY`
   - **Value**: Paste your Vision API key
   - **Environment**: Select "Production", "Preview", "Development" (all)
   - Click "Save"

   **Key 3: OPENAI_API_KEY**
   - Click "Add New"
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Paste your OpenAI API key
   - **Environment**: Select "Production", "Preview", "Development" (all)
   - Click "Save"

6. **Redeploy**:
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Link project
cd /Users/macbookpro/jomicheck.com
vercel link

# Add environment variables
vercel env add GEMINI_API_KEY production
# Paste key when prompted

vercel env add GOOGLE_CLOUD_VISION_API_KEY production
# Paste key when prompted

vercel env add OPENAI_API_KEY production
# Paste key when prompted

# Redeploy
vercel --prod
```

---

## ✅ Step 5: Verify Setup

### Check Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. You should see:
   - ✅ `GEMINI_API_KEY` (visible as `••••••••`)
   - ✅ `GOOGLE_CLOUD_VISION_API_KEY` (visible as `••••••••`)
   - ✅ `OPENAI_API_KEY` (visible as `••••••••`)

### Test the System

1. **Deploy to Production**:
   ```bash
   cd /Users/macbookpro/jomicheck.com
   npx vercel --prod
   ```

2. **Test PLUS Analysis**:
   - Go to https://jomicheck.com
   - Upload a clear document
   - Click "PLUS Analysis"
   - Should work with Gemini 2.0 Pro Exp

3. **Test PRO Analysis**:
   - Upload an old/handwritten document
   - Click "PRO Analysis"
   - Should use Vision OCR + Gemini 3.0 Pro

---

## 🎯 What Each Key Does

### GEMINI_API_KEY
- **PLUS**: Uses Gemini 2.0 Pro Exp for analysis
- **PRO**: Uses Gemini 3.0 Pro / 3 Pro Preview for analysis
- **Without it**: Analysis will fail (no fallback)

### GOOGLE_CLOUD_VISION_API_KEY
- **PLUS**: Not used (clear documents don't need OCR)
- **PRO**: **MANDATORY** - Extracts text from old/faded/handwritten documents
- **Without it**: PRO will work but won't handle old documents well

### OPENAI_API_KEY
- **PLUS**: Fallback if Gemini fails → uses GPT-5.1
- **PRO**: Fallback if all Gemini models fail → uses GPT-5.1
- **Without it**: System still works, but no fallback if Gemini fails

---

## 💰 Cost Estimate

### Per Analysis:
- **PLUS**: 
  - Gemini API: ~$0.01-0.02
  - Total: ~$0.01-0.02

- **PRO**:
  - Vision OCR: ~$0.015 per 10 pages
  - Gemini API: ~$0.05-0.10
  - Total: ~$0.07-0.12

### Monthly (100 analyses):
- PLUS: ~$1-2/month
- PRO: ~$7-12/month

---

## 🚨 Troubleshooting

### "Gemini API key invalid"
- Check: Key copied correctly (no extra spaces)
- Check: Key is from correct Google account
- Check: API key is enabled in Google AI Studio

### "Vision OCR not working"
- Check: Vision API is enabled in Google Cloud Console
- Check: API key has "Cloud Vision API" restriction
- Check: Billing is enabled in Google Cloud (required for Vision API)

### "GPT-5.1 not available"
- Check: Your OpenAI account has access to GPT-5.1
- Check: API key has correct permissions
- Note: System will still work with Gemini (just no fallback)

---

## 📝 Quick Checklist

- [ ] GEMINI_API_KEY added to Vercel
- [ ] GOOGLE_CLOUD_VISION_API_KEY added to Vercel
- [ ] OPENAI_API_KEY added to Vercel (optional but recommended)
- [ ] All keys set for Production, Preview, Development
- [ ] Project redeployed
- [ ] Tested PLUS analysis
- [ ] Tested PRO analysis

---

## 🎉 You're Done!

Once all keys are added and deployed, your system will:
- ✅ Use Gemini 2.0 Pro Exp for PLUS (best for Bengali)
- ✅ Use Gemini 3.0 Pro for PRO (most advanced)
- ✅ Use Vision OCR for old/handwritten documents (PRO)
- ✅ Fallback to GPT-5.1 if Gemini fails (reliability)

**Your system is now production-ready!** 🚀

