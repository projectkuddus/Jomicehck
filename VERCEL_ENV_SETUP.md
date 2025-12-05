# 🚀 Vercel Environment Variables Setup

## Step-by-Step Instructions:

### 1. Go to Vercel Dashboard
1. Visit: https://vercel.com
2. Login to your account
3. Click on your **"jomicheck"** project (or whatever you named it)

### 2. Open Environment Variables
1. Click **"Settings"** (top navigation)
2. Click **"Environment Variables"** (left sidebar)

### 3. Add Each Variable One by One

Click **"Add New"** button and add these **4 variables**:

---

#### Variable 1: VITE_SUPABASE_URL
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://tyiuowhrdnaoxqrxpfbd.supabase.co`
- **Environment:** Select **"Production"** (or "All Environments")
- Click **"Save"**

---

#### Variable 2: VITE_SUPABASE_ANON_KEY
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5aXVvd2hyZG5hb3hxcnhwZmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzkxMTEsImV4cCI6MjA4MDQ1NTExMX0.P3YIY_lzJV-jIMGuuuWdmj1nZf_vlwfZIm7nZQtiARQ`
- **Environment:** Select **"Production"** (or "All Environments")
- Click **"Save"**

---

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5aXVvd2hyZG5hb3hxcnhwZmJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDg3OTExMSwiZXhwIjoyMDgwNDU1MTExfQ.CfDpz1UIK1Ahb__9Wh5HIAuiv0QcXzPgn78GKWz5ihs`
- **Environment:** Select **"Production"** (or "All Environments")
- Click **"Save"**

---

#### Variable 4: VITE_ADMIN_PASSWORD
- **Key:** `VITE_ADMIN_PASSWORD`
- **Value:** `your-secure-password-here` (⚠️ **CHANGE THIS** - make up a strong password!)
- **Environment:** Select **"Production"** (or "All Environments")
- Click **"Save"**

**Example strong password:** `JomiCheck2024!SecureAdmin`

---

## 4. Redeploy Your Site

After adding all 4 variables:

1. Go to **"Deployments"** tab (top navigation)
2. Find the latest deployment
3. Click the **3 dots** (⋯) menu
4. Click **"Redeploy"**
5. Wait 2-3 minutes for deployment to finish

---

## ✅ Verification

After redeploy, check:
- [ ] All 4 environment variables are listed
- [ ] Deployment shows green checkmark (✅)
- [ ] Visit https://www.jomicheck.com - site loads
- [ ] Try to login - should work now!

---

## 🎯 What's Next?

After redeploy is complete, we'll:
1. Configure Supabase CORS (Step 4)
2. Test everything (Step 5)
3. Set up manual payment system (Step 6)

