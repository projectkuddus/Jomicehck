# 🔐 Admin Panel Guide

## How to Access Admin Panel

### URL:
```
https://www.jomicheck.com/#admin
```

### Steps:
1. Go to **https://www.jomicheck.com/#admin**
2. Enter your **admin password** (set in `VITE_ADMIN_PASSWORD` in Vercel)
3. Click **"Access Admin Panel"**

---

## How to Approve Payments

### Step 1: Access Admin Panel
- Go to: **https://www.jomicheck.com/#admin**
- Enter admin password

### Step 2: View Pending Payments
- Click the **"Payments"** tab
- You'll see all payment transactions
- **Pending** payments are highlighted

### Step 3: Verify Payment
1. Find the payment you want to verify
2. Check the **Transaction ID** matches what the user sent
3. Verify the payment in your bKash app
4. Click the **"Verify"** button (green checkmark)
5. Credits will be **automatically added** to the user's account

### Step 4: Reject Payment (if needed)
- If payment is invalid, click **"Reject"** (red X)
- Payment will be marked as failed

---

## What You Can See in Admin Panel

### Users Tab:
- All user accounts
- Email addresses
- Current credits
- Referral codes
- Total referrals
- Account creation date

### Payments Tab:
- All payment transactions
- User email
- Package purchased
- Amount paid
- Credits to be added
- Payment method (bKash)
- Transaction ID
- Status (pending/completed/failed)
- Date submitted
- **Actions**: Verify or Reject buttons

### Stats Dashboard:
- Total users
- Total credits in system
- New users today
- New users this week

---

## Quick Reference

**Admin URL:** `https://www.jomicheck.com/#admin`

**Admin Password:** Set in Vercel environment variable `VITE_ADMIN_PASSWORD`

**Payment Flow:**
1. User submits payment → Appears in admin panel as "pending"
2. Admin verifies payment in bKash app
3. Admin clicks "Verify" in admin panel
4. Credits automatically added to user account
5. User can now use credits

---

## Troubleshooting

**Can't access admin panel?**
- Check `VITE_ADMIN_PASSWORD` is set in Vercel
- Make sure URL is exactly: `https://www.jomicheck.com/#admin`

**Payments not showing?**
- Refresh the admin panel
- Check Supabase → Table Editor → `payment_transactions`
- Verify payments are being created (check Vercel logs)

**Verify button not working?**
- Check Vercel logs for errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check browser console for errors

