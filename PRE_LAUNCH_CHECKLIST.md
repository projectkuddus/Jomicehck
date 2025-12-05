# 🚀 Pre-Launch Checklist - JomiCheck

## ✅ Critical Systems to Test

### 1. Authentication System
- [ ] **Sign Up Flow**
  - [ ] Enter email → Receive OTP
  - [ ] Enter OTP → Verify email
  - [ ] Set password (6+ characters)
  - [ ] Optional referral code works
  - [ ] User receives 5 free credits on signup
  - [ ] Profile created correctly in Supabase

- [ ] **Login Flow**
  - [ ] Login with email + password works
  - [ ] No OTP delay (instant login)
  - [ ] User menu shows correct credits
  - [ ] Session persists after page refresh

- [ ] **Logout Flow**
  - [ ] Click "Sign Out" → Immediately shows login button
  - [ ] Refresh page → Still logged out (no auto-login)
  - [ ] Can login again with same credentials

- [ ] **Forgot Password Flow**
  - [ ] Click "Forgot password?" → Enter email
  - [ ] Receive reset link in email
  - [ ] Click link → Redirected to site
  - [ ] Set new password → Can login with new password

---

### 2. Document Analysis System
- [ ] **Upload & Analysis**
  - [ ] Upload document (PDF/Image)
  - [ ] Without login → Prompted to login
  - [ ] With login but no credits → Payment modal opens
  - [ ] With credits → Analysis runs successfully
  - [ ] Progress indicator shows during analysis
  - [ ] Credits deducted correctly after analysis

- [ ] **Report Display**
  - [ ] Report shows all sections (Risk, Buyer Protection, etc.)
  - [ ] Bangla text displays correctly
  - [ ] All data is accurate

---

### 3. PDF Download
- [ ] **Print/Download**
  - [ ] Click "Download PDF" button
  - [ ] Print dialog opens
  - [ ] Only report content is visible (no UI elements)
  - [ ] Save as PDF works
  - [ ] PDF contains full report
  - [ ] No uploaded images in PDF (only report text)

---

### 4. Payment System
- [ ] **Credit Purchase**
  - [ ] Click "Buy Credits" when low/out of credits
  - [ ] Select credit package (Starter/Popular/Pro/Agent)
  - [ ] Choose payment method (bKash/Nagad)
  - [ ] See bKash number: **01613078101**
  - [ ] Enter transaction ID
  - [ ] Submit payment → Success message
  - [ ] Payment shows as "pending" in admin panel

- [ ] **Admin Verification**
  - [ ] Access admin panel: `/#admin`
  - [ ] Login with admin password
  - [ ] See pending payments
  - [ ] Verify payment → Credits added to user
  - [ ] User sees updated credits

---

### 5. Referral System
- [ ] **Referral Code**
  - [ ] New user signs up
  - [ ] Receives unique referral code
  - [ ] Can copy/share referral code
  - [ ] Friend signs up with referral code
  - [ ] Both get 10 bonus credits
  - [ ] Referral count updates correctly

---

### 6. User Experience
- [ ] **Navigation**
  - [ ] All pages load correctly (Home, How It Works, Pricing, Support)
  - [ ] Footer links work (Terms, Privacy)
  - [ ] Mobile responsive design works

- [ ] **Error Handling**
  - [ ] Network errors show user-friendly messages
  - [ ] Invalid inputs show clear errors
  - [ ] No white screen crashes

- [ ] **Performance**
  - [ ] Page loads quickly
  - [ ] Analysis completes within reasonable time
  - [ ] No console errors

---

## 🔧 Configuration Checklist

### Supabase
- [ ] All tables exist:
  - [ ] `profiles`
  - [ ] `credit_transactions`
  - [ ] `payment_transactions`
- [ ] Row Level Security (RLS) enabled
- [ ] Policies configured correctly
- [ ] Email authentication enabled
- [ ] Redirect URLs configured:
  - [ ] `https://www.jomicheck.com`
  - [ ] `https://jomicheck.com`

### Vercel
- [ ] Environment variables set:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `VITE_ADMIN_PASSWORD`
  - [ ] `GEMINI_API_KEY`
- [ ] Deployment successful
- [ ] No build errors

### Domain
- [ ] Domain connected: `www.jomicheck.com`
- [ ] SSL certificate active
- [ ] Site loads on domain

---

## 🧪 Test Scenarios

### Scenario 1: New User Journey
1. Visit site → See login button
2. Click "Sign up" → Enter email
3. Receive OTP → Verify
4. Set password
5. Enter referral code (optional)
6. Upload document → Analysis runs
7. View report → Download PDF
8. Run out of credits → Buy more
9. Complete payment → Admin verifies
10. Continue using service

### Scenario 2: Returning User
1. Visit site → Click "Login"
2. Enter email + password → Instant login
3. Upload document → Analysis runs
4. View report → Download PDF
5. Logout → Confirmed logged out

### Scenario 3: Payment Flow
1. User has 0 credits
2. Upload document → Payment modal opens
3. Select package → Enter transaction ID
4. Submit → Pending status
5. Admin verifies → Credits added
6. User can now analyze

---

## 🐛 Known Issues to Watch

1. **OTP Email Delivery**: If OTP doesn't arrive, check spam folder
2. **Payment Verification**: Admin must manually verify each payment
3. **Large Files**: Files > 4.5MB may need batching (handled automatically)

---

## 📊 Success Metrics

After launch, monitor:
- Signup conversion rate
- Analysis completion rate
- Payment success rate
- Average credits per user
- Referral usage rate

---

## 🚨 If Something Breaks

1. Check browser console (F12) for errors
2. Check Vercel function logs
3. Check Supabase logs
4. Verify environment variables
5. Test in incognito mode (clear cache)

---

## ✅ Final Sign-Off

- [ ] All critical systems tested
- [ ] No blocking errors
- [ ] User flows work end-to-end
- [ ] Payment system functional
- [ ] Admin panel accessible
- [ ] Ready for real users

**Date:** _______________
**Tested By:** _______________
**Status:** ✅ Ready / ⚠️ Issues Found

