# Juan's Frontend Tasks (Now That Backend Is Done)

Backend is on **`feature/backend-api`**. API base URL: **`http://localhost:3000`** (when backend is running).

---

## 1. Get the backend branch

Juan should base his work on the branch that has the backend (so he can call the API):

```bash
cd c:\VoiceGuard
git fetch origin
git checkout feature/backend-api
git pull origin feature/backend-api
```

Then create his own branch for frontend work (optional but good):

```bash
git checkout -b feature/frontend-api
```

---

## 2. Create the API client (`src/lib/api.ts`)

Create a file that talks to the backend instead of localStorage.

- **Base URL:** `http://localhost:3000` (or `import.meta.env.VITE_API_URL` if you set it in `.env`).
- **Auth:** After login/register, store the **token** (e.g. in `localStorage` or React state). On every request to `/api/members`, send header: `Authorization: Bearer <token>`.

**Endpoints to use:**

| What frontend does now | Replace with |
|------------------------|--------------|
| `getEnrolled()`        | `GET /api/members` (with Bearer token) |
| `addEnrolled(member)` | `POST /api/members` (body: `{ name, voicePrints, securityQuestions }`) |
| `removeEnrolled(id)`  | `DELETE /api/members/:id` |
| `getEnrolledById(id)` | `GET /api/members/:id` |

**Auth endpoints (new):**

- `POST /api/auth/register` — body: `{ email, password }` → returns `{ token, user }`
- `POST /api/auth/login` — body: `{ email, password }` → returns `{ token, user }`

So Juan needs to:

1. Add **`src/lib/api.ts`** with functions like:
   - `register(email, password)`
   - `login(email, password)`
   - `getMembers()` (uses token)
   - `addMember(member)` (uses token)
   - `getMemberById(id)` (uses token)
   - `removeMember(id)` (uses token)
2. Store the **token** after login/register (e.g. `localStorage.setItem('token', token)`).
3. In every members API call, send **`Authorization: Bearer <token>`**.

---

## 3. Add Login and Register pages

- **`src/pages/Login.tsx`** — form: email, password. On submit call `login()`, store token, redirect to Home.
- **`src/pages/Register.tsx`** — form: email, password. On submit call `register()`, store token, redirect to Home.

Add routes in `App.tsx`:

- `/login` → Login page  
- `/register` → Register page  

(And optionally redirect `/` to `/login` if there’s no token.)

---

## 4. Replace localStorage with API calls

Right now the app uses **`src/lib/storage.ts`** (getEnrolled, addEnrolled, etc.) which reads/writes localStorage.

Juan should:

1. **Stop using `storage.ts`** for members (and auth).
2. In **Enroll**, **Call**, **Home** (and anywhere else that uses `getEnrolled` / `addEnrolled` / `removeEnrolled` / `getEnrolledById`), call the **new API functions** from `src/lib/api.ts` instead.
3. Handle **loading** (e.g. show “Loading…”) and **errors** (e.g. “Failed to load members”, “Unauthorized” → redirect to login).

So:

- **Home:** load members with `getMembers()` (and show list).
- **Enroll:** on save, call `addMember(...)` instead of `addEnrolled(...)`.
- **Call:** load members with `getMembers()`; no change to detection/challenge flow, just where the list comes from.
- **SecurityChallenge:** can keep using the member passed via route state; no API change needed there.

---

## 5. Optional: protect routes

If the user is not logged in (no token), redirect to `/login` for routes that need the API (e.g. Home, Enroll, Call).  
Can be a small wrapper component or a check in each page; either way, if no token → redirect to `/login`.

---

## 6. Run backend + frontend together

- **Terminal 1:** Backend  
  ```bash
  cd c:\VoiceGuard\backend
  npm run dev
  ```
  (So `http://localhost:3000` is up.)

- **Terminal 2:** Frontend  
  ```bash
  cd c:\VoiceGuard
  npm run dev
  ```
  (So e.g. `http://localhost:5173` is up.)

Frontend should call `http://localhost:3000` for API. If you use a different port for the backend, set **`VITE_API_URL`** in the frontend `.env` (e.g. `VITE_API_URL=http://localhost:3000`).

---

## Summary checklist for Juan

- [ ] Work from branch that has backend (`feature/backend-api` or his own branch from it).
- [ ] Create `src/lib/api.ts` (register, login, getMembers, addMember, getMemberById, removeMember) with Bearer token.
- [ ] Add Login and Register pages and routes.
- [ ] Replace all `storage.ts` usage (getEnrolled, addEnrolled, etc.) with API calls from `api.ts`.
- [ ] Add loading and error handling.
- [ ] (Optional) Protect routes so unauthenticated users go to login.
- [ ] Test: register → login → add member → see members on Home → run Call flow.

When Juan is ready to run the frontend against the real API, he’ll need the **backend `.env`** (or Supabase URL + service key + JWT secret) to run the backend himself, or use a backend you’re running and just point the frontend at it.
