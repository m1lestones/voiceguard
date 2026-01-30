# VoiceGuard Backend

Express API for VoiceGuard: auth + enrolled members (Supabase).

## Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In **SQL Editor**, run the script in `db/schema.sql`.
   - In **Settings → API**, copy:
     - Project URL → `SUPABASE_URL`
     - `service_role` key (secret) → `SUPABASE_SERVICE_KEY`

3. **Environment**
   ```bash
   cp .env.example .env
   # Edit .env and set:
   # SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, PORT
   ```
   Generate a JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Run**
   ```bash
   npm run dev
   ```
   API: `http://localhost:3000`

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/auth/register` | No | Register (email, password) |
| POST | `/api/auth/login` | No | Login (email, password) |
| GET | `/api/members` | Bearer | List enrolled members |
| GET | `/api/members/:id` | Bearer | Get one member |
| POST | `/api/members` | Bearer | Create member |
| DELETE | `/api/members/:id` | Bearer | Delete member |

## Auth

- **Register:** `POST /api/auth/register` body `{ "email": "...", "password": "..." }` → returns `{ token, user }`.
- **Login:** `POST /api/auth/login` body `{ "email": "...", "password": "..." }` → returns `{ token, user }`.
- **Protected routes:** Header `Authorization: Bearer <token>`.

## Member payload (POST /api/members)

```json
{
  "name": "Mom",
  "voicePrints": [...],
  "securityQuestions": [{ "question": "...", "answer": "..." }]
}
```

Response shape matches frontend `EnrolledMember` (id, name, voicePrints, securityQuestions, enrolledAt).
