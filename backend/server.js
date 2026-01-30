import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import membersRoutes from './routes/members.js'
import callsRoutes from './routes/calls.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: true }))
app.use(express.json({ limit: '10mb' }))

// Health check (no auth)
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'VoiceGuard API' })
})

// Auth: register & login
app.use('/api/auth', authRoutes)

// Members: CRUD (requires JWT)
app.use('/api/members', membersRoutes)

// Call analysis (requires JWT)
app.use('/api/calls', callsRoutes)

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`VoiceGuard API running on http://localhost:${PORT}`)
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.warn('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env')
  }
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET not set. Auth will not work.')
  }
})
