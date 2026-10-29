import express from 'express'
import { getDB, ObjectId } from '../db.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Get all report reasons
router.get('/', async (req, res) => {
  try {
    const db = getDB()
    const reasons = await db.collection('reportreasons').find({}).toArray()
    res.json(reasons)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: add a report reason
router.post('/', protect, async (req, res) => {
  try {
    const db = getDB()
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) })
    if (!user?.isAdmin) return res.status(403).json({ message: 'Admin only' })

    const result = await db.collection('reportreasons').insertOne({
      reason: req.body.reason,
      createdAt: new Date()
    })
    const reason = await db.collection('reportreasons').findOne({ _id: result.insertedId })
    res.status(201).json(reason)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: delete a report reason
router.delete('/:id', protect, async (req, res) => {
  try {
    const db = getDB()
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) })
    if (!user?.isAdmin) return res.status(403).json({ message: 'Admin only' })

    await db.collection('reportreasons').deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ message: 'Reason deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router