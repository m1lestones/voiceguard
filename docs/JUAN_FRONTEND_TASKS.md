# Juan's Frontend Tasks (Now That Backend Is Done)

Backend is on **`feature/backend-api`** and lives in `apps/api`. By default it runs on **`http://localhost:8080`** (or `process.env.PORT`).

---

## 1. Get the backend branch

Juan should base his work on the branch that has the backend (so he can call the API):

```bash
git fetch origin
git checkout feature/backend-api
git pull origin feature/backend-api
```

Then create his own branch for frontend work (optional but good):

```bash
git checkout -b feature/frontend-juan
```

---

## 2. Create the API client (`src/lib/api.ts`)

Create a file that talks to the backend instead of localStorage.

- **Base URL:** `http://localhost:8080` (or `import.meta.env.VITE_API_URL` if you set it in `.env`).

**Endpoints to use:**

| What frontend does now | Replace with |
|------------------------|--------------|
| `getEnrolled()`        | `GET /enrollments` |
| `addEnrolled(member)` | `POST /enrollments` |
| *(call analysis)*      | `POST /calls/analyze` |
| *(report scam)*        | `POST /scams/report` |

Notes:
- The current backend on `feature/backend-api` is a lightweight in-memory API for local dev (no auth yet).
- `POST /enrollments` expects a payload like: `{ familyMemberName, relationship?, phoneNumber?, voiceSample? }`.

---

## 3. Add Login and Register pages

Optional for later: the current backend branch does **not** include auth endpoints. If/when auth is added, we can add `/login` and `/register` pages and protect routes.

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

Optional for later: once auth exists, redirect unauthenticated users to `/login`.

If the user is not logged in (no token), redirect to `/login` for routes that need the API (e.g. Home, Enroll, Call).  
Can be a small wrapper component or a check in each page; either way, if no token → redirect to `/login`.

---

## 6. Run backend + frontend together

- **Terminal 1:** Backend  
  ```bash
  cd apps/api
  npm install
  npm run dev
  ```
  (So `http://localhost:8080` is up by default.)

- **Terminal 2:** Frontend  
  ```bash
  npm install
  npm run dev
  ```
  (So e.g. `http://localhost:5173` is up.)

Frontend should call `http://localhost:8080` for API. If you use a different port for the backend, set **`VITE_API_URL`** in the frontend `.env` (e.g. `VITE_API_URL=http://localhost:8080`).

---

## Summary checklist for Juan

- [ ] Work from branch that has backend (`feature/backend-api`) or ensure the API is running locally.
- [ ] Create `src/lib/api.ts` (getEnrollments, createEnrollment, analyzeCall, reportScam).
- [ ] Replace all `storage.ts` usage (getEnrolled, addEnrolled, etc.) with API calls from `api.ts`.
- [ ] Add loading and error handling.
- [ ] Test: add enrollment → see enrollments on Home → run Call flow.

When auth is added to the API, update this checklist to include login/register + protected routes.
