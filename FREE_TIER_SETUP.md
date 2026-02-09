# Free Tier Services Setup Guide

## All Services Are FREE (Within Limits)

---

## 1. Database: Supabase (You - Backend)

### Why Supabase?
- ✅ 500MB PostgreSQL database (FREE)
- ✅ Unlimited API requests (FREE)
- ✅ Built-in authentication (can use later)
- ✅ Real-time subscriptions (FREE)
- ✅ Auto-generated REST API

### Setup Steps:

1. **Sign up:** https://supabase.com
2. **Create new project:**
   - Project name: `voiceguard`
   - Database password: (save this!)
   - Region: Choose closest to you

3. **Get connection string:**
   - Go to Settings → Database
   - Copy "Connection string" (URI format)
   - Looks like: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`

4. **Install Supabase client:**
   ```bash
   npm install @supabase/supabase-js
   ```

5. **Use in backend:**
   ```javascript
   const { createClient } = require('@supabase/supabase-js')
   
   const supabase = createClient(
     process.env.SUPABASE_URL,
     process.env.SUPABASE_KEY
   )
   
   // Example: Insert enrolled member
   const { data, error } = await supabase
     .from('enrolled_members')
     .insert({ name: 'Mom', voice_prints: '...' })
   ```

**Free Tier Limits:**
- 500MB database storage
- Unlimited API requests
- 2GB bandwidth/month
- **Cost: $0/month**

---

## 2. Backend Hosting: Railway or Render (You - Backend)

### Option A: Railway.app

1. **Sign up:** https://railway.app (use GitHub login)
2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your `voiceguard` repo
   - Select `backend/` folder

3. **Add environment variables:**
   - `DATABASE_URL` (from Supabase)
   - `JWT_SECRET` (generate random string)
   - `PORT` (usually 3000)

4. **Deploy:**
   - Railway auto-deploys on push to main
   - Get URL: `https://your-app.railway.app`

**Free Tier:**
- $5 credit/month (enough for small app)
- Auto-deploys from GitHub
- **Cost: $0/month** (within credit)

### Option B: Render.com

1. **Sign up:** https://render.com
2. **Create Web Service:**
   - Connect GitHub repo
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && node server.js`
   - Add environment variables

**Free Tier:**
- 750 hours/month (enough for 24/7)
- Auto-deploys from GitHub
- **Cost: $0/month**

---

## 3. Frontend Hosting: Vercel or Netlify (Elliot - Frontend)

### Option A: Vercel (Recommended)

1. **Sign up:** https://vercel.com (use GitHub login)
2. **Import project:**
   - Click "Add New Project"
   - Import `voiceguard` repo
   - Framework: Vite
   - Root directory: `.` (root)
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Add environment variables:**
   - `VITE_API_URL` = Your backend URL (from Railway/Render)

4. **Deploy:**
   - Auto-deploys on push to main
   - Get URL: `https://voiceguard.vercel.app`

**Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- **Cost: $0/month**

### Option B: Netlify

1. **Sign up:** https://netlify.com
2. **Add new site from Git:**
   - Connect GitHub repo
   - Build command: `npm run build`
   - Publish directory: `dist`

**Free Tier:**
- 100GB bandwidth/month
- **Cost: $0/month**

---

## 4. ML Service: Deepgram (Juan - ML Integration)

### Why Deepgram?
- ✅ **12,000 minutes/month FREE** (best free tier)
- ✅ Real-time transcription
- ✅ Speaker diarization (identify different speakers)
- ✅ Good accuracy

### Setup Steps:

1. **Sign up:** https://deepgram.com
2. **Get API key:**
   - Go to API Keys
   - Create new key
   - Copy the key (starts with your project ID)

3. **Install SDK:**
   ```bash
   npm install @deepgram/sdk
   ```

4. **Use in frontend or backend:**
   ```typescript
   import { createClient } from '@deepgram/sdk'
   
   const deepgram = createClient(process.env.VITE_DEEPGRAM_API_KEY!)
   
   // Transcribe audio
   const response = await deepgram.listen.prerecorded.transcribeFile(
     audioBlob,
     {
       model: 'nova-2',
       language: 'en-US',
       punctuate: true,
       diarize: true, // Identify speakers
     }
   )
   
   // Extract voice features from response
   const confidence = response.result.confidence
   ```

**Free Tier Limits:**
- 12,000 minutes/month (200 hours!)
- **Cost: $0/month** (within limit)

### Alternative: AssemblyAI (If Deepgram doesn't work)

1. **Sign up:** https://assemblyai.com
2. **Get API key**
3. **Free tier:** 5 hours/month

---

## 5. Environment Variables Setup

### Backend `.env` (You):
```bash
# Database
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx

# Auth
JWT_SECRET=your-random-secret-key-here

# Port
PORT=3000
```

### Frontend `.env` (Elliot):
```bash
# Backend API URL
VITE_API_URL=https://your-backend.railway.app

# ML Service (if used in frontend)
VITE_DEEPGRAM_API_KEY=xxx
```

### Add to `.gitignore`:
```
.env
.env.local
.env.production
```

---

## Complete Free Stack Summary

| Service | Provider | Free Tier | Assigned To |
|---------|----------|-----------|-------------|
| **Database** | Supabase | 500MB, unlimited API | You |
| **Backend Hosting** | Railway/Render | $5 credit / 750 hrs | You |
| **Frontend Hosting** | Vercel/Netlify | Unlimited | Elliot |
| **ML Service** | Deepgram | 12,000 min/month | Juan |
| **Total Cost** | | | **$0/month** |

---

## Setup Checklist

### You (Backend):
- [ ] Sign up for Supabase
- [ ] Create database project
- [ ] Get connection string
- [ ] Sign up for Railway or Render
- [ ] Connect GitHub repo
- [ ] Add environment variables
- [ ] Deploy backend

### Elliot (Frontend):
- [ ] Sign up for Vercel or Netlify
- [ ] Connect GitHub repo
- [ ] Add environment variables
- [ ] Deploy frontend

### Juan (ML):
- [ ] Sign up for Deepgram
- [ ] Get API key
- [ ] Test API with sample audio
- [ ] Integrate into code

---

## Monitoring Usage

### Check Free Tier Limits:

- **Supabase:** Dashboard → Settings → Usage
- **Railway:** Dashboard → Usage
- **Vercel:** Dashboard → Usage
- **Deepgram:** Dashboard → Usage

**Set up alerts** if you're approaching limits!

---

## What Happens If You Exceed Free Tier?

1. **Supabase:** Database becomes read-only (upgrade needed)
2. **Railway:** Service pauses (can upgrade)
3. **Vercel:** Bandwidth throttled (can upgrade)
4. **Deepgram:** API calls rejected (can upgrade)

**Solution:** Monitor usage and stay within limits, or upgrade only what you need.

---

## Backup Plan (If Free Tiers Don't Work)

### Database Alternatives:
- **Neon.tech** - 512MB PostgreSQL (FREE)
- **PlanetScale** - 1 database, 1GB storage (FREE)
- **MongoDB Atlas** - 512MB (FREE)

### Hosting Alternatives:
- **Fly.io** - 3 shared VMs (FREE)
- **Heroku** - No free tier anymore (paid)

### ML Alternatives:
- **AssemblyAI** - 5 hours/month (FREE)
- **Azure Speech** - 5 hours/month (FREE)
- **Google Speech-to-Text** - 60 min/month (FREE)

---

**All services are FREE for MVP!** 🎉
