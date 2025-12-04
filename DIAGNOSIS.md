# Diagnosis: Blank Page Issue

## What We Know:
1. ✅ Build works locally (`npm run build` succeeds)
2. ✅ DNS is configured correctly
3. ✅ Vercel shows "Valid Configuration"
4. ❌ Both Vercel URL and custom domain show blank page

## Most Likely Issues:

### Issue 1: API Routes Can't Access Backend Code
The API routes (`api/analyze.ts`, `api/chat.ts`) import from:
- `../backend/src/services/geminiService.js`
- `../backend/src/types.js`

**Problem**: Vercel serverless functions might not be able to access files outside the `api/` folder, or the paths aren't resolving correctly.

**Solution**: Copy the backend service code into the API routes, or restructure.

### Issue 2: Static Assets Not Loading
The built HTML references `/assets/index-*.js` but Vercel might not be serving these files.

**Check**: Browser Network tab - are JS files loading? (404 errors?)

### Issue 3: Build Failing on Vercel
Vercel build might be failing silently.

**Check**: Vercel → Deployments → Latest → Build Logs

## Quick Test:

1. **Check Build Logs in Vercel:**
   - Go to your project → Deployments → Latest
   - Click "Build Logs" tab
   - Look for errors (especially around API routes or imports)

2. **Check Browser Console:**
   - Visit the site
   - Press F12 → Console tab
   - Look for errors like:
     - "Failed to load module"
     - "404 Not Found" for JS files
     - Import errors

3. **Check Network Tab:**
   - Press F12 → Network tab
   - Refresh page
   - Look for:
     - `index.html` - should load (200)
     - `/assets/index-*.js` - should load (200)
     - If any 404s, that's the problem

## Next Fix:

If API routes can't access backend, we need to:
1. Copy `geminiService.ts` into `api/` folder
2. Or restructure to have shared code accessible

Tell me what the build logs show!

