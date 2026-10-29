import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Header from '../components/Header.jsx'

function Admin() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('reported')
  const [reportedPosts, setReportedPosts] = useState([])
  const [users, setUsers] = useState([])
  const [albums, setAlbums] = useState([])
  const [reportReasons, setReportReasons] = useState([])
  const [newReason, setNewReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingPost, setEditingPost] = useState(null)
  const [editPostData, setEditPostData] = useState({ description: '', tags: [] })

  const AVAILABLE_TAGS = ['Birds', 'Trees', 'Rainforest', 'Macro', 'Landscape', 'Wildlife', 'Night Sky']

  useEffect(() => {
    if (!user) return
    fetchAll()
  }, [user])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [reportedRes, usersRes, albumsRes, reasonsRes] = await Promise.all([
        fetch('/api/posts/reported', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/users/admin/all', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/albums/admin/all', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/report-reasons')
      ])
      const [reportedData, usersData, albumsData, reasonsData] = await Promise.all([
        reportedRes.json(),
        usersRes.json(),
        albumsRes.json(),
        reasonsRes.json()
      ])
      if (reportedRes.ok) setReportedPosts(reportedData)
      if (usersRes.ok) setUsers(usersData)
      if (albumsRes.ok) setAlbums(albumsData)
      if (reasonsRes.ok) setReportReasons(reasonsData)
    } catch (err) {
      console.error('Admin fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return
    try {
      const res = await fetch(`/api/posts/admin/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setReportedPosts(prev => prev.filter(p => p._id !== postId))
    } catch (err) {
      console.error('Delete post failed:', err)
    }
  }

  const handleEditPost = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/posts/admin/${editingPost}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editPostData)
      })
      if (res.ok) {
        setReportedPosts(prev => prev.map(p =>
          p._id === editingPost ? { ...p, ...editPostData } : p
        ))
        setEditingPost(null)
      }
    } catch (err) {
      console.error('Edit post failed:', err)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their content?')) return
    try {
      const res = await fetch(`/api/users/admin/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setUsers(prev => prev.filter(u => u._id !== userId))
    } catch (err) {
      console.error('Delete user failed:', err)
    }
  }

  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm('Delete this album?')) return
    try {
      const res = await fetch(`/api/albums/admin/${albumId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setAlbums(prev => prev.filter(a => a._id !== albumId))
    } catch (err) {
      console.error('Delete album failed:', err)
    }
  }

  const handleAddReason = async (e) => {
    e.preventDefault()
    if (!newReason.trim()) return
    try {
      const res = await fetch('/api/report-reasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: newReason })
      })
      const data = await res.json()
      if (res.ok) {
        setReportReasons(prev => [...prev, data])
        setNewReason('')
      }
    } catch (err) {
      console.error('Add reason failed:', err)
    }
  }

  const handleDeleteReason = async (reasonId) => {
    try {
      const res = await fetch(`/api/report-reasons/${reasonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setReportReasons(prev => prev.filter(r => r._id !== reasonId))
    } catch (err) {
      console.error('Delete reason failed:', err)
    }
  }

  const toggleEditTag = (tag) => {
    setEditPostData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="max-w-6xl mx-auto px-5 py-5">
          <p className="text-red-400">Access denied — admin only</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-5 py-5">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {['reported', 'users', 'albums', 'reasons'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1 text-sm border cursor-pointer transition-colors capitalize ${activeTab === tab ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
            >
              {tab === 'reported' ? 'Reported Posts' : tab === 'reasons' ? 'Report Reasons' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading && <p className="text-neutral-400">Loading...</p>}

        {/* Reported posts */}
        {!loading && activeTab === 'reported' && (
          <div className="flex flex-col gap-4">
            {reportedPosts.length === 0 && <p className="text-neutral-400">No reported posts</p>}
            {reportedPosts.map(post => (
              <div key={post._id} className="bg-neutral-800 rounded-xl p-4">
                <div className="flex gap-4">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.description}
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/post/${post._id}`)}
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-white text-sm mb-1">{post.description}</p>
                    <p className="text-neutral-400 text-xs mb-2">by {post.author?.username}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags?.map(tag => (
                        <span key={tag} className="border border-neutral-600 rounded-full px-2 py-0.5 text-xs text-neutral-400">{tag}</span>
                      ))}
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-red-400 font-semibold mb-1">Reports ({post.reports?.length}):</p>
                      {post.reports?.map((r, i) => (
                        <p key={i} className="text-xs text-neutral-400">— {r.reason}</p>
                      ))}
                    </div>

                    {editingPost === post._id ? (
                      <form onSubmit={handleEditPost} className="flex flex-col gap-2">
                        <textarea
                          value={editPostData.description}
                          onChange={e => setEditPostData(p => ({ ...p, description: e.target.value }))}
                          className="bg-neutral-700 border border-neutral-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400 resize-none min-h-16"
                        />
                        <div className="flex flex-wrap gap-1">
                          {AVAILABLE_TAGS.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleEditTag(tag)}
                              className={`rounded-full px-3 py-0.5 text-xs border cursor-pointer transition-colors ${editPostData.tags.includes(tag) ? 'bg-white text-black border-white' : 'bg-transparent text-white border-neutral-600 hover:border-white'}`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="border border-white text-white rounded-full px-4 py-1 text-xs bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer">Save</button>
                          <button type="button" onClick={() => setEditingPost(null)} className="border border-neutral-600 text-neutral-400 rounded-full px-4 py-1 text-xs bg-transparent hover:border-white hover:text-white transition-colors cursor-pointer">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingPost(post._id); setEditPostData({ description: post.description, tags: post.tags }) }}
                          className="border border-white text-white rounded-full px-4 py-1 text-xs bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="border border-red-400 text-red-400 rounded-full px-4 py-1 text-xs bg-transparent hover:bg-red-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {!loading && activeTab === 'users' && (
          <div className="flex flex-col gap-3">
            {users.map(u => (
              <div key={u._id} className="bg-neutral-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="m-0 text-white font-semibold text-sm">{u.username}</p>
                    <p className="m-0 text-neutral-400 text-xs">{u.email}</p>
                    {u.isAdmin && <span className="text-xs text-green-400">Admin</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/profile/${u._id}`)}
                    className="border border-white text-white rounded-full px-4 py-1 text-xs bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    View
                  </button>
                  {u._id !== user.id && (
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="border border-red-400 text-red-400 rounded-full px-4 py-1 text-xs bg-transparent hover:bg-red-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Albums */}
        {!loading && activeTab === 'albums' && (
          <div className="flex flex-col gap-3">
            {albums.length === 0 && <p className="text-neutral-400">No albums</p>}
            {albums.map(album => (
              <div key={album._id} className="bg-neutral-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="m-0 text-white font-semibold text-sm">{album.name}</p>
                  <p className="m-0 text-neutral-400 text-xs">by {album.author?.username} · {album.posts?.length} posts</p>
                  {album.description && <p className="m-0 text-neutral-500 text-xs mt-1">{album.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/album/${album._id}`)}
                    className="border border-white text-white rounded-full px-4 py-1 text-xs bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(album._id)}
                    className="border border-red-400 text-red-400 rounded-full px-4 py-1 text-xs bg-transparent hover:bg-red-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report reasons */}
        {!loading && activeTab === 'reasons' && (
          <div className="flex flex-col gap-4">
            <form onSubmit={handleAddReason} className="flex gap-3">
              <input
                value={newReason}
                onChange={e => setNewReason(e.target.value)}
                placeholder="New report reason..."
                className="flex-1 bg-neutral-800 border border-neutral-600 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
              />
              <button
                type="submit"
                className="border border-white text-white rounded-full px-6 py-2 text-sm bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                Add
              </button>
            </form>
            <div className="flex flex-col gap-2">
              {reportReasons.map(r => (
                <div key={r._id} className="bg-neutral-800 rounded-xl px-4 py-3 flex items-center justify-between">
                  <p className="m-0 text-white text-sm">{r.reason}</p>
                  <button
                    onClick={() => handleDeleteReason(r._id)}
                    className="border border-red-400 text-red-400 rounded-full px-4 py-1 text-xs bg-transparent hover:bg-red-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default Admin