# 🧪 Test Payment API

## What I Fixed

1. **Supabase Client Initialization**: Now initializes inside the handler (not at module load) to ensure environment variables are available
2. **Error Handling**: Always returns valid JSON, even on unexpected errors
3. **Detailed Logging**: Added comprehensive error logging to identify the exact issue

---

## Test After Deployment (Wait 2-3 minutes)

### Step 1: Check Browser Console

1. Go to **https://www.jomicheck.com**
2. Press **F12** → **Console** tab
3. Try to make a payment
4. Look for these logs:
   - `💳 Payment request:` (shows what's being sent)
   - `💳 Payment response status:` (should be 200, not 500)
   - `✅ Payment response:` (should show success)

### Step 2: Check Vercel Logs

1. Go to **Vercel Dashboard** → Your project → **Logs**
2. Try to make a payment
3. Look for these logs:
   - `🔍 Payment API - Environment Check:` (shows if env vars are set)
   - `💳 Payment request received:` (shows the request data)
   - `Attempting to insert payment:` (shows what's being inserted)
   - `❌ Payment record error:` (if there's an error, shows the exact Supabase error)

### Step 3: Test Direct API Call

Open browser console and run:

```javascript
fetch('/api/payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'YOUR_USER_ID_HERE', // Get from browser console: localStorage
    packageId: 'starter',
    paymentMethod: 'bkash',
    transactionId: 'TEST123'
  })
})
.then(async r => {
  console.log('Status:', r.status);
  const text = await r.text();
  console.log('Response text:', text);
  try {
    return JSON.parse(text);
  } catch {
    return { error: 'Invalid JSON', raw: text };
  }
})
.then(data => {
  console.log('✅ Response:', data);
})
.catch(err => {
  console.error('❌ Error:', err);
});
```

**To get your user ID:**
```javascript
// In browser console:
JSON.parse(localStorage.getItem('sb-tyiuowhrdnaoxqrxpfbd-auth-token')).user.id
```

---

## What to Look For

### ✅ Success Signs:
- Status code: **200**
- Response: `{ success: true, paymentId: "...", ... }`
- Payment appears in admin panel

### ❌ Error Signs:
- Status code: **500**
- Response: `{ success: false, error: "...", errorCode: "..." }`
- Check the `error` and `errorCode` fields

---

## Common Error Codes

- **`PGRST116`**: Table doesn't exist
- **`42501`**: Permission denied (RLS blocking)
- **`23503`**: Invalid user ID (user doesn't exist)
- **Missing service key**: "Service role key missing"

---

## If Still Getting 500 Error

1. **Share the Vercel Logs** - The exact error message
2. **Share the Browser Console** - The error response
3. **Verify Environment Variables**:
   - `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
   - It's the "service_role" key (not "anon" key)
   - From Supabase → Settings → API → "service_role" (secret)

---

## Next Steps

After testing, share:
1. ✅ **Vercel Logs** - The exact error (if any)
2. ✅ **Browser Console** - The response
3. ✅ **Status Code** - 200 or 500?

This will help me identify the exact issue and fix it permanently.

