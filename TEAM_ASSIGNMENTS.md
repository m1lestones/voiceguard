# VoiceGuard Team Assignments (3-Person Team)

## Team Members
- **You** (Team Lead)
- **Elliot**
- **Juan**

## Work Split Strategy

### Phase 1: MVP Foundation (Week 1-2)

---

## 👤 Ibrahima ASSIGNMENT: Backend Infrastructure & API

### Tasks:
1. **Set up Backend Server** (2-3 days)
   - Create `backend/` folder
   - Set up Express.js server
   - Configure CORS, middleware
   - Create basic API structure

2. **Database Setup** (1-2 days)
   - Use **Supabase** (free tier: 500MB database, unlimited API requests)
   - OR **Railway** (free tier: $5 credit/month)
   - OR **Neon** (free tier: 512MB PostgreSQL)
   - Set up database schema
   - Create migration scripts

3. **API Endpoints** (2-3 days)
   - `POST /api/enroll` - Store voice prints
   - `POST /api/verify` - Verify voice
   - `GET /api/members` - List enrolled members
   - `DELETE /api/members/:id` - Remove member
   - Error handling & validation

4. **Authentication System** (2 days)
   - JWT token generation
   - Login/Register endpoints
   - Password hashing (bcrypt)
   - Auth middleware

**Deliverables:**
- Working backend server on `localhost:3000`
- Database connected and schema created
- All API endpoints tested with Postman/Thunder Client
- Authentication working

**Files to Create:**
```
backend/
  ├── server.js (or index.js)
  ├── routes/
  │   ├── auth.js
  │   ├── members.js
  │   └── verify.js
  ├── middleware/
  │   └── auth.js
  ├── db/
  │   └── schema.sql (or Prisma schema)
  └── package.json
```

**Free Services:**
- **Database:** Supabase (PostgreSQL) - FREE
- **Hosting:** Railway.app or Render.com - FREE tier
- **No ML service needed yet** - use placeholder

---

## 👤 Juan'S ASSIGNMENT: Frontend Integration & UI/UX

### Tasks:
1. **Connect Frontend to Backend** (2 days)
   - Create `src/lib/api.ts` with API calls
   - Replace localStorage with API calls
   - Update all pages to use API
   - Add loading states

2. **User Authentication UI** (2 days)
   - Create Login page (`src/pages/Login.tsx`)
   - Create Register page (`src/pages/Register.tsx`)
   - Add auth context/provider
   - Protected routes
   - Logout functionality

3. **Error Handling & Feedback** (1-2 days)
   - Error boundaries
   - Toast notifications (use `react-hot-toast` or similar)
   - Loading spinners
   - Form validation messages

4. **UI/UX Improvements** (2-3 days)
   - Better styling & responsive design
   - Mobile-friendly layout
   - Accessibility improvements
   - Loading states on all actions
   - Success/error messages

**Deliverables:**
- Frontend fully connected to backend API
- Login/Register pages working
- All pages use API instead of localStorage
- Better error handling and user feedback
- Improved UI/UX

**Files to Modify/Create:**
```
src/
  ├── lib/
  │   └── api.ts (NEW)
  ├── pages/
  │   ├── Login.tsx (NEW)
  │   ├── Register.tsx (NEW)
  │   ├── Enroll.tsx (MODIFY - use API)
  │   ├── Call.tsx (MODIFY - use API)
  │   └── Home.tsx (MODIFY - use API)
  ├── context/
  │   └── AuthContext.tsx (NEW)
  └── components/
      └── Toast.tsx (NEW - optional)
```

**Free Services:**
- **Frontend Hosting:** Vercel or Netlify - FREE
- **No external dependencies needed**

---

## 👤 Elliot'S ASSIGNMENT: Voice Analysis & ML Integration

### Tasks:
1. **Research Free ML Services** (1 day)
   - Find free-tier voice recognition APIs
   - Options:
     - **AssemblyAI** (free tier: 5 hours/month)
     - **Deepgram** (free tier: 12,000 min/month)
     - **OpenAI Whisper API** (pay-as-you-go, very cheap)
     - **Google Speech-to-Text** (free tier: 60 min/month)
     - **Azure Speech** (free tier: 5 hours/month)

