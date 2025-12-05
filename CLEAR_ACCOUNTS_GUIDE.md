# 🗑️ Clear All Accounts - Fresh Start Guide

## ⚠️ WARNING
**This will DELETE ALL users, profiles, transactions, and credits!**
**This action CANNOT be undone!**

Only do this if you want to start completely fresh with the new password-based authentication system.

---

## Step-by-Step Instructions

### Step 1: Go to Supabase SQL Editor
1. Open https://supabase.com
2. Login to your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Clear Script
1. Open the file `CLEAR_ALL_ACCOUNTS.sql` (in this repo)
2. Copy the entire SQL code
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)

### Step 3: Verify Everything is Deleted
After running, you should see a result table showing:
- `payment_transactions`: 0
- `credit_transactions`: 0
- `profiles`: 0
- `auth.users`: 0

If all counts are **0**, you're done! ✅

---

## What Gets Deleted

✅ All user accounts (auth.users)
✅ All user profiles (profiles)
✅ All credit transactions (credit_transactions)
✅ All payment transactions (payment_transactions)
✅ All referral relationships
✅ All credits

---

## After Clearing

1. **Test Signup**: Create a new account with the new password system
2. **Test Login**: Login with email + password
3. **Test Payment**: Try the payment flow
4. **Test Referral**: Test the referral system

---

## Alternative: Keep Some Data

If you want to keep some data (like payment records for accounting), you can modify the SQL:

```sql
-- Only delete users and profiles, keep transactions for records
DELETE FROM profiles;
DELETE FROM auth.users;
```

But note: This will leave orphaned records in payment_transactions and credit_transactions.

---

## Need Help?

If you get any errors:
1. Check that you're in the correct Supabase project
2. Make sure you have admin access
3. Try running each DELETE statement one at a time
4. Check the Supabase logs for detailed error messages

