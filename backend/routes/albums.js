import express from 'express'
import { getDB, ObjectId } from '../db.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Search albums - must be before /:id
router.get('/search/:query', async (req, res) => {
  try {
    const db = getDB()
    const regex = new RegExp(req.params.query, 'i')
    const albums = await db.collection('albums')
      .aggregate([
        { $match: { $or: [{ name: regex }, { description: regex }, { tags: regex }] } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorData' } },
        { $addFields: { author: { $arrayElemAt: ['$authorData', 0] } } },
        { $project: { 'author.password': 0, authorData: 0 } }
      ]).toArray()
    res.json(albums)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get albums by user - must be before /:id
router.get('/user/:userId', async (req, res) => {
  try {
    const db = getDB()
    const albums = await db.collection('albums')
      .find({ author: new ObjectId(req.params.userId) })
      .toArray()
    res.json(albums)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get albums containing a specific post - only return current user's albums
router.get('/containing/:postId', protect, async (req, res) => {
  try {
    const db = getDB()
    const albums = await db.collection('albums')
      .find({
        posts: new ObjectId(req.params.postId),
        author: new ObjectId(req.user.id)
      })
      .toArray()
    res.json(albums)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get single album
router.get('/:id', async (req, res) => {
  try {
    const db = getDB()
    const album = await db.collection('albums').findOne({ _id: new ObjectId(req.params.id) })
    if (!album) return res.status(404).json({ message: 'Album not found' })

    // Populate posts
    const posts = album.posts?.length
      ? await db.collection('posts')
          .find({ _id: { $in: album.posts.map(id => new ObjectId(id)) } })
          .toArray()
      : []

    // Populate author
    const author = await db.collection('users').findOne(
      { _id: album.author },
      { projection: { username: 1, profilePicture: 1 } }
    )

    res.json({ ...album, posts, author })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create album
router.post('/', protect, async (req, res) => {
  try {
    const db = getDB()
    const { name, description, tags } = req.body
    const result = await db.collection('albums').insertOne({
      name,
      description,
      tags,
      author: new ObjectId(req.user.id),
      posts: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    const album = await db.collection('albums').findOne({ _id: result.insertedId })
    res.status(201).json(album)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Edit album (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const db = getDB()
    const album = await db.collection('albums').findOne({ _id: new ObjectId(req.params.id) })
    if (!album) return res.status(404).json({ message: 'Album not found' })
    if (album.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' })

    const { name, description, tags } = req.body
    await db.collection('albums').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name: name ?? album.name, description: description ?? album.description, tags: tags ?? album.tags, updatedAt: new Date() } }
    )
    const updated = await db.collection('albums').findOne({ _id: new ObjectId(req.params.id) })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete album (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const db = getDB()
    const album = await db.collection('albums').findOne({ _id: new ObjectId(req.params.id) })
    if (!album) return res.status(404).json({ message: 'Album not found' })
    if (album.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' })

    await db.collection('albums').deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ message: 'Album deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Add post to album (owner only)
router.post('/:id/posts', protect, async (req, res) => {
  try {
    const db = getDB()
    const album = await db.collection('albums').findOne({ _id: new ObjectId(req.params.id) })
    if (!album) return res.status(404).json({ message: 'Album not found' })
    if (album.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' })

    await db.collection('albums').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $addToSet: { posts: new ObjectId(req.body.postId) } }
    )
    const updated = await db.collection('albums').findOne({ _id: new ObjectId(req.params.id) })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Remove post from album (owner only)
router.delete('/:id/posts/:postId', protect, async (req, res) => {
  try {
    const db = getDB()
    const album = await db.collection('albums').findOne({ _id: new ObjectId(req.params.id) })
    if (!album) return res.status(404).json({ message: 'Album not found' })
    if (album.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' })

    await db.collection('albums').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $pull: { posts: new ObjectId(req.params.postId) } }
    )
    const updated = await db.collection('albums').findOne({ _id: new ObjectId(req.params.id) })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: get all albums
router.get('/admin/all', protect, async (req, res) => {
  try {
    const db = getDB()
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) })
    if (!user?.isAdmin) return res.status(403).json({ message: 'Admin only' })

    const albums = await db.collection('albums')
      .aggregate([
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorData' } },
        { $addFields: { author: { $arrayElemAt: ['$authorData', 0] } } },
        { $project: { 'author.password': 0, authorData: 0 } }
      ]).toArray()
    res.json(albums)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: delete any album
router.delete('/admin/:id', protect, async (req, res) => {
  try {
    const db = getDB()
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) })
    if (!user?.isAdmin) return res.status(403).json({ message: 'Admin only' })

    await db.collection('albums').deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ message: 'Album deleted by admin' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router