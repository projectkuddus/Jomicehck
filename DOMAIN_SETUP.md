# Domain Setup: www.jomicheck.com

## Current Status:
- ✅ Code deployed on Vercel
- ⏳ Domain needs to be connected

## Step-by-Step Domain Connection:

### STEP 1: Add Domain in Vercel

1. Go to your Vercel project dashboard
2. Click **"Settings"** tab
3. Click **"Domains"** in the sidebar
4. Enter: `www.jomicheck.com`
5. Click **"Add"**

### STEP 2: Get DNS Records from Vercel

Vercel will show you DNS records. You'll see something like:

**Option A: CNAME (Recommended)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Option B: A Records** (if CNAME doesn't work)
```
Type: A
Name: www
Value: 76.76.21.21 (example IP)
```

### STEP 3: Add DNS at Your Domain Registrar

1. **Log in to your domain registrar**
   - Where you bought jomicheck.com
   - Common ones: Namecheap, GoDaddy, Google Domains, Cloudflare

2. **Find DNS Management**
   - Look for: "DNS Settings", "DNS Management", "Manage DNS"
   - Usually under "Domain Settings" or "Advanced"

3. **Add the Record Vercel Shows**
   - If CNAME: Add CNAME record
     - **Host/Name**: `www`
     - **Points to/Value**: `cname.vercel-dns.com` (or what Vercel shows)
     - **TTL**: 3600 (or default)
   - If A Record: Add A records with the IPs Vercel provides

4. **Save the DNS record**

### STEP 4: Wait for Propagation

1. **DNS Propagation**: 5-60 minutes (usually 10-15 min)
2. **Vercel SSL**: Auto-generates after DNS is active
3. **Check Status**: Vercel dashboard will show "Valid" when ready

### STEP 5: Verify

1. Visit: `https://www.jomicheck.com`
2. Should load your site!
3. SSL certificate should be active (green lock icon)

---

## Troubleshooting:

### "Domain not working"
- Wait 15-30 minutes for DNS propagation
- Check DNS records are correct
- Verify Vercel shows domain as "Valid"
- Try: `https://www.jomicheck.com` (with https)

### "SSL not working"
- Wait for Vercel to generate certificate (5-10 min after DNS)
- Check Vercel dashboard shows "Valid" status
- Clear browser cache

### "Can't find DNS settings"
- Different registrars have different interfaces
- Look for: "DNS", "Nameservers", "DNS Records"
- Contact your registrar support if stuck

---

## Quick Checklist:

- [ ] Domain added in Vercel
- [ ] DNS records copied from Vercel
- [ ] DNS records added at registrar
- [ ] Waited 10-15 minutes
- [ ] Vercel shows domain as "Valid"
- [ ] Site loads at https://www.jomicheck.com

---

## Need Help?

Tell me:
1. Which domain registrar you use (Namecheap, GoDaddy, etc.)
2. What you see in Vercel's domain settings
3. Any error messages

I'll guide you through it! 🚀

