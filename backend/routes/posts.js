import express from 'express'
import { getDB, ObjectId } from '../db.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Global feed
router.get('/', async (req, res) => {
  try {
    const db = getDB()
    const posts = await db.collection('posts')
      .aggregate([
        { $sort: { createdAt: -1 } },
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorData' } },
        { $addFields: { author: { $arrayElemAt: ['$authorData', 0] }, hidden: { $gt: [{ $size: { $ifNull: ['$reports', []] } }, 2] } } },
        { $project: { 'author.password': 0, authorData: 0 } }
      ]).toArray()
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Local feed
router.get('/feed', protect, async (req, res) => {
  try {
    const db = getDB()
    const me = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) })
    const friendIds = (me.friends || []).map(id => new ObjectId(id))
    const posts = await db.collection('posts')
      .aggregate([
        { $match: { author: { $in: friendIds } } },
        { $sort: { createdAt: -1 } },
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorData' } },
        { $addFields: { author: { $arrayElemAt: ['$authorData', 0] } } },
        { $project: { 'author.password': 0, authorData: 0 } }
      ]).toArray()
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Search posts - must be before /:id
router.get('/search/:query', async (req, res) => {
  try {
    const db = getDB()
    const regex = new RegExp(req.params.query, 'i')
    const posts = await db.collection('posts')
      .aggregate([
        { $match: { $or: [{ description: regex }, { tags: regex }] } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorData' } },
        { $addFields: { author: { $arrayElemAt: ['$authorData', 0] } } },
        { $project: { 'author.password': 0, authorData: 0 } }
      ]).toArray()
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get posts by user - must be before /:id
router.get('/user/:userId', async (req, res) => {
  try {
    const db = getDB()
    const posts = await db.collection('posts')
      .aggregate([
        { $match: { author: new ObjectId(req.params.userId) } },
        { $sort: { createdAt: -1 } },
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorData' } },
        { $addFields: { author: { $arrayElemAt: ['$authorData', 0] } } },
        { $project: { 'author.password': 0, authorData: 0 } }
      ]).toArray()
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: get all reported posts
router.get('/reported', protect, async (req, res) => {
  try {
    const db = getDB()
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) })
    if (!user?.isAdmin) return res.status(403).json({ message: 'Admin only' })

    const posts = await db.collection('posts')
      .aggregate([
        { $match: { 'reports.0': { $exists: true } } },
        { $sort: { createdAt: -1 } },
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorData' } },
        { $addFields: { author: { $arrayElemAt: ['$authorData', 0] } } },
        { $project: { 'author.password': 0, authorData: 0 } }
      ]).toArray()
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Single post
router.get('/:id', async (req, res) => {
  try {
    const db = getDB()
    const posts = await db.collection('posts')
      .aggregate([
        { $match: { _id: new ObjectId(req.params.id) } },
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorData' } },
        { $addFields: { author: { $arrayElemAt: ['$authorData', 0] } } },
        { $project: { 'author.password': 0, authorData: 0 } }
      ]).toArray()

    if (!posts.length) return res.status(404).json({ message: 'Post not found' })

    const comments = await db.collection('comments')
      .aggregate([
        { $match: { post: new ObjectId(req.params.id) } },
        { $sort: { createdAt: -1 } },
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorData' } },
        { $addFields: { author: { $arrayElemAt: ['$authorData', 0] } } },
        { $project: { 'author.password': 0, authorData: 0 } }
      ]).toArray()

    res.json({ post: posts[0], comments })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create post
router.post('/', protect, async (req, res) => {
  try {
    const db = getDB()
    const { imageUrl, description, tags } = req.body
    const result = await db.collection('posts').insertOne({
      imageUrl,
      description,
      tags,
      author: new ObjectId(req.user.id),
      likes: [],
      reports: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    const post = await db.collection('posts').findOne({ _id: result.insertedId })
    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Edit post (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const db = getDB()
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) })
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' })

    const { description, tags } = req.body
    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { description: description ?? post.description, tags: tags ?? post.tags, updatedAt: new Date() } }
    )
    const updated = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete post (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const db = getDB()
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) })
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' })

    await db.collection('posts').deleteOne({ _id: new ObjectId(req.params.id) })
    await db.collection('comments').deleteMany({ post: new ObjectId(req.params.id) })
    res.json({ message: 'Post deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Like / unlike post
router.post('/:id/likes', protect, async (req, res) => {
  try {
    const db = getDB()
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) })
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const myId = new ObjectId(req.user.id)
    const liked = post.likes?.some(l => l.toString() === req.user.id)

    if (liked) {
      await db.collection('posts').updateOne({ _id: post._id }, { $pull: { likes: myId } })
    } else {
      await db.collection('posts').updateOne({ _id: post._id }, { $addToSet: { likes: myId } })
    }

    const updated = await db.collection('posts').findOne({ _id: post._id })
    res.json({ likes: updated.likes.length, liked: !liked })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Add comment
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const db = getDB()
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) })
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const result = await db.collection('comments').insertOne({
      text: req.body.text,
      author: new ObjectId(req.user.id),
      post: new ObjectId(req.params.id),
      createdAt: new Date()
    })

    const comment = await db.collection('comments').findOne({ _id: result.insertedId })
    const author = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { username: 1, profilePicture: 1 } }
    )
    res.status(201).json({ ...comment, author })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Report post
router.post('/:id/report', protect, async (req, res) => {
  try {
    const db = getDB()
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) })
    if (!post) return res.status(404).json({ message: 'Post not found' })

    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { reports: { reportedBy: new ObjectId(req.user.id), reason: req.body.reason } } }
    )
    res.json({ message: 'Post reported' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: edit any post
router.put('/admin/:id', protect, async (req, res) => {
  try {
    const db = getDB()
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) })
    if (!user?.isAdmin) return res.status(403).json({ message: 'Admin only' })

    const { description, tags } = req.body
    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { description, tags, updatedAt: new Date() } }
    )
    const updated = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: delete any post
router.delete('/admin/:id', protect, async (req, res) => {
  try {
    const db = getDB()
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) })
    if (!user?.isAdmin) return res.status(403).json({ message: 'Admin only' })

    await db.collection('posts').deleteOne({ _id: new ObjectId(req.params.id) })
    await db.collection('comments').deleteMany({ post: new ObjectId(req.params.id) })
    res.json({ message: 'Post deleted by admin' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router