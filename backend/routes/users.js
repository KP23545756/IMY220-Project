import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Album from '../models/Album.js'

const router = express.Router()

// Get a user's profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'username profilePicture region')
      .populate('friendRequests', 'username profilePicture')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Edit own profile
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: 'Not authorised' })

    const { username, bio, region, interests, profilePicture, banner } = req.body
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { username, bio, region, interests, profilePicture, banner },
      { new: true }
    ).select('-password')
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete own account
router.delete('/:id', protect, async (req, res) => {
  try {
    const id = req.params.id
    if (req.user.id !== id)
      return res.status(403).json({ message: 'Not authorised' })

    const postIds = (await Post.find({ author: id }).select('_id')).map(p => p._id)

    await Comment.deleteMany({ $or: [{ author: id }, { post: { $in: postIds } }] })
    await Post.deleteMany({ author: id })
    await Post.updateMany({}, { $pull: { likes: id } })
    await Album.deleteMany({ author: id })
    await Album.updateMany({}, { $pull: { posts: { $in: postIds } } })
    await User.updateMany({}, { $pull: { friends: id, friendRequests: id } })
    await User.findByIdAndDelete(id)

    res.json({ message: 'Account deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Send friend request
router.post('/:id/friends', protect, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: "You can't add yourself" })

    const target = await User.findById(req.params.id)
    const me = await User.findById(req.user.id)
    if (!target || !me) return res.status(404).json({ message: 'User not found' })

    if (target.friends.some(f => f.toString() === req.user.id))
      return res.status(400).json({ message: 'Already friends' })
    if (target.friendRequests.some(r => r.toString() === req.user.id))
      return res.status(400).json({ message: 'Request already sent' })
    if (me.friendRequests.some(r => r.toString() === req.params.id))
      return res.status(400).json({ message: 'This user already sent you a request. Accept it from your profile.' })

    target.friendRequests.push(req.user.id)
    await target.save()
    res.json({ message: 'Friend request sent' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Accept friend request (only the recipient can accept)
router.put('/:id/friends/:friendId', protect, async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: 'Not authorised' })

    const user = await User.findById(req.params.id)
    const friend = await User.findById(req.params.friendId)
    if (!user || !friend) return res.status(404).json({ message: 'User not found' })

    if (!user.friendRequests.some(r => r.toString() === req.params.friendId))
      return res.status(400).json({ message: 'No pending request from this user' })

    user.friendRequests = user.friendRequests.filter(r => r.toString() !== req.params.friendId)
    if (!user.friends.some(f => f.toString() === req.params.friendId))
      user.friends.push(req.params.friendId)
    if (!friend.friends.some(f => f.toString() === req.params.id))
      friend.friends.push(req.params.id)
    await user.save()
    await friend.save()
    res.json({ message: 'Friend request accepted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Decline friend request (only the recipient can decline)
router.delete('/:id/friend-requests/:requesterId', protect, async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: 'Not authorised' })

    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.friendRequests = user.friendRequests.filter(r => r.toString() !== req.params.requesterId)
    await user.save()
    res.json({ message: 'Friend request declined' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Unfriend (either person in the friendship can do it)
router.delete('/:id/friends/:friendId', protect, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.id !== req.params.friendId)
      return res.status(403).json({ message: 'Not authorised' })

    const user = await User.findById(req.params.id)
    const friend = await User.findById(req.params.friendId)
    if (!user || !friend) return res.status(404).json({ message: 'User not found' })

    user.friends = user.friends.filter(f => f.toString() !== req.params.friendId)
    friend.friends = friend.friends.filter(f => f.toString() !== req.params.id)
    await user.save()
    await friend.save()
    res.json({ message: 'Unfriended successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router