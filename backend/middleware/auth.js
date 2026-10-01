import jwt from 'jsonwebtoken'

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization
  console.log('Auth header received:', authHeader)

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  const token = authHeader.split(' ')[1]
  console.log('Token extracted:', token)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('Decoded token:', decoded)
    req.user = decoded
    next()
  } catch (err) {
    console.error('Token error:', err.message)
    res.status(401).json({ message: 'Invalid token' })
  }
}