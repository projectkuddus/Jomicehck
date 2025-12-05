# 🔍 Payment Error Debugging Guide

## If you see "Something went wrong" error:

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for red error messages
4. **Copy the exact error message**

### Step 2: Check Network Tab
1. In DevTools, go to **Network** tab
2. Try to make a payment again
3. Find the `/api/payment` request
4. Click on it
5. Check:
   - **Status code** (should be 200, not 500)
   - **Response** tab - what does it say?

### Step 3: Common Issues & Fixes

#### Issue 1: "Failed to create payment record"
**Cause:** `payment_transactions` table doesn't exist in Supabase

**Fix:**
1. Go to Supabase SQL Editor
2. Run the SQL from `supabase_payment_table.sql`
3. Verify table exists: Supabase → Table Editor → payment_transactions

#### Issue 2: "Payment system not configured"
**Cause:** `SUPABASE_SERVICE_ROLE_KEY` not set in Vercel

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Add: `SUPABASE_SERVICE_ROLE_KEY` = your service role key
3. Redeploy

#### Issue 3: CORS Error
**Cause:** API route not accessible

**Fix:**
- Check Vercel deployment logs
- Verify `/api/payment` route exists

#### Issue 4: "Invalid response from server"
**Cause:** API returning non-JSON response

**Fix:**
- Check Vercel function logs
- Verify Supabase connection

---

## Quick Test:

Open browser console and run:
```javascript
fetch('/api/payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test',
    packageId: 'starter',
    paymentMethod: 'bkash',
    transactionId: 'TEST123'
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

This will show you the exact error from the API.

---

## Most Likely Issue:

**The `payment_transactions` table doesn't exist!**

**Solution:** Run the SQL from Step 1 of the setup guide in Supabase.

