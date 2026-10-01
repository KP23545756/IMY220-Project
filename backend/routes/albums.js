import express from 'express'
import Album from '../models/Album.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Get all albums by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const albums = await Album.find({ author: req.params.userId })
      .populate('author', 'username profilePicture')
    res.json(albums)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get album
router.get('/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate('posts')
    if (!album) return res.status(404).json({ message: 'Album not found' })
    res.json(album)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create album
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, tags } = req.body
    const album = await Album.create({ name, description, tags, author: req.user.id })
    res.status(201).json(album)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Edit album (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
    if (!album) return res.status(404).json({ message: 'Album not found' })
    if (album.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' })

    const { name, description, tags } = req.body
    album.name = name ?? album.name
    album.description = description ?? album.description
    album.tags = tags ?? album.tags
    await album.save()
    res.json(album)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete album (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
    if (!album) return res.status(404).json({ message: 'Album not found' })
    if (album.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' })

    await album.deleteOne()
    res.json({ message: 'Album deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Add post to album (owner only)
router.post('/:id/posts', protect, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
    if (!album) return res.status(404).json({ message: 'Album not found' })
    if (album.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' })

    if (!album.posts.includes(req.body.postId)) {
      album.posts.push(req.body.postId)
      await album.save()
    }
    res.json(album)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Remove post from album (owner only)
router.delete('/:id/posts/:postId', protect, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
    if (!album) return res.status(404).json({ message: 'Album not found' })
    if (album.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' })

    album.posts = album.posts.filter(p => p.toString() !== req.params.postId)
    await album.save()
    res.json(album)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router