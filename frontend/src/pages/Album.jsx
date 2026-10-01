import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Header from '../components/Header.jsx'
import PostPreview from '../components/PostPreview.jsx'

const AVAILABLE_TAGS = ['Birds', 'Trees', 'Rainforest', 'Macro', 'Landscape', 'Wildlife', 'Night Sky']

function Album() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', description: '', tags: [] })

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await fetch(`/api/albums/${id}`)
        const data = await res.json()
        if (!res.ok) { setError('Album not found'); return }
        setAlbum(data)
        setEditData({ name: data.name, description: data.description, tags: data.tags })
      } catch (err) {
        setError('Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchAlbum()
  }, [id])

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/albums/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      })
      const data = await res.json()
      if (res.ok) {
        setAlbum(prev => ({ ...prev, name: data.name, description: data.description, tags: data.tags }))
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Edit failed:', err)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this album?')) return
    try {
      const res = await fetch(`/api/albums/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) navigate('/home')
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleRemovePost = async (postId) => {
    try {
      const res = await fetch(`/api/albums/${id}/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setAlbum(prev => ({ ...prev, posts: prev.posts.filter(p => p._id !== postId) }))
      }
    } catch (err) {
      console.error('Remove post failed:', err)
    }
  }

  const toggleTag = (tag) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  if (loading) return (
    <div className="min-h-screen bg-neutral-900 page-bg text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-5 py-5">
        <p className="text-neutral-400">Loading...</p>
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

  const isOwner = user?.id === album.author?._id

  return (
    <div className="min-h-screen bg-neutral-900 page-bg text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-5 py-5">

        <button
          onClick={() => navigate(-1)}
          className="border border-neutral-600 text-neutral-400 rounded-full px-4 py-1 text-sm bg-transparent hover:border-white hover:text-white transition-colors cursor-pointer mb-6"
        >
          ← Back
        </button>

        {/* Album header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold m-0 mb-2">{album.name}</h2>
            {album.description && (
              <p className="text-neutral-400 text-sm m-0 mb-3">{album.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {album.tags?.map(tag => (
                <span key={tag} className="border border-white rounded-full px-3 py-1 text-xs text-white">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="border border-white text-white rounded-full px-4 py-1 text-sm bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button
                onClick={handleDelete}
                className="border border-red-400 text-red-400 rounded-full px-4 py-1 text-sm bg-transparent hover:bg-red-400 hover:text-white transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Edit form */}
        {isEditing && (
          <form onSubmit={handleEdit} className="bg-neutral-800 rounded-xl p-6 mb-6 flex flex-col gap-4">
            <label className="text-sm font-semibold">Name</label>
            <input
              value={editData.name}
              onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
              className="bg-neutral-700 border border-neutral-600 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
            />
            <label className="text-sm font-semibold">Description</label>
            <input
              value={editData.description}
              onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
              className="bg-neutral-700 border border-neutral-600 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
            />
            <label className="text-sm font-semibold">Tags</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-sm border cursor-pointer transition-colors ${editData.tags.includes(tag) ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="border border-white text-white rounded-full py-2 font-semibold bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              Save
            </button>
          </form>
        )}

        {/* Posts */}
        <h3 className="text-white font-semibold mb-4">
          Posts ({album.posts?.length})
        </h3>

        {album.posts?.length === 0 && (
          <p className="text-neutral-400">No posts in this album yet</p>
        )}

        <div style={{ columnCount: 4, columnGap: '14px' }}>
          {album.posts?.map(post => (
            <div key={post._id} className="relative break-inside-avoid mb-4">
              <PostPreview post={post} />
              {isOwner && (
                <button
                  onClick={() => handleRemovePost(post._id)}
                  className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full px-2 py-1 text-xs hover:bg-red-600 cursor-pointer border-0"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}

export default Album