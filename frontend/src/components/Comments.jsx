import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

function Comments({ postId, comments, onCommentAdded }) {
  const [newComment, setNewComment] = useState('')
  const [error, setError] = useState('')
  const { token } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      })
      const data = await res.json()
      if (res.ok) {
        onCommentAdded(data)
        setNewComment('')
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to post comment')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-neutral-700 rounded-xl p-4">
        <h3 className="text-white font-semibold mt-0 mb-3">Comments</h3>
        {comments.length === 0 && (
          <p className="text-neutral-400 text-sm">No comments yet</p>
        )}
        {comments.map((comment) => (
          <div key={comment._id} className="mb-2">
            <span className="text-white font-semibold text-sm">{comment.author?.username} </span>
            <span className="text-neutral-300 text-sm">{comment.text}</span>
          </div>
        ))}
      </div>

      {error && <span className="text-red-400 text-xs">{error}</span>}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 bg-neutral-800 border border-neutral-600 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
        />
        <button
          type="submit"
          className="border border-white text-white rounded-full px-4 py-2 text-sm bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
        >
          Post
        </button>
      </form>
    </div>
  )
}

export default Comments