import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

// POST /api/calls/analyze - stub for frontend; returns analysis result
router.post('/analyze', (req, res) => {
  res.json({
    ok: true,
    result: {
      status: 'GREEN',
      matchScore: 0,
      syntheticProbability: 0,
      message: 'Analysis recorded',
    },
  })
})

export default router
