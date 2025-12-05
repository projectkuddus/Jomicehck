# 🔐 OAuth Login Verification Checklist

## ✅ Step 1: Verify Supabase Google Provider (5 minutes)

1. Go to **Supabase Dashboard** → Your project
2. Click **Authentication** → **Providers**
3. Find **Google** provider:
   - ✅ **Enabled** toggle should be **ON** (green)
   - ✅ **Client ID (for OAuth)** should be filled (from Google Cloud Console)
   - ✅ **Client Secret (for OAuth)** should be filled (from Google Cloud Console)
   - ✅ Click **"Save"** if you made any changes

---

## ✅ Step 2: Verify Supabase Redirect URLs (3 minutes)

1. In Supabase, go to **Authentication** → **URL Configuration**
2. **Site URL** should be: `https://www.jomicheck.com`
3. **Redirect URLs** should include (add each one separately):
   - `https://www.jomicheck.com`
   - `https://jomicheck.com`
   - `http://localhost:5173` (for local testing)
4. Click **"Save"**

---

## ✅ Step 3: Verify Google Cloud Console OAuth Client (5 minutes)

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (the one you created for JomiCheck)
5. Click to edit it
6. Check **Authorized redirect URIs** - it MUST include:
   ```
   https://tyiuowhrdnaoxqrxpfbd.supabase.co/auth/v1/callback
   ```
   ⚠️ **IMPORTANT**: This is your Supabase project's callback URL, NOT your website URL!
7. Click **"Save"**

---

## ✅ Step 4: Verify OAuth Consent Screen (3 minutes)

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Check the **Publishing status**:
   - ✅ Should be **"In production"** (not "Testing")
   - If it says "Testing", click **"PUBLISH APP"** button
3. **User Type** should be **"External"** (unless you have a Google Workspace)

---

## ✅ Step 5: Verify Environment Variables in Vercel (2 minutes)

1. Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**
2. Verify these exist:
   - ✅ `VITE_SUPABASE_URL` = `https://tyiuowhrdnaoxqrxpfbd.supabase.co`
   - ✅ `VITE_SUPABASE_ANON_KEY` = `eyJ...` (your anon key)
3. If you changed anything, **redeploy** the site

---

## ✅ Step 6: Test the Login Flow

1. Go to **https://www.jomicheck.com**
2. Hard refresh: **Cmd + Shift + R** (Mac) or **Ctrl + Shift + R** (Windows)
3. Click **"Login"** button
4. Click **"Continue with Google"**
5. **Expected behavior:**
   - ✅ Should redirect to Google login page
   - ✅ After logging in, should redirect back to JomiCheck
   - ✅ Should show your profile/credits

---

## 🚨 Common Issues & Fixes

### Issue: "Loading..." button never stops
**Fix:**
- Check browser console (F12) for errors
- Verify all environment variables are set in Vercel
- Make sure Supabase Google provider is enabled

### Issue: "redirect_uri_mismatch" error
**Fix:**
- In Google Cloud Console, add this exact URL to **Authorized redirect URIs**:
  ```
  https://tyiuowhrdnaoxqrxpfbd.supabase.co/auth/v1/callback
  ```
- Make sure there are NO trailing spaces or extra characters

### Issue: "OAuth client not found"
**Fix:**
- Verify Client ID and Client Secret in Supabase match Google Cloud Console
- Make sure you copied the correct OAuth 2.0 Client ID (not API key)

### Issue: Redirects but shows error page
**Fix:**
- Check Supabase → Authentication → URL Configuration
- Make sure `https://www.jomicheck.com` is in Redirect URLs
- Redeploy Vercel after making changes

### Issue: "Access blocked: This app's request is invalid"
**Fix:**
- Go to Google Cloud Console → OAuth consent screen
- Click **"PUBLISH APP"** to make it available to all users
- Wait 5-10 minutes for changes to propagate

---

## 📝 Quick Reference: What Should Match

| Location | Value |
|----------|-------|
| **Supabase → Site URL** | `https://www.jomicheck.com` |
| **Supabase → Redirect URLs** | `https://www.jomicheck.com` |
| **Google Cloud → Authorized redirect URIs** | `https://tyiuowhrdnaoxqrxpfbd.supabase.co/auth/v1/callback` |
| **Supabase → Google Provider → Client ID** | (from Google Cloud Console) |
| **Supabase → Google Provider → Client Secret** | (from Google Cloud Console) |

---

## ✅ Final Checklist

- [ ] Google provider enabled in Supabase
- [ ] Client ID and Secret added to Supabase
- [ ] Supabase redirect URLs configured
- [ ] Google Cloud OAuth client has correct callback URL
- [ ] OAuth consent screen is published
- [ ] Vercel environment variables are set
- [ ] Site is redeployed after changes
- [ ] Tested login flow works

---

**If all of the above are correct and login still doesn't work, check the browser console (F12) for specific error messages and share them.**

