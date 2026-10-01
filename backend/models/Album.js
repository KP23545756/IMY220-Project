import mongoose from 'mongoose'

const albumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true })

export default mongoose.model('Album', albumSchema)