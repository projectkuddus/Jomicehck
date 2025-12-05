# 📋 Step-by-Step Configuration Guide

This guide will walk you through **every single step** to get JomiCheck ready for launch.

---

## ✅ Step 1: Supabase Database Setup (10 minutes)

### 1.1 Go to Supabase SQL Editor
1. Open https://supabase.com
2. Login to your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### 1.2 Run This SQL Code
Copy and paste this entire code block, then click **"Run"**:

```sql
-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own payments" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
```

**✅ Check:** You should see "Success. No rows returned" - that means it worked!

---

## ✅ Step 2: Get Supabase Keys (5 minutes)

### 2.1 Get Service Role Key
1. In Supabase, go to **Settings** → **API**
2. Scroll down to **"Project API keys"**
3. Find **"service_role"** key (⚠️ Keep this SECRET!)
4. Click the **eye icon** to reveal it
5. **Copy** the entire key (starts with `eyJ...`)

### 2.2 Get Anon Key
1. In the same page, find **"anon public"** key
2. **Copy** it (also starts with `eyJ...`)

### 2.3 Get Project URL
1. At the top of the same page, you'll see **"Project URL"**
2. **Copy** it (looks like `https://xxxxx.supabase.co`)

---

## ✅ Step 3: Add Environment Variables to Vercel (10 minutes)

### 3.1 Go to Vercel Dashboard
1. Visit https://vercel.com
2. Login and select your **jomicheck** project
3. Click **"Settings"** (top right)
4. Click **"Environment Variables"** (left sidebar)

### 3.2 Add These Variables One by One

Click **"Add New"** for each:

| Key | Value | Where to Find |
|-----|-------|---------------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (long string) | Supabase Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (long string) | Supabase Settings → API → service_role |
| `VITE_ADMIN_PASSWORD` | `your-secure-password-123` | **Make up a strong password!** |

**Important:**
- For **"Environment"**, select **"Production"** (or "All Environments")
- Click **"Save"** after each one

### 3.3 Redeploy
1. Go to **"Deployments"** tab
2. Click the **3 dots** (⋯) on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes for deployment to finish

---

## ✅ Step 4: Configure Supabase CORS (5 minutes)

### 4.1 Go to Supabase Authentication Settings
1. In Supabase, click **"Authentication"** (left sidebar)
2. Click **"URL Configuration"**

### 4.2 Add Your Domain
1. **Site URL:** `https://www.jomicheck.com`
2. **Redirect URLs:** Add these one by one:
   - `https://www.jomicheck.com`
   - `https://jomicheck.com`
   - `http://localhost:5173` (for local testing)
3. Click **"Save"**

---

## ✅ Step 5: Set Up Manual Payment System (5 minutes)

### 5.1 Get Your bKash/Nagad Number
- Write down your bKash personal number: `01XXXXXXXXX`
- Write down your Nagad number (if you have one): `01XXXXXXXXX`

### 5.2 Update Payment Instructions (Optional)
The payment modal will show these numbers. You can:
- Update them in the code later, OR
- Just tell users your number when they contact you

### 5.3 How Manual Payment Works:
1. User selects package and payment method (bKash/Nagad)
2. User sees your bKash/Nagad number
3. User sends money and enters transaction ID
4. Payment shows as "pending" in admin panel
5. You check your bKash/Nagad account
6. If payment received → Click "Verify" in admin panel
7. Credits automatically added to user account!

---

## ✅ Step 6: Test Everything (15 minutes)

### 6.1 Test Login
1. Visit https://www.jomicheck.com
2. Click **"Login"**
3. Enter your email
4. Check email for OTP code
5. Enter code and login
6. ✅ Should see your credits!

### 6.2 Test Admin Panel
1. Visit https://www.jomicheck.com/#admin
2. Enter your admin password (the one you set in Vercel)
3. ✅ Should see admin dashboard

