-- ⚠️ WARNING: This will DELETE ALL users and their data!
-- Only run this if you want to start completely fresh.
-- This cannot be undone!

-- Step 1: Delete all payment transactions
DELETE FROM payment_transactions;

-- Step 2: Delete all credit transactions
DELETE FROM credit_transactions;

-- Step 3: Delete all profiles (this will cascade from auth.users, but we do it explicitly)
DELETE FROM profiles;

-- Step 4: Delete all auth users (this is the main user table)
-- This will automatically delete related profiles due to CASCADE
DELETE FROM auth.users;

-- Verify everything is deleted
SELECT 'payment_transactions' as table_name, COUNT(*) as remaining FROM payment_transactions
UNION ALL
SELECT 'credit_transactions', COUNT(*) FROM credit_transactions
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users;

-- If all counts are 0, you're good to go! ✅

