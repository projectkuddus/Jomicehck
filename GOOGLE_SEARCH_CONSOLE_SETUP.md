# Google Search Console Setup Guide

## 🎯 Goal: Get jomicheck.com indexed on Google Search

**Current Status:** Site is live but not yet indexed by Google  
**Time to Index:** Usually 1-7 days after submission

---

## Step 1: Verify Site Ownership (5 minutes)

### 1.1 Go to Google Search Console
- Visit: https://search.google.com/search-console
- Sign in with your Google account

### 1.2 Add Property
1. Click **"Add Property"** (top left)
2. Select **"URL prefix"** (not Domain)
3. Enter: `https://www.jomicheck.com`
4. Click **"Continue"**

### 1.3 Verify Ownership

**Option A: HTML Tag (Easiest)**
1. Google will show you an HTML tag like:
   ```html
   <meta name="google-site-verification" content="ABC123XYZ..." />
   ```
2. Copy the `content` value
3. I'll add it to your `index.html` file
4. Click **"Verify"** in Google Search Console

**Option B: HTML File Upload**
1. Download the verification file Google provides
2. Upload it to `/public/` folder
3. It should be accessible at: `https://www.jomicheck.com/google123abc.html`
4. Click **"Verify"**

**Option C: DNS Record** (If you have domain access)
1. Add a TXT record in your domain DNS
2. Google will provide the exact record to add

---

## Step 2: Submit Sitemap (2 minutes)

### 2.1 After Verification
1. In Google Search Console, go to **"Sitemaps"** (left sidebar)
2. Enter: `https://www.jomicheck.com/sitemap.xml`
3. Click **"Submit"**
4. Status should show **"Success"**

### 2.2 Verify Sitemap is Accessible
- Visit: https://www.jomicheck.com/sitemap.xml
- Should show XML content (not 404)

---

## Step 3: Request Indexing (1 minute)

### 3.1 Submit Homepage
1. In Google Search Console, go to **"URL Inspection"** (top search bar)
2. Enter: `https://www.jomicheck.com`
3. Click **"Test Live URL"**
4. If it shows "URL is on Google" → Already indexed! ✅
5. If not, click **"Request Indexing"**
6. Status will show **"Requested"**

### 3.2 Submit Key Pages
Repeat for:
- `https://www.jomicheck.com/#pricing`
- `https://www.jomicheck.com/#how-it-works`
- `https://www.jomicheck.com/#support`

---

## Step 4: Check Indexing Status

### 4.1 Coverage Report
1. Go to **"Coverage"** (left sidebar)
2. Check **"Valid"** pages
3. Should show your pages being indexed

### 4.2 Performance Report
1. Go to **"Performance"** (left sidebar)
2. After 1-2 days, you'll see search queries
3. Shows how people find your site

---

## ⏱️ Timeline

| Action | Time |
|--------|------|
| Verification | 5 minutes |
| Sitemap Submission | 2 minutes |
| First Indexing | 1-7 days |
| Appear in Search | 1-14 days |

---

## 🔍 How to Check if You're Indexed

### Method 1: Google Search
Search for:
- `site:jomicheck.com`
- `"jomicheck"`
- `"জমি যাচাই"`

If your site appears → **Indexed!** ✅

### Method 2: Google Search Console
- Go to **"Coverage"** → **"Valid"**
- Should show pages indexed

---

## 🚨 Common Issues

### "Sitemap couldn't be fetched"
- **Fix:** Check `https://www.jomicheck.com/sitemap.xml` is accessible
- **Fix:** Make sure sitemap.xml is in `/public/` folder

### "URL not on Google"
- **Fix:** Click **"Request Indexing"** for each page
- **Fix:** Wait 1-7 days (normal)

### "Crawl errors"
- **Fix:** Check if site is accessible
- **Fix:** Check robots.txt allows Googlebot

---

## 📊 After Setup Checklist

- [ ] Site verified in Google Search Console
- [ ] Sitemap submitted and showing "Success"
- [ ] Homepage requested for indexing
- [ ] Key pages requested for indexing
- [ ] Checked `site:jomicheck.com` after 2-3 days

---

## 🎯 Pro Tips

1. **Create Google My Business** (if applicable)
   - Helps local SEO
   - Shows in Google Maps

2. **Submit to Bing Webmaster Tools**
   - Visit: https://www.bing.com/webmasters
   - Same process as Google

3. **Share on Social Media**
   - Facebook, Twitter, LinkedIn
   - Helps Google discover your site faster

4. **Get Backlinks**
   - Ask friends to link to your site
   - Submit to Bangladesh business directories

---

## ✅ Success Indicators

After 1-2 weeks, you should see:
- ✅ Site appears in `site:jomicheck.com` search
- ✅ Google Search Console shows impressions
- ✅ People can find you by searching "jomicheck"
- ✅ People can find you by searching "জমি যাচাই"

---

**Need Help?** Let me know which verification method you prefer, and I'll add the code to your site!

