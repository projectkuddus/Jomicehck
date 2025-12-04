# Step-by-Step Deployment to www.jomicheck.com

## Quick Start: Railway (Easiest - Recommended)

### Step 1: Deploy Backend

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the backend folder
5. **Set Environment Variables:**
   - `GEMINI_API_KEY` = your Gemini API key
   - `PORT` = 4000 (auto-set by Railway)
   - `NODE_ENV` = production
6. Railway will give you a URL like: `https://jomicheck-backend-production.up.railway.app`
7. Copy this URL - you'll need it for the frontend

### Step 2: Deploy Frontend

1. In Railway, click "New" → "GitHub Repo" again
2. Select the same repository
3. **Configure:**
   - Root Directory: `/` (root)
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 3000`
4. **Set Environment Variables:**
   - `VITE_API_BASE_URL` = your backend URL from Step 1 (e.g., `https://jomicheck-backend-production.up.railway.app`)
5. Railway will give you a frontend URL

### Step 3: Connect Domain

1. In Railway, go to your frontend service → Settings → Domains
2. Click "Custom Domain"
3. Enter: `www.jomicheck.com`
4. Railway will give you DNS records to add:
   - Go to your domain registrar (Namecheap, GoDaddy, etc.)
   - Add a CNAME record:
     - Name: `www`
     - Value: Railway's provided domain
5. Wait 5-10 minutes for DNS propagation
6. SSL certificate will be auto-generated

### Step 4: Update Frontend API URL

After connecting domain, update `VITE_API_BASE_URL` to use your backend's Railway URL (or set up a subdomain for API).

---

## Alternative: Vercel (Frontend) + Railway (Backend)

### Frontend on Vercel:

1. Go to [vercel.com](https://vercel.com) and sign up
2. Import your GitHub repository
3. **Settings:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables:**
   - `VITE_API_BASE_URL` = your backend URL
5. Deploy!
6. Add custom domain: `www.jomicheck.com` in Vercel dashboard

### Backend on Railway:
Follow Step 1 from Railway section above.

---

## Alternative: Render (Full-Stack)

1. Go to [render.com](https://render.com) and sign up
2. The `render.yaml` file is already configured
3. Connect your GitHub repo
4. Render will create both services automatically
5. Set environment variables in Render dashboard
6. Add custom domain in Render settings

---

## Alternative: Docker/VPS

If you have a VPS (DigitalOcean, AWS EC2, etc.):

```bash
# On your server
git clone your-repo
cd jomicheck.com

# Set environment variables
export GEMINI_API_KEY=your_key_here

# Run with Docker Compose
docker-compose up -d

# Or manually:
cd backend && npm install && npm run build && npm start
# In another terminal:
npm install && npm run build && npx serve -s dist
```

Then configure nginx/reverse proxy to point to your server IP.

---

## Environment Variables Checklist

### Backend (.env or platform dashboard):
- ✅ `GEMINI_API_KEY` - Your Google Gemini API key
- ✅ `PORT` - 4000 (or platform default)
- ✅ `NODE_ENV` - production

### Frontend (platform dashboard):
- ✅ `VITE_API_BASE_URL` - Your backend URL (e.g., `https://api.jomicheck.com` or Railway URL)

---

## Testing After Deployment

1. Visit `https://www.jomicheck.com`
2. Check browser console for errors
3. Test document upload
4. Test chat functionality
5. Check backend logs if issues occur

---

## Troubleshooting

**Frontend can't connect to backend:**
- Check `VITE_API_BASE_URL` is set correctly
- Verify backend is running and accessible
- Check CORS settings (if needed)

**Domain not working:**
- Wait 10-15 minutes for DNS propagation
- Check DNS records are correct
- Verify SSL certificate is issued

**Backend errors:**
- Check `GEMINI_API_KEY` is set correctly
- Check backend logs in platform dashboard
- Verify port is correct

---

## Need Help?

Tell me which platform you want to use, and I can provide more specific guidance!

