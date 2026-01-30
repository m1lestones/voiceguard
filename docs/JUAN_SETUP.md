# Juan's Setup – Run the Full App on Your Laptop

Follow these steps to run VoiceGuard (backend + frontend) on your machine.

---

## 1. Get the code

Use the branch that has **everything** (backend + frontend + mic fix). After the merge, that might be `feature/frontend-juan` or `my-changes`. Ask the team which branch to use.

```bash
cd c:\VoiceGuard
git fetch origin
git checkout <branch-name>   # e.g. feature/frontend-juan or my-changes
git pull origin <branch-name>
```

---

## 2. Get the backend `.env` values

You **cannot** run the backend without these. Your teammate will share them with you **securely** (e.g. in person, secure chat, or password manager – **not** in GitHub or email):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`

They’ll show you their `backend/.env` or send you the three values. You’ll put them in **your own** `backend/.env` file in step 4.

---

## 3. Install dependencies

**Backend:**
```bash
cd c:\VoiceGuard\backend
npm install
```

**Frontend (from project root):**
```bash
cd c:\VoiceGuard
npm install
```

---

## 4. Create `backend/.env`

1. In the `backend` folder, copy the example file:
   ```bash
   cd c:\VoiceGuard\backend
   copy .env.example .env
   ```
2. Open `backend/.env` in your editor.
3. Fill in the three values your teammate shared:
   - `SUPABASE_URL=https://xxxxx.supabase.co`
   - `SUPABASE_SERVICE_KEY=eyJ...`
   - `JWT_SECRET=your-jwt-secret`
4. Save the file. **Do not commit `.env`** – it stays only on your laptop.

---

## 5. Run the app

**Terminal 1 – Backend:**
```bash
cd c:\VoiceGuard\backend
npm run dev
```
Leave this running. You should see: `VoiceGuard API running on http://localhost:3000`

**Terminal 2 – Frontend:**
```bash
cd c:\VoiceGuard
npm run dev
```
Leave this running. You should see something like: `Local: http://localhost:5173/`

**Browser:** Open **http://localhost:5173** (or the URL shown in Terminal 2).

---

## 6. Test

- Register → Login → Enroll (record 2–3 voice samples) → Simulate call.
- Mic should work every time (if not, hard refresh or try Chrome/Edge).

---

## Quick checklist

- [ ] Pulled the right branch (backend + frontend merged)
- [ ] Got `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET` from teammate
- [ ] Created `backend/.env` with those three values
- [ ] Ran `npm install` in `backend` and in project root
- [ ] Started backend (Terminal 1), then frontend (Terminal 2)
- [ ] Opened the app in the browser and tested

---

**If something fails:** Check that the backend is running on `http://localhost:3000` and that your `.env` has no typos or extra spaces. Ask the team if you’re stuck.
