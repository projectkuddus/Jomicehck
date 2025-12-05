# Supabase Setup Guide for JomiCheck

## Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** and sign up (GitHub login works)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `jomicheck`
   - **Database Password**: (save this somewhere safe!)
   - **Region**: Singapore (closest to Bangladesh)
5. Click **"Create new project"** and wait ~2 minutes

---

## Step 2: Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** and make sure it's **enabled**
3. Under Email settings:
   - ✅ Enable "Confirm email" (for OTP)
   - Set "OTP expiry" to 10 minutes

**That's it!** Email OTP is FREE with Supabase. No Twilio needed!

---

## Step 3: Create Database Tables

Go to **SQL Editor** in Supabase and run this SQL:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  credits INTEGER DEFAULT 5,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  total_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for referral code lookups
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Allow reading any profile's referral_code (for referral system)
CREATE POLICY "Anyone can read referral codes" ON profiles
  FOR SELECT USING (true);

-- Create credit_transactions table for history
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'purchase', 'usage', 'referral_bonus', 'signup_bonus'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

Click **"Run"** to execute.

---

## Step 4: Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## Step 5: Add to Vercel Environment Variables

In Vercel dashboard → Your Project → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...your-anon-key` |

Then click **Redeploy** (Deployments → 3 dots → Redeploy).

---

## ✅ Done!

Your setup is complete. Users can now:
1. Sign up/login with email (receive OTP code)
2. Get 5 free credits on signup
3. Use referral codes for +10 bonus credits
4. Share their referral code to earn credits

---

## Cost Summary

| Feature | Cost |
|---------|------|
| Supabase (Free tier) | $0/month |
| Email OTP | FREE (up to 50,000/month) |
| Database | FREE (500MB) |
| Authentication | FREE |

**Total: $0/month** (on free tier)

---

## Troubleshooting

### "Auth not configured" message?
- Make sure you added the env variables to Vercel
- Make sure you redeployed after adding them

### OTP email not arriving?
- Check spam/junk folder
- Email OTP is limited to 4 per hour per email on free tier

### Profile not created?
- Make sure the SQL was run successfully in Supabase
- Check browser console for errors
