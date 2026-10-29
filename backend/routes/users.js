import express from 'express'
import { getDB, ObjectId } from '../db.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Search users - must be before /:id
router.get('/search/:query', async (req, res) => {
  try {
    const db = getDB()
    const regex = new RegExp(req.params.query, 'i')
    const users = await db.collection('users')
      .find({ $or: [{ username: regex }, { email: regex }] })
      .project({ password: 0 })
      .limit(10)
      .toArray()
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const db = getDB()
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { password: 0 } }
    )
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Populate friends
    const friends = user.friends?.length
      ? await db.collection('users')
          .find({ _id: { $in: user.friends.map(id => new ObjectId(id)) } })
          .project({ username: 1, profilePicture: 1, region: 1 })
          .toArray()
      : []

    // Populate friend requests
    const friendRequests = user.friendRequests?.length
      ? await db.collection('users')
          .find({ _id: { $in: user.friendRequests.map(id => new ObjectId(id)) } })
          .project({ username: 1, profilePicture: 1 })
          .toArray()
      : []

    res.json({ ...user, friends, friendRequests })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Edit own profile
router.put('/:id', protect, async (req, res) => {
  try {
    const db = getDB()
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: 'Not authorised' })

    const { username, bio, region, interests, profilePicture, banner } = req.body
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { username, bio, region, interests, profilePicture, banner, updatedAt: new Date() } }
    )
    const updated = await db.collection('users').findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { password: 0 } }
    )
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete own account
router.delete('/:id', protect, async (req, res) => {
  try {
    const db = getDB()
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: 'Not authorised' })

    const id = new ObjectId(req.params.id)
    const posts = await db.collection('posts').find({ author: id }).project({ _id: 1 }).toArray()
    const postIds = posts.map(p => p._id)

    await db.collection('comments').deleteMany({ $or: [{ author: id }, { post: { $in: postIds } }] })
    await db.collection('posts').deleteMany({ author: id })
    await db.collection('posts').updateMany({}, { $pull: { likes: id } })
    await db.collection('albums').deleteMany({ author: id })
    await db.collection('albums').updateMany({}, { $pull: { posts: { $in: postIds } } })
    await db.collection('users').updateMany({}, { $pull: { friends: id, friendRequests: id } })
    await db.collection('users').deleteOne({ _id: id })

    res.json({ message: 'Account deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Send friend request
router.post('/:id/friends', protect, async (req, res) => {
  try {
    const db = getDB()
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: "You can't add yourself" })

    const targetId = new ObjectId(req.params.id)
    const myId = new ObjectId(req.user.id)

    const target = await db.collection('users').findOne({ _id: targetId })
    const me = await db.collection('users').findOne({ _id: myId })
    if (!target || !me) return res.status(404).json({ message: 'User not found' })

    const alreadyFriends = target.friends?.some(f => f.toString() === req.user.id)
    if (alreadyFriends) return res.status(400).json({ message: 'Already friends' })

    const requestExists = target.friendRequests?.some(r => r.toString() === req.user.id)
    if (requestExists) return res.status(400).json({ message: 'Request already sent' })

    await db.collection('users').updateOne(
      { _id: targetId },
      { $push: { friendRequests: myId } }
    )
    res.json({ message: 'Friend request sent' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Accept friend request
router.put('/:id/friends/:friendId', protect, async (req, res) => {
  try {
    const db = getDB()
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: 'Not authorised' })

    const userId = new ObjectId(req.params.id)
    const friendId = new ObjectId(req.params.friendId)

    await db.collection('users').updateOne(
      { _id: userId },
      { $pull: { friendRequests: friendId }, $addToSet: { friends: friendId } }
    )
    await db.collection('users').updateOne(
      { _id: friendId },
      { $addToSet: { friends: userId } }
    )
    res.json({ message: 'Friend request accepted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Decline friend request
router.delete('/:id/friend-requests/:requesterId', protect, async (req, res) => {
  try {
    const db = getDB()
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: 'Not authorised' })

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $pull: { friendRequests: new ObjectId(req.params.requesterId) } }
    )
    res.json({ message: 'Friend request declined' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Unfriend
router.delete('/:id/friends/:friendId', protect, async (req, res) => {
  try {
    const db = getDB()
    const userId = new ObjectId(req.params.id)
    const friendId = new ObjectId(req.params.friendId)

    await db.collection('users').updateOne({ _id: userId }, { $pull: { friends: friendId } })
    await db.collection('users').updateOne({ _id: friendId }, { $pull: { friends: userId } })
    res.json({ message: 'Unfriended successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: get all users
router.get('/admin/all', protect, async (req, res) => {
  try {
    const db = getDB()
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) })
    if (!user?.isAdmin) return res.status(403).json({ message: 'Admin only' })

    const users = await db.collection('users')
      .find({})
      .project({ password: 0 })
      .toArray()
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: delete any user
router.delete('/admin/:id', protect, async (req, res) => {
  try {
    const db = getDB()
    const admin = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) })
    if (!admin?.isAdmin) return res.status(403).json({ message: 'Admin only' })

    const id = new ObjectId(req.params.id)
    const posts = await db.collection('posts').find({ author: id }).project({ _id: 1 }).toArray()
    const postIds = posts.map(p => p._id)

    await db.collection('comments').deleteMany({ $or: [{ author: id }, { post: { $in: postIds } }] })
    await db.collection('posts').deleteMany({ author: id })
    await db.collection('albums').deleteMany({ author: id })
    await db.collection('users').updateMany({}, { $pull: { friends: id, friendRequests: id } })
    await db.collection('users').deleteOne({ _id: id })
    res.json({ message: 'User deleted by admin' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router