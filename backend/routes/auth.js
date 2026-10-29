import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDB } from '../db.js'

const router = express.Router()

router.post('/signup', async (req, res) => {
  try {
    const db = getDB()
    const { username, email, password } = req.body
    const existing = await db.collection('users').findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already in use' })

    const hashed = await bcrypt.hash(password, 10)
    const result = await db.collection('users').insertOne({
      username,
      email,
      password: hashed,
      bio: '',
      region: '',
      interests: [],
      profilePicture: '',
      banner: '',
      friends: [],
      friendRequests: [],
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const token = jwt.sign({ id: result.insertedId.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({
      token,
      user: { id: result.insertedId.toString(), username, email, isAdmin: false }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/signin', async (req, res) => {
  try {
    const db = getDB()
    const { email, password } = req.body
    const user = await db.collection('users').findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({
      token,
      user: { id: user._id.toString(), username: user.username, email: user.email, isAdmin: user.isAdmin || false }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

export default router