2. **Implement Voice Analysis** (3-4 days)
   - Integrate chosen ML service
   - Replace basic heuristics in `src/lib/detection.ts`
   - Create voice comparison logic
   - Add confidence scoring
   - Handle API errors gracefully

3. **Improve Voice Recording** (1-2 days)
   - Better audio quality handling
   - Noise reduction (if possible)
   - Audio format conversion for API
   - Better error messages for mic issues

4. **Testing & Optimization** (1-2 days)
   - Test with real voice samples
   - Compare accuracy vs old heuristics
   - Optimize API calls (caching, batching)
   - Document API usage limits

**Deliverables:**
- Working ML integration (free tier)
- Improved voice detection accuracy
- Better audio processing
- Documentation on ML service usage

**Files to Modify/Create:**
```
src/
  ├── lib/
  │   ├── detection.ts (MODIFY - add ML)
  │   └── ml-service.ts (NEW - ML API wrapper)
  └── hooks/
      └── useVoiceRecorder.ts (IMPROVE)
```

**Free Services:**
- **AssemblyAI** - 5 hours/month FREE
- **Deepgram** - 12,000 min/month FREE
- **Azure Speech** - 5 hours/month FREE

**Recommendation:** Start with **Deepgram** (most generous free tier)

---

## Week-by-Week Breakdown

### Week 1: Foundation
- **You:** Backend setup + Database + Basic API endpoints
- **Elliot:** API integration in frontend + Auth UI
- **Juan:** Research ML services + Start integration

### Week 2: Core Features
- **You:** Complete API + Authentication backend
- **Elliot:** Complete frontend integration + Error handling
- **Juan:** Complete ML integration + Testing

### Week 3: Polish & Testing
- **You:** API testing + Documentation
- **Elliot:** UI/UX polish + Responsive design
- **Juan:** Voice analysis optimization + Accuracy testing

---

## Communication & Coordination

### Daily Standups (15 min)
- What did you complete yesterday?
- What are you working on today?
- Any blockers?

### Shared Resources
- **GitHub Repository:** Main branch for production-ready code
- **Feature Branches:** Each person works on their own branch
- **Discord/Slack:** For quick questions
- **Shared Docs:** Use GitHub Issues or Notion

### Git Workflow
```
main (protected)
  ├── feature/backend-api (You)
  ├── feature/frontend-api (Elliot)
  └── feature/ml-integration (Juan)
```

---

## Dependencies Between Tasks

### Critical Path:
1. **You** must finish backend API first (Elliot needs it)
2. **Elliot** can start on UI while waiting, but needs API for full integration
3. **Juan** can work independently on ML research/integration

### Integration Points:
- **Day 3-4:** You shares API endpoints with Elliot
- **Day 5-6:** Elliot integrates frontend with backend
- **Day 7-8:** Juan integrates ML service
- **Day 9-10:** Full integration testing together

---

## Free Tier Services Summary

### Backend (You):
- **Database:** Supabase (PostgreSQL) - FREE
- **Hosting:** Railway.app or Render.com - FREE tier
- **Total Cost:** $0

### Frontend (Elliot):
- **Hosting:** Vercel or Netlify - FREE
- **Total Cost:** $0

### ML Service (Juan):
- **Deepgram:** 12,000 min/month FREE (best option)
- **OR AssemblyAI:** 5 hours/month FREE
- **OR Azure Speech:** 5 hours/month FREE
- **Total Cost:** $0 (within free tier limits)

### Total MVP Cost: **$0/month**

---

## Success Criteria for MVP

✅ Backend API running and accessible  
✅ Database storing voice prints securely  
✅ Frontend connected to backend  
✅ User can register/login  
✅ User can enroll family members  
✅ Voice analysis works (even if basic)  
✅ Security questions work  
✅ App deployed and accessible online  

---

## Next Steps After MVP

1. **Real Phone Integration** (Twilio - has free trial)
2. **Mobile App** (React Native)
3. **Advanced ML** (better models)
4. **Analytics Dashboard**

---

## Questions to Resolve Together

1. Which ML service to use? (Juan researches, team decides)
2. Which database provider? (You sets up, team approves)
3. Which hosting? (Team decides based on ease of use)
4. Branch naming convention? (e.g., `feature/your-name/task-name`)

---

**Start Date:** [Fill in]  
**MVP Target:** [2-3 weeks from start]
