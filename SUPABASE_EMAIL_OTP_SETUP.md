# 🔧 Fix Supabase Email OTP (Not Confirmation Link)

## Problem:
Supabase is sending a **confirmation link** instead of an **OTP code** in the email.

## Solution: Configure Email Template

### Step 1: Go to Supabase Email Templates
1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Find **"Magic Link"** template (or **"OTP"** if available)

### Step 2: Update the Template
1. Click on **"Magic Link"** template
2. You'll see the email template editor

### Step 3: Change to OTP Format
Replace the email body with this:

**Subject:** `Your JomiCheck verification code`

**Body:**
```
Your JomiCheck verification code is: {{ .Token }}

Enter this code in the app to complete your login.

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.
```

**Important:** Make sure `{{ .Token }}` is in the template - this is the OTP code!

### Step 4: Alternative - Use "Confirm signup" Template
If "Magic Link" doesn't work:
1. Go to **"Confirm signup"** template
2. Update it with the same format above
3. Make sure it includes `{{ .Token }}`

### Step 5: Save and Test
1. Click **"Save"**
2. Try signing up again
3. Check email - should now show a code, not a link!

---

## Quick Fix: If Template Doesn't Work

If Supabase still sends links, we can extract the token from the link:

The link usually looks like:
```
https://tyiuowhrdnaoxqrxpfbd.supabase.co/auth/v1/verify?token=XXXXX&type=email
```

The `token=XXXXX` part is what users need to enter.

**But the best solution is to configure the email template properly!**

---

## Verify It's Working

After updating the template:
1. Try signing up with a new email
2. Check your email inbox
3. You should see: **"Your JomiCheck verification code is: ABC123XYZ"**
4. Copy that code and paste it in the app
5. Should work! ✅

