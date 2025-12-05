# 🔍 Payment 500 Error - Diagnostic Guide

## I've Added Comprehensive Error Logging

The payment API now logs **detailed error information** to help us identify the exact problem.

---

## Step 1: Check Vercel Logs (MOST IMPORTANT)

This will show us the **exact error**:

1. Go to **Vercel Dashboard** → Your project (`jomicehck`)
2. Click **"Logs"** tab (top navigation)
3. **Try to make a payment** on the website
4. **Immediately** go back to Vercel Logs
5. Look for the most recent log entries
6. You should see logs like:
   - `🔍 Payment API - Environment Check:`
   - `💳 Payment request received:`
   - `❌ Payment record error:` (if there's an error)

7. **Copy the entire error message** and share it with me

---

## Step 2: Check Browser Console

1. Open your website: **https://www.jomicheck.com**
2. Press **F12** (or right-click → Inspect)
3. Go to **Console** tab
4. Try to make a payment
5. Look for error messages (red text)
6. **Copy any error messages** you see

---

## Step 3: Verify Environment Variables

Go to **Vercel** → **Settings** → **Environment Variables** and verify:

1. ✅ `VITE_SUPABASE_URL` - Should start with `https://`
2. ✅ `VITE_SUPABASE_ANON_KEY` - Should be a long JWT token
3. ✅ `SUPABASE_SERVICE_ROLE_KEY` - Should be a long JWT token (different from anon key)
4. ✅ `VITE_ADMIN_PASSWORD` - Your admin password
5. ✅ `GEMINI_API_KEY` - Your Gemini API key

**Important:** Make sure `SUPABASE_SERVICE_ROLE_KEY` is set correctly:
- Go to **Supabase Dashboard** → **Settings** → **API**
- Copy the **"service_role"** key (NOT the anon key)
- Paste it in Vercel as `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 4: Verify RLS Policies

Even though you ran the SQL, let's double-check:

1. Go to **Supabase Dashboard** → **Table Editor** → **payment_transactions**
2. Click **"Policies"** tab (top right)
3. You should see **5 policies**:
   - ✅ Users can view own payments
   - ✅ Users can insert own payments
   - ✅ **Service role can insert payments** ← This one is critical
   - ✅ **Service role can update payments**
   - ✅ **Service role can read all payments**

If the service role policies are missing, run this SQL again:

```sql
-- Allow service role to insert payments
CREATE POLICY "Service role can insert payments" ON payment_transactions
  FOR INSERT WITH CHECK (true);

-- Allow service role to update payments
CREATE POLICY "Service role can update payments" ON payment_transactions
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow service role to read all payments
CREATE POLICY "Service role can read all payments" ON payment_transactions
  FOR SELECT USING (true);
```

---

## Step 5: Test Direct API Call

Open browser console and run:

```javascript
fetch('/api/payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test-user-id-123',
    packageId: 'starter',
    paymentMethod: 'bkash',
    transactionId: 'TEST123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Response:', data);
})
.catch(err => {
  console.error('❌ Error:', err);
});
```

This will show the exact error from the API.

---

## Common Error Codes & Fixes

### Error Code: `PGRST116`
**Meaning:** Table not found
**Fix:** Run the SQL to create `payment_transactions` table

### Error Code: `42501`
**Meaning:** Permission denied
**Fix:** Service role key not set correctly, or RLS policies missing

### Error Code: `23503`
**Meaning:** Foreign key violation (user doesn't exist)
**Fix:** User must be logged in and have a profile

### Error: "Service role key missing"
**Fix:** Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables

---

## What to Share With Me

After checking the above, share:

1. **Vercel Logs** - The exact error message from Step 1
2. **Browser Console** - Any errors from Step 2
3. **Environment Variables** - Confirm all are set (don't share the actual values)
4. **RLS Policies** - Confirm all 5 policies exist

This will help me identify the **exact problem** and fix it permanently.

