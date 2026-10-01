import express from 'express'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Global feed
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Local feed (posts from friends only)
router.get('/feed', protect, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default
    const user = await User.findById(req.user.id)
    const posts = await Post.find({ author: { $in: user.friends } })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all posts by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePicture')
    if (!post) return res.status(404).json({ message: 'Post not found' })
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
    res.json({ post, comments })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create post
router.post('/', protect, async (req, res) => {
  try {
    const { imageUrl, description, tags } = req.body
    const post = await Post.create({ imageUrl, description, tags, author: req.user.id })
    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Edit post (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' })

    const { description, tags } = req.body
    post.description = description ?? post.description
    post.tags = tags ?? post.tags
    await post.save()
    res.json(post)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete post (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorised' })

    await post.deleteOne()
    await Comment.deleteMany({ post: req.params.id })
    res.json({ message: 'Post deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Like / unlike post
router.post('/:id/likes', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const liked = post.likes.includes(req.user.id)
    if (liked) {
      post.likes = post.likes.filter(l => l.toString() !== req.user.id)
    } else {
      post.likes.push(req.user.id)
    }
    await post.save()
    res.json({ likes: post.likes.length, liked: !liked })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Add comment
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const comment = await Comment.create({
      text: req.body.text,
      author: req.user.id,
      post: req.params.id
    })
    await comment.populate('author', 'username profilePicture')
    res.status(201).json(comment)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Report post
router.post('/:id/report', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    post.reports.push({ reportedBy: req.user.id, reason: req.body.reason })
    await post.save()
    res.json({ message: 'Post reported' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router