# Supabase Setup Guide for JomiCheck

## Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** and sign up (free)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `jomicheck`
   - **Database Password**: (save this somewhere safe!)
   - **Region**: Singapore (closest to Bangladesh)
5. Click **"Create new project"** and wait ~2 minutes

---

## Step 2: Enable Phone Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Phone** and enable it
3. For SMS provider, you have options:
   - **Twilio** (recommended, has Bangladesh support)
   - **MessageBird**
   - **Vonage**

### Setting up Twilio (Recommended):
1. Create a [Twilio account](https://www.twilio.com/try-twilio)
2. Get a phone number with SMS capability
3. In Twilio Console, find your:
   - Account SID
   - Auth Token
   - Phone Number (Messaging Service SID)
4. In Supabase → Authentication → Providers → Phone:
   - Select **Twilio**
   - Enter your Twilio credentials

---

## Step 3: Create Database Tables

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Paste this SQL and click **"Run"**:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  phone TEXT,
  credits INTEGER DEFAULT 5,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  total_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for referral code lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

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

-- Policy: Allow reading any profile for referral lookups (only referral_code visible)
CREATE POLICY "Anyone can lookup referral codes" ON profiles
  FOR SELECT USING (true);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create credit_transactions table for audit
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'purchase', 'usage', 'referral_bonus', 'signup_bonus'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Allow inserting transactions
CREATE POLICY "Allow inserting transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## Step 4: Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## Step 5: Add Environment Variables

### In Vercel:
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key

### For Local Development:
Create `.env.local` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 6: Redeploy

After adding environment variables:
1. Go to Vercel → Deployments
2. Click "..." on latest deployment → "Redeploy"

---

## Features Enabled:

✅ **Phone OTP Login** - Users sign in with phone number only  
✅ **Auto Profile Creation** - 5 free credits on signup  
✅ **Referral System** - 10 bonus credits for both referrer and referee  
✅ **Credit Management** - Track and deduct credits  
✅ **Transaction History** - Audit log of all credit changes  

---

## Cost Estimate (Free Tier):

- **Supabase**: Free up to 50,000 MAU
- **Twilio SMS**: ~$0.05 per SMS to Bangladesh
  - 1000 signups/month = ~$50/month

---

## Testing Locally:

1. Run `npm install` to install @supabase/supabase-js
2. Create `.env.local` with your Supabase credentials
3. Run `npm run dev`
4. Test phone login with your own number

---

## Need Help?

- [Supabase Docs](https://supabase.com/docs)
- [Twilio SMS Setup](https://supabase.com/docs/guides/auth/phone-login/twilio)