### 6.3 Test Payment Flow (Test Mode)
1. Login as a user
2. Upload a document (or just try to analyze)
3. Click "Buy Credits"
4. Select a package
5. Choose bKash/Nagad
6. Enter a test transaction ID (like "TEST123")
7. Submit
8. Go to admin panel → Payments tab
9. ✅ Should see pending payment
10. Click "Verify" (even though it's test)
11. ✅ User should get credits!

---

## ✅ Step 7: Optional - Email Service (10 minutes)

### 7.1 Sign Up for Resend (Free)
1. Visit https://resend.com
2. Sign up (free tier: 3,000 emails/month)
3. Verify your email

### 7.2 Add Domain (Optional)
- For now, you can use Resend's test domain
- Later, verify `jomicheck.com` for professional emails

### 7.3 Get API Key
1. Go to **API Keys** in Resend dashboard
2. Click **"Create API Key"**
3. Name it: `jomicheck-production`
4. **Copy** the key (starts with `re_...`)

### 7.4 Add to Vercel
1. Go to Vercel → Settings → Environment Variables
2. Add: `RESEND_API_KEY` = `re_...your-key`
3. Add: `SUPPORT_EMAIL` = `support@jomicheck.com` (or your email)
4. Redeploy

**✅ Now support form will send real emails!**

---

## ✅ Step 8: Optional - Google Analytics (5 minutes)

### 8.1 Create GA4 Property
1. Visit https://analytics.google.com
2. Click **"Start measuring"** or **"Admin"**
3. Create a new **GA4 property**
4. Name it: `JomiCheck`
5. Get your **Measurement ID** (looks like `G-XXXXXXXXXX`)

### 8.2 Add to Vercel
1. Vercel → Settings → Environment Variables
2. Add: `VITE_GA_MEASUREMENT_ID` = `G-XXXXXXXXXX`
3. Redeploy

**✅ Now you'll track website visitors!**

---

## ✅ Step 9: Optional - Live Chat (5 minutes)

### 9.1 Sign Up for Tawk.to (Free)
1. Visit https://www.tawk.to
2. Sign up (completely free!)
3. Create a new **Property**
4. Name it: `JomiCheck`

### 9.2 Get Your IDs
1. In Tawk.to dashboard, go to **Administration** → **Channels** → **Chat Widget**
2. You'll see:
   - **Property ID** (long string)
   - **Widget ID** (long string)
3. **Copy** both

### 9.3 Add to Vercel
1. Vercel → Settings → Environment Variables
2. Add: `VITE_TAWK_PROPERTY_ID` = `your-property-id`
3. Add: `VITE_TAWK_WIDGET_ID` = `your-widget-id`
4. Redeploy

**✅ Now users can chat with you live!**

---

## 🎯 Quick Reference: All Environment Variables

Here's everything you need in Vercel:

### Required:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
VITE_ADMIN_PASSWORD=your-secure-password
```

### Optional (but recommended):
```
RESEND_API_KEY=re_...
SUPPORT_EMAIL=support@jomicheck.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_TAWK_PROPERTY_ID=xxxxx
VITE_TAWK_WIDGET_ID=xxxxx
```

---

## 🚨 Common Issues & Fixes

### "Auth not configured"
- ✅ Check all Supabase env vars are in Vercel
- ✅ Make sure you redeployed after adding them

### "Payment not showing in admin"
- ✅ Make sure you ran the SQL to create `payment_transactions` table
- ✅ Check Supabase → Table Editor → payment_transactions (should exist)

### "Can't verify payment"
- ✅ Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- ✅ Check browser console for errors

### "Support form not sending email"
- ✅ Resend is optional - form still works, just logs to console
- ✅ To enable emails, add `RESEND_API_KEY` to Vercel

---

## ✅ Final Checklist

Before going live, verify:

- [ ] Supabase database tables created (profiles, payment_transactions, credit_transactions)
- [ ] All environment variables added to Vercel
- [ ] Vercel deployment successful (green checkmark)
- [ ] Can login with email OTP
- [ ] Admin panel accessible at `/#admin`
- [ ] Payment flow works (test with fake transaction ID)
- [ ] Can verify payment in admin panel
- [ ] Credits added after verification

---

## 🎉 You're Ready!

Once all checkboxes are ✅, your site is ready for real users!

**Need help?** Check the error messages in browser console (F12) or Vercel deployment logs.

