# Deployment Guide for www.jomicheck.com

This guide covers deploying both the frontend and backend to production.

## Architecture Overview

- **Frontend**: React + Vite (static site)
- **Backend**: Node.js + Express + TypeScript (API server)
- **Domain**: www.jomicheck.com

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)
- Frontend: Vercel (automatic deployments)
- Backend: Vercel Serverless Functions or Railway/Render

### Option 2: Railway (Full-Stack)
- Frontend + Backend: Both on Railway
- Simple, all-in-one solution

### Option 3: Render (Full-Stack)
- Frontend: Static Site
- Backend: Web Service
- Free tier available

### Option 4: Traditional VPS
- DigitalOcean, AWS EC2, Linode, etc.
- Full control, requires server management

## Required Environment Variables

### Frontend (.env.production)
```
VITE_API_BASE_URL=https://api.jomicheck.com
# Or use relative URLs if same domain
```

### Backend (.env)
```
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

## Domain Configuration

1. **DNS Settings** (at your domain registrar):
   - Point `www.jomicheck.com` to your frontend hosting
   - Point `api.jomicheck.com` (or subdomain) to your backend, OR
   - Use same domain with `/api` routes proxied

2. **SSL Certificate**: Most platforms provide free SSL (Let's Encrypt)

## Next Steps

Choose your deployment platform and I'll create the specific configuration files.

