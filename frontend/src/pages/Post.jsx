import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Header from '../components/Header.jsx'
import Comments from '../components/Comments.jsx'

const AVAILABLE_TAGS = ['Birds', 'Trees', 'Rainforest', 'Macro', 'Landscape', 'Wildlife', 'Night Sky']

function Post() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editDescription, setEditDescription] = useState('')
  const [editTags, setEditTags] = useState([])
  const [liked, setLiked] = useState(false)
  const [userAlbums, setUserAlbums] = useState([])
  const [showAlbumPicker, setShowAlbumPicker] = useState(false)
  const [albumMessage, setAlbumMessage] = useState('')

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`)
        const data = await res.json()
        if (!res.ok) { setError('Post not found'); return }
        setPost(data.post)
        setComments(data.comments)
        setEditDescription(data.post.description)
        setEditTags(data.post.tags)
        setLiked(data.post.likes.includes(user?.id))
      } catch (err) {
        setError('Something went wrong loading this post')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  useEffect(() => {
    if (!user) return
    const fetchAlbums = async () => {
      try {
        const res = await fetch(`/api/albums/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok) setUserAlbums(data)
      } catch (err) {
        console.error('Failed to fetch albums:', err)
      }
    }
    fetchAlbums()
  }, [user])

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/posts/${id}/likes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setLiked(data.liked)
      setPost(prev => ({ ...prev, likes: { length: data.likes } }))
    } catch (err) {
      console.error('Like failed:', err)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) navigate('/home')
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ description: editDescription, tags: editTags })
      })
      const data = await res.json()
      if (res.ok) {
        setPost(prev => ({ ...prev, description: data.description, tags: data.tags }))
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Edit failed:', err)
    }
  }

  const handleReport = async () => {
    const reason = window.prompt('Reason for reporting this post:')
    if (!reason) return
    try {
      await fetch(`/api/posts/${id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      })
      alert('Post reported')
    } catch (err) {
      console.error('Report failed:', err)
    }
  }

  const handleAddToAlbum = async (albumId) => {
    try {
      const res = await fetch(`/api/albums/${albumId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ postId: id })
      })
      const data = await res.json()
      if (res.ok) {
        setAlbumMessage('Added to album successfully')
        setShowAlbumPicker(false)
      } else {
        setAlbumMessage(data.message || 'Failed to add to album')
      }
    } catch (err) {
      setAlbumMessage('Something went wrong')
    }
  }

  const toggleEditTag = (tag) => {
    setEditTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const addComment = (newComment) => {
    setComments(prev => [newComment, ...prev])
  }

  if (loading) return (
    <div className="min-h-screen bg-neutral-900 page-bg text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-5 py-5">
        <p className="text-neutral-400">Loading post...</p>
      </main>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-neutral-900 page-bg text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-5 py-5">
        <p className="text-red-400">{error}</p>
      </main>
    </div>
  )

  const isOwner = user?.id === post.author?._id

  return (
    <div className="min-h-screen bg-neutral-900 page-bg text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-5 py-5">
        <div className="grid gap-5" style={{ gridTemplateColumns: '1.6fr 1fr' }}>

          {/* Left: image */}
          <div className="relative rounded-xl overflow-hidden min-h-96 bg-neutral-800 flex items-center justify-center">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-3 left-3 z-10 bg-black/50 text-white border border-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black/80 cursor-pointer"
            >
              &#8592;
            </button>
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt={post.description}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-neutral-500">No image</span>
            )}
          </div>

          {/* Right: details */}
          <div className="flex flex-col gap-4">

            {/* Author row */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {post.author?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p
                  className="m-0 font-semibold text-white cursor-pointer hover:text-green-400"
                  onClick={() => navigate(`/profile/${post.author?._id}`)}
                >
                  {post.author?.username}
                </p>
                <p className="m-0 text-xs text-neutral-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Edit form or description */}
            {isEditing ? (
              <form onSubmit={handleEdit} className="flex flex-col gap-3">
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="bg-neutral-800 border border-neutral-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400 min-h-20 resize-none"
                />
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleEditTag(tag)}
                      className={`rounded-full px-3 py-1 text-sm border cursor-pointer transition-colors ${editTags.includes(tag) ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="border border-white text-white rounded-full px-4 py-1 text-sm bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="border border-neutral-600 text-neutral-400 rounded-full px-4 py-1 text-sm bg-transparent hover:border-white hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="bg-neutral-700 rounded-xl p-4 text-white text-sm">
                  {post.description}
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map(tag => (
                    <span key={tag} className="border border-white rounded-full px-3 py-1 text-xs text-white">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Engagement */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleLike}
                className="border border-white text-white rounded-full px-4 py-1 text-sm bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                {liked ? '♥' : '♡'} {post.likes?.length ?? 0}
              </button>
              <span className="flex items-center text-neutral-400 text-sm">
                💬 {comments.length}
              </span>
              <button
                onClick={() => setShowAlbumPicker(!showAlbumPicker)}
                className="border border-white text-white rounded-full px-4 py-1 text-sm bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                + Album
              </button>
              <button
                onClick={handleReport}
                className="border border-neutral-600 text-neutral-400 rounded-full px-4 py-1 text-sm bg-transparent hover:border-red-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                Report
              </button>
            </div>

            {/* Album picker */}
            {showAlbumPicker && (
              <div className="bg-neutral-800 rounded-xl p-4 flex flex-col gap-2">
                <p className="m-0 font-semibold text-sm">Select an album:</p>
                {userAlbums.length === 0 ? (
                  <p className="text-neutral-400 text-sm m-0">
                    No albums yet —{' '}
                    <span
                      className="text-white underline cursor-pointer"
                      onClick={() => navigate('/create-album')}
                    >
                      create one
                    </span>
                  </p>
                ) : (
                  userAlbums.map(album => (
                    <button
                      key={album._id}
                      onClick={() => handleAddToAlbum(album._id)}
                      className="border border-neutral-600 text-white rounded-full px-4 py-1 text-sm bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer text-left"
                    >
                      {album.name}
                    </button>
                  ))
                )}
              </div>
            )}
            {albumMessage && (
              <p className="text-neutral-400 text-xs m-0">{albumMessage}</p>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="border border-white text-white rounded-full px-4 py-1 text-sm bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="border border-red-400 text-red-400 rounded-full px-4 py-1 text-sm bg-transparent hover:bg-red-400 hover:text-white transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}

            {/* Comments */}
            <Comments
              postId={id}
              comments={comments}
              onCommentAdded={addComment}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Post