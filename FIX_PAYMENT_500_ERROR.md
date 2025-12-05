# 🔧 Fix Payment 500 Error

## The Problem

The payment API is getting a 500 error when trying to insert into `payment_transactions`. This is likely because **RLS (Row Level Security) is blocking the service role**.

## Solution: Add Service Role Policy

The service role key should bypass RLS, but sometimes Supabase still requires explicit policies. Run this SQL in Supabase:

### Step 1: Go to Supabase SQL Editor

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**

### Step 2: Run This SQL

```sql
-- Allow service role to insert payments (for API routes)
CREATE POLICY "Service role can insert payments" ON payment_transactions
  FOR INSERT 
  WITH CHECK (true);

-- Allow service role to update payments (for admin verification)
CREATE POLICY "Service role can update payments" ON payment_transactions
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Allow service role to read all payments (for admin panel)
CREATE POLICY "Service role can read all payments" ON payment_transactions
  FOR SELECT 
  USING (true);
```

### Step 3: Verify

After running the SQL:
1. Go to **Table Editor** → **payment_transactions**
2. Click **"Policies"** tab
3. You should see 5 policies:
   - Users can view own payments
   - Users can insert own payments
   - Service role can insert payments ✅
   - Service role can update payments ✅
   - Service role can read all payments ✅

---

## Alternative: Check Service Role Key

If the above doesn't work, verify:

1. **Vercel Environment Variables:**
   - `SUPABASE_SERVICE_ROLE_KEY` is set correctly
   - No extra spaces or quotes

2. **Supabase Service Role Key:**
   - Go to **Supabase Dashboard** → **Settings** → **API**
   - Copy the **"service_role"** key (NOT the anon key)
   - Make sure it matches what's in Vercel

3. **Redeploy:**
   - After updating environment variables, **redeploy** in Vercel
   - Or wait 2-3 minutes for auto-deploy

---

## Test After Fix

1. Go to **https://www.jomicheck.com**
2. Log in with Google
3. Click **"Buy More Credits"**
4. Select package
5. Enter transaction ID
6. Click **"Pay"**

**Expected:** Payment submits successfully (no 500 error)

**If still failing:** Check Vercel logs for the exact error message.

