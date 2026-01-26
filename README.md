# voiceguard

**VoiceGuard** is an AI-powered voice authentication app that protects families from AI voice cloning scams by verifying caller identity in real-time and forcing suspicious callers to answer security questions only family members would know.

## Problem

Scammers use AI voice cloning to impersonate family members and phish money from vulnerable people. Synthetic voices can sound nearly identical to real family members, even replicating emotional cues like crying. Victims often lose thousands of dollars before realizing they’ve been scammed.

## Solution

VoiceGuard uses:

- **Real-time voice analysis** – Compares live caller audio to enrolled voice prints
- **Biometric voice enrollment** – Records and stores voice samples per family member
- **Security question verification** – When the voice doesn’t match, the caller must answer questions only your family would know
- **AI-clone detection heuristics** – Flags synthetic or atypical voice characteristics

## Run the app

Requirements: **Node.js 18+**, npm.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command     | Description                |
|------------|----------------------------|
| `npm run dev`   | Start dev server            |
| `npm run build` | Production build            |
| `npm run preview` | Preview production build |
| `npm run lint`   | Run ESLint                |

## Flow

1. **Enroll** – Add a family member: name, 3 voice samples, and 2+ security Q&A.
2. **Call** – Simulate an incoming call, pick the claimed caller, then **Answer & analyze** to record and compare their voice.
3. **Verified** – Voice matches the enrolled print → low suspicion.
4. **Suspicious** – Voice doesn’t match or shows synthetic indicators → **Security challenge**: answer the questions you set. Fail → treat as potential impersonation; pass → proceed with caution.

## Tech

- React 18, TypeScript, Vite
- Web Audio API + `MediaRecorder` for recording and basic voice features (RMS, spectral centroid, zero-crossing rate)
- `localStorage` for enrolled members and voice prints
- `react-router-dom` for routing

## License

MIT
