# Pre-Saturday Checklist: Mic Fix + Merge for Demo

## 1. Mic fix (already in code)

**File:** `src/hooks/useVoiceRecorder.ts`

**What was fixed:**
- Release mic stream when user leaves the page (unmount)
- Release any previous stream before requesting mic again
- Clear refs after stop so browser doesn’t keep mic locked
- Use `{ audio: true }` instead of strict sample rate (avoids “works once then stops”)
- Always close `AudioContext` in a `finally` block

**So Juan (and everyone) can test recording with no mic lock-up.**

---

## 2. Get the mic fix onto the branch you’ll test from

The fix is currently in **`feature/backend-api`**. Do one of the following.

### Option A: Commit and push the fix (you do this)

On your machine, on the branch that has the fix (e.g. `feature/backend-api`):

```bash
cd c:\VoiceGuard
git status
git add src/hooks/useVoiceRecorder.ts
git commit -m "Fix mic: release stream on unmount and stop, avoid lock-up"
git push origin feature/backend-api
```

Then either:
- Merge **`feature/backend-api`** into **`feature/frontend-juan`** (so Juan’s branch has backend + mic fix), and everyone tests from **`feature/frontend-juan`**,  
**or**
- Merge **`feature/frontend-juan`** into **`feature/backend-api`**, and everyone tests from **`feature/backend-api`**.

### Option B: Juan pulls the fix

If the fix is only on **`feature/backend-api`**, Juan can get it by merging your branch into his:

```bash
cd c:\VoiceGuard
git checkout feature/frontend-juan
git pull origin feature/frontend-juan
git merge feature/backend-api
# Fix any conflicts, then:
git push origin feature/frontend-juan
```

After that, **`feature/frontend-juan`** has backend + frontend + mic fix.

---

## 3. Put everything in one branch for Saturday

**Goal:** One branch (e.g. **`my-changes`**) with backend + frontend + mic fix so you can run and present from it.

**Order that usually works:**

1. **Merge backend into frontend (or the other way), then merge that into `my-changes`.**

   **Path 1 – use Juan’s branch as the “full” branch:**
   ```bash
   git checkout feature/frontend-juan
   git pull origin feature/frontend-juan
   git merge feature/backend-api
   # Resolve conflicts if any, then:
   git push origin feature/frontend-juan

   git checkout my-changes
   git pull origin my-changes
   git merge feature/frontend-juan
   # Resolve conflicts if any, then:
   git push origin my-changes
   ```

   **Path 2 – use your branch as the “full” branch:**
   ```bash
   git checkout feature/backend-api
   git pull origin feature/backend-api
   git merge feature/frontend-juan
   # Resolve conflicts if any, then:
   git push origin feature/backend-api

   git checkout my-changes
   git pull origin my-changes
   git merge feature/backend-api
   # Resolve conflicts if any, then:
   git push origin my-changes
   ```

2. **Test from `my-changes`:**
   ```bash
   git checkout my-changes
   git pull origin my-changes
   cd backend && npm install && npm run dev
   # In another terminal:
   cd c:\VoiceGuard && npm run dev
   ```
   - Open the app (e.g. http://localhost:5173)
   - Test: Register/Login → Enroll (record 2–3 samples) → Call flow → Mic should work every time

3. **Saturday:** Present from **`my-changes`** (or whatever branch you chose in step 1). Everyone uses that branch and the same `.env` (or same backend URL) so the app runs smoothly.

---

## 4. Quick reference

| Step | Who | What |
|------|-----|------|
| 1 | You | Commit & push mic fix on `feature/backend-api` |
| 2 | You or Juan | Merge `feature/backend-api` and `feature/frontend-juan` so one branch has everything |
| 3 | You | Merge that branch into `my-changes` |
| 4 | Everyone | Test from `my-changes`: backend + frontend, mic works |
| 5 | Saturday | Demo from `my-changes` |

---

## 5. If Juan still has mic issues after the fix

- Use **Chrome** or **Edge** (best support for `getUserMedia`).
- Use **https** or **localhost** (required for mic in most browsers).
- Hard refresh after pulling: **Ctrl+Shift+R** (or close tab and reopen).
- In browser settings, ensure the site is **allowed** to use the microphone and try “Clear data” for the site if it was previously blocked.
