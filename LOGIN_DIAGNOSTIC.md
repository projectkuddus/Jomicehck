# 🔍 Login Diagnostic Guide

I've added comprehensive debugging to help us find the exact problem. Follow these steps:

## Step 1: Check Browser Console (CRITICAL)

1. Go to **https://www.jomicheck.com**
2. Open **Browser Console**:
   - **Chrome/Edge**: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - **Firefox**: Press `F12` or `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)
3. Click the **"Console"** tab
4. Click **"Login"** button
5. Click **"Continue with Google"**

### What to Look For:

Look for these log messages (they start with 🔍, ✅, or ❌):

- `🔍 OAuth Debug:` - Shows if Supabase is configured
- `🔍 Redirect URL:` - Shows where it's trying to redirect
- `🔍 OAuth Response:` - Shows the response from Supabase
- `✅ Redirecting to:` - Shows the Google OAuth URL
- `❌ Google login error:` - Shows any errors

**Copy ALL console messages** and share them with me.

---

## Step 2: Check Network Tab

1. In the browser console, click the **"Network"** tab
2. Click **"Continue with Google"** again
3. Look for requests to:
   - `supabase.co/auth/v1/authorize` - This should exist
   - Any requests with status **4xx** or **5xx** (red)

**Share any failed network requests** (click on them to see details).

---

## Step 3: Verify Supabase Google Provider

1. Go to **Supabase Dashboard** → Your project
2. Click **Authentication** → **Providers**
3. Find **Google** provider
4. Check:
   - ✅ **Enabled** toggle is **ON** (green)
   - ✅ **Client ID** is filled (should start with numbers like `528012957392-...`)
   - ✅ **Client Secret** is filled (should be a long string)
5. Click **"Save"** even if nothing changed

---

## Step 4: Verify Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**
2. Verify these exist and are correct:
   - `VITE_SUPABASE_URL` = `https://tyiuowhrdnaoxqrxpfbd.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = Should be a long string starting with `eyJ...`
3. **Important**: Make sure they're set for **"Production"** environment
4. If you changed anything, **redeploy** the site

---

## Step 5: Test with Debug Info

After the code deploys (wait 2-3 minutes):

1. Go to **https://www.jomicheck.com**
2. Hard refresh: **Cmd + Shift + R** (Mac) or **Ctrl + Shift + R** (Windows)
3. You should see a **black debug box** in the bottom-right corner
4. It shows:
   - Environment variable status
   - Auth state
   - Session info

**Share what the debug box shows.**

---

## Common Issues & What They Mean

### Issue: "Supabase not configured"
**Meaning**: Environment variables are missing or wrong
**Fix**: Check Step 4 above

### Issue: "No redirect URL received"
**Meaning**: Google provider not enabled in Supabase
**Fix**: Check Step 3 above

### Issue: "redirect_uri_mismatch"
**Meaning**: Google Cloud Console redirect URI is wrong
**Fix**: Make sure this exact URL is in Google Cloud Console:
```
https://tyiuowhrdnaoxqrxpfbd.supabase.co/auth/v1/callback
```

### Issue: Button shows "Loading..." forever
**Meaning**: OAuth request is stuck
**Fix**: Check browser console for errors (Step 1)

### Issue: Redirects to Google but comes back to login
**Meaning**: Session not being restored after redirect
**Fix**: Check browser console for "Auth event:" messages

---

## What I Need From You

Please share:

1. **All console messages** (from Step 1)
2. **Any failed network requests** (from Step 2)
3. **What the debug box shows** (from Step 5)
4. **Screenshot of Supabase Google Provider settings** (blur the secret)

This will help me identify the exact problem!

