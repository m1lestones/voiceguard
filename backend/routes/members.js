import { Router } from 'express'
import { supabase } from '../config/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// All routes require auth
router.use(authenticate)

// GET /api/members - list all enrolled members for the current user
router.get('/', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' })
    }

    const { data, error } = await supabase
      .from('enrolled_members')
      .select('id, name, voice_prints, security_questions, enrolled_at')
      .eq('user_id', req.user.id)
      .order('enrolled_at', { ascending: false })

    if (error) throw error

    const members = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      voicePrints: row.voice_prints ?? [],
      securityQuestions: row.security_questions ?? [],
      enrolledAt: row.enrolled_at,
    }))
    res.json(members)
  } catch (err) {
    console.error('GET /api/members error:', err)
    res.status(500).json({ error: 'Failed to fetch members' })
  }
})

// GET /api/members/:id - get one member
router.get('/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' })
    }

    const { data, error } = await supabase
      .from('enrolled_members')
      .select('id, name, voice_prints, security_questions, enrolled_at')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Member not found' })
    }

    res.json({
      id: data.id,
      name: data.name,
      voicePrints: data.voice_prints ?? [],
      securityQuestions: data.security_questions ?? [],
      enrolledAt: data.enrolled_at,
    })
  } catch (err) {
    console.error('GET /api/members/:id error:', err)
    res.status(500).json({ error: 'Failed to fetch member' })
  }
})

// POST /api/members - create enrolled member
router.post('/', async (req, res) => {
  try {
    const { name, voicePrints, securityQuestions } = req.body
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' })
    }

    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' })
    }

    const { data, error } = await supabase
      .from('enrolled_members')
      .insert({
        user_id: req.user.id,
        name: name.trim(),
        voice_prints: Array.isArray(voicePrints) ? voicePrints : [],
        security_questions: Array.isArray(securityQuestions) ? securityQuestions : [],
      })
      .select('id, name, voice_prints, security_questions, enrolled_at')
      .single()

    if (error) throw error

    res.status(201).json({
      id: data.id,
      name: data.name,
      voicePrints: data.voice_prints ?? [],
      securityQuestions: data.security_questions ?? [],
      enrolledAt: data.enrolled_at,
    })
  } catch (err) {
    console.error('POST /api/members error:', err)
    res.status(500).json({ error: 'Failed to create member' })
  }
})

// DELETE /api/members/:id
router.delete('/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' })
    }

    const { error } = await supabase
      .from('enrolled_members')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)

    if (error) throw error
    res.status(204).send()
  } catch (err) {
    console.error('DELETE /api/members/:id error:', err)
    res.status(500).json({ error: 'Failed to delete member' })
  }
})

export default router
