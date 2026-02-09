import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' })
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration', message: 'JWT_SECRET not set' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' })
  }
}
