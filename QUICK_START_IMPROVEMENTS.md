# Quick Start: Critical Improvements

## 1. Replace Basic Voice Detection with Real ML (2-3 days)

### Option A: Azure Speaker Recognition (Recommended)

```bash
npm install @azure/cognitiveservices-speakeridentification
```

**Update `src/lib/detection.ts`:**
```typescript
import { SpeakerIdentificationClient } from '@azure/cognitiveservices-speakeridentification'

const client = new SpeakerIdentificationClient(
  process.env.VITE_AZURE_ENDPOINT!,
  new AzureKeyCredential(process.env.VITE_AZURE_KEY!)
)

export async function verifyVoiceWithML(
  audioBlob: Blob,
  enrolledProfileId: string
): Promise<{ verified: boolean; confidence: number; isClone: boolean }> {
  // Convert blob to format Azure expects
  const audioBuffer = await audioBlob.arrayBuffer()
  
  // Call Azure API
  const result = await client.identifySpeaker(audioBuffer, [enrolledProfileId])
  
  return {
    verified: result.confidence > 0.7,
    confidence: result.confidence,
    isClone: result.confidence < 0.5 // Low confidence = likely clone
  }
}
```

### Option B: Deepgram (Easier setup)

```bash
npm install @deepgram/sdk
```

**Update `src/lib/detection.ts`:**
```typescript
import { createClient } from '@deepgram/sdk'

const deepgram = createClient(process.env.VITE_DEEPGRAM_API_KEY!)

export async function verifyVoiceWithML(audioBlob: Blob, enrolledProfile: EnrolledMember) {
  const response = await deepgram.listen.prerecorded.transcribeFile(
    audioBlob,
    {
      model: 'nova-2',
      language: 'en-US',
      detect_language: true,
      smart_format: true,
    }
  )
  
  // Extract voice features and compare
  // Deepgram provides confidence scores
  return {
    verified: response.result.confidence > 0.8,
    confidence: response.result.confidence,
    isClone: false // Would need additional anti-spoofing
  }
}
```

## 2. Add Backend API (3-4 days)

### Create `backend/server.js`:

```javascript
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Enroll voice
app.post('/api/enroll', authenticate, async (req, res) => {
  const { name, voicePrints, securityQuestions } = req.body
  
  const member = await prisma.enrolledMember.create({
    data: {
      userId: req.user.id,
      name,
      voicePrints: JSON.stringify(voicePrints), // Encrypt in production
      securityQuestions: JSON.stringify(securityQuestions),
    }
  })
  
  res.json({ id: member.id, name: member.name })
})

// Verify voice
app.post('/api/verify', authenticate, async (req, res) => {
  const { memberId, audioBlob } = req.body
  
  const member = await prisma.enrolledMember.findUnique({
    where: { id: memberId, userId: req.user.id }
  })
  
  if (!member) return res.status(404).json({ error: 'Member not found' })
  
  // Call ML service here
  const verification = await verifyVoiceWithML(audioBlob, member)
  
  res.json(verification)
})

app.listen(3000, () => console.log('Backend running on :3000'))
```

### Update frontend to use API:

**`src/lib/api.ts`:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function enrollMember(data: EnrolledMember) {
  const res = await fetch(`${API_URL}/api/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function verifyVoice(memberId: string, audioBlob: Blob) {
  const formData = new FormData()
  formData.append('audio', audioBlob)
  formData.append('memberId', memberId)
  
  const res = await fetch(`${API_URL}/api/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  })
  return res.json()
}
```

## 3. Add User Authentication (2 days)

**Install:**
```bash
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

**Add login/register endpoints:**
```javascript
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body
  const hashed = await bcrypt.hash(password, 10)
  
  const user = await prisma.user.create({
    data: { email, password: hashed }
  })
  
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
  res.json({ token })
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
  res.json({ token })
})
```

**Add login page:**
```typescript
// src/pages/Login.tsx
export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const { token } = await res.json()
    localStorage.setItem('token', token)
    // Redirect to home
  }
  
  return (/* login form */)
}
```

## 4. Add Real Phone Integration (3-4 days)

### Twilio Setup:

```bash
npm install twilio
```

**Backend webhook:**
```javascript
const twilio = require('twilio')
const VoiceResponse = twilio.twiml.VoiceResponse

app.post('/twilio/incoming', async (req, res) => {
  const response = new VoiceResponse()
  const callerId = req.body.From
  
  // Check if caller is enrolled
  const member = await findMemberByPhone(callerId)
  
  if (member) {
    // Start recording
    response.say('Please say your name')
    response.record({
      action: '/twilio/analyze',
      method: 'POST',
      maxLength: 5
    })
  } else {
    response.say('Caller not recognized')
    response.hangup()
  }
  
  res.type('text/xml')
  res.send(response.toString())
})

app.post('/twilio/analyze', async (req, res) => {
  const recordingUrl = req.body.RecordingUrl
  const callerId = req.body.From
  
  // Download recording
  const audio = await downloadRecording(recordingUrl)
  
  // Analyze with ML
  const result = await verifyVoiceWithML(audio, callerId)
  
  if (result.verified) {
    // Connect call
    const response = new VoiceResponse()
    response.dial(req.body.To)
    res.type('text/xml')
    res.send(response.toString())
  } else {
    // Challenge with security questions
    const response = new VoiceResponse()
    response.say('Please answer your security question')
    response.gather({
      action: '/twilio/security-check',
      method: 'POST'
    })
    res.type('text/xml')
    res.send(response.toString())
  }
})
```

## 5. Environment Variables

Create `.env`:
```bash
# Backend
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost:5432/voiceguard

# ML Service
VITE_AZURE_ENDPOINT=https://your-region.api.cognitive.microsoft.com
VITE_AZURE_KEY=your-key

# Twilio
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend
VITE_API_URL=http://localhost:3000
```

## 6. Database Schema (Prisma)

**`prisma/schema.prisma`:**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  members   EnrolledMember[]
  createdAt DateTime @default(now())
}

model EnrolledMember {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  name              String
  phoneNumber       String?
  voicePrints       String   // JSON, encrypted
  securityQuestions String   // JSON, encrypted
  enrolledAt        DateTime @default(now())
}
```

## Priority Order

1. **Week 1:** Add backend API + database (remove localStorage dependency)
2. **Week 2:** Integrate real ML service (replace heuristics)
3. **Week 3:** Add user authentication
4. **Week 4:** Add Twilio integration (real phone calls)

This gets you to a functional MVP in ~1 month.
