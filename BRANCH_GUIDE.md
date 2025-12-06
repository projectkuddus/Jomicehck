# JomiCheck Branch Guide

## You have TWO branches:

### 1. `main` (PRODUCTION - LIVE SITE)
- **URL:** https://www.jomicheck.com
- **Purpose:** Your live, working site that users see
- **Use for:** Bug fixes, small updates, email changes
- **Rule:** Only stable, tested code goes here

### 2. `develop` (TESTING - NEXT VERSION)
- **URL:** Check Vercel dashboard for preview URL
- **Purpose:** Building STANDARD, PRO, ULTRA features
- **Use for:** New features, experiments, big changes
- **Rule:** Can break things, no users see it

---

## How to tell AI which branch to work on:

### For production fixes:
> "Fix the payment bug" 
> "Add email notification"
> "Update the pricing"

→ AI works on `main` → Goes live immediately

### For new features:
> "Let's work on develop branch"
> "Build the STANDARD tier OCR"
> "Add multi-document feature to develop"

→ AI works on `develop` → Only visible on test URL

---

## Current Status:

| Branch | Status | What's there |
|--------|--------|--------------|
| `main` | ✅ LIVE | BASIC tier, all current features |
| `develop` | 🔧 TESTING | Same as main (will add STANDARD features) |

---

## When ready to upgrade:

Say: "Merge develop to main" or "Make develop features live"

→ AI merges and deploys to production

---

## Quick Commands (for reference):

```bash
# Check which branch you're on
git branch

# Switch to main (production)
git checkout main

# Switch to develop (testing)
git checkout develop
```

---

Last Updated: December 2024

