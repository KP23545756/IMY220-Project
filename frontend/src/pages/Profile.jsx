import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Header from '../components/Header.jsx'
import PostPreview from '../components/PostPreview.jsx'

const INTERESTS = ['Birds', 'Trees', 'Rainforest', 'Macro', 'Landscape', 'Wildlife', 'Night Sky']

function Profile() {
  const { id } = useParams()
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('photos')
  const [editData, setEditData] = useState({ username: '', bio: '', region: '', interests: [] })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, postsRes, albumsRes] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch(`/api/posts/user/${id}`),
          fetch(`/api/albums/user/${id}`)
        ])
        const userData = await userRes.json()
        const postsData = await postsRes.json()
        const albumsData = await albumsRes.json()
        if (!userRes.ok) { setError('User not found'); return }
        setProfile(userData)
        setPosts(postsData)
        setAlbums(albumsData)
        setEditData({
          username: userData.username,
          bio: userData.bio,
          region: userData.region,
          interests: userData.interests
        })
      } catch (err) {
        setError('Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      })
      const data = await res.json()
      if (res.ok) { setProfile(data); setIsEditing(false) }
    } catch (err) {
      console.error('Edit failed:', err)
    }
  }

  const handleSendFriendRequest = async () => {
    try {
      const res = await fetch(`/api/users/${id}/friends`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setProfile(prev => ({
          ...prev,
          friendRequests: [...(prev.friendRequests || []), { _id: user.id }]
        }))
      } else {
        alert(data.message)
      }
    } catch (err) {
      console.error('Friend request failed:', err)
    }
  }

  const handleUnfriend = async () => {
    try {
      const res = await fetch(`/api/users/${id}/friends/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      alert(data.message)
      setProfile(prev => ({
        ...prev,
        friends: prev.friends.filter(f => f._id !== user.id)
      }))
    } catch (err) {
      console.error('Unfriend failed:', err)
    }
  }

  const handleAccept = async (requester) => {
    try {
      const res = await fetch(`/api/users/${user.id}/friends/${requester._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setProfile(prev => ({
          ...prev,
          friendRequests: prev.friendRequests.filter(r => r._id !== requester._id),
          friends: [...prev.friends, requester]
        }))
      }
    } catch (err) {
      console.error('Accept failed:', err)
    }
  }

  const handleDecline = async (requester) => {
    try {
      const res = await fetch(`/api/users/${user.id}/friend-requests/${requester._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setProfile(prev => ({
          ...prev,
          friendRequests: prev.friendRequests.filter(r => r._id !== requester._id)
        }))
      }
    } catch (err) {
      console.error('Decline failed:', err)
    }
  }

  const handleDeleteProfile = async () => {
    if (!window.confirm('Delete your account? Your posts, albums and comments will be removed. This cannot be undone.')) return
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        logout()
        navigate('/')
      }
    } catch (err) {
      console.error('Delete profile failed:', err)
    }
  }

  const toggleInterest = (interest) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
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

  const isOwnProfile = user?.id === id
  const isFriend = profile.friends?.some(f => f._id === user?.id)
  const requestSent = profile.friendRequests?.some(r => r._id === user?.id)

  return (
    <div className="min-h-screen bg-neutral-900 page-bg text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-5 py-5">

        {/* Banner */}
        <div className="relative rounded-xl overflow-hidden bg-neutral-700 h-48 mb-4">
          {profile.banner ? (
            <img src={profile.banner} alt="banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
              No banner set
            </div>
          )}

          {/* Name + tabs overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="bg-black/70 text-white rounded-full px-4 py-1 font-semibold text-sm">
              {profile.username}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('photos')}
                className={`rounded-full px-4 py-1 text-sm border cursor-pointer transition-colors ${activeTab === 'photos' ? 'bg-white text-black border-white' : 'bg-black/50 text-white border-white hover:bg-white hover:text-black'}`}
              >
                Photos
              </button>
              <button
                onClick={() => setActiveTab('liked')}
                className={`rounded-full px-4 py-1 text-sm border cursor-pointer transition-colors ${activeTab === 'liked' ? 'bg-white text-black border-white' : 'bg-black/50 text-white border-white hover:bg-white hover:text-black'}`}
              >
                Liked
              </button>
            </div>
          </div>
        </div>

        {/* Avatar + interests + action */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative z-10 w-20 h-20 rounded-full bg-neutral-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 -mt-10 border-4 border-neutral-900">
            {profile.profilePicture
              ? <img src={profile.profilePicture} alt="avatar" className="w-full h-full object-cover rounded-full" />
              : profile.username?.[0]?.toUpperCase()
            }
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.interests?.map(i => (
              <span key={i} className="border border-white rounded-full px-3 py-1 text-xs text-white">
                {i}
              </span>
            ))}
          </div>

          <div className="ml-auto flex gap-2">
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="border border-white text-white rounded-full px-4 py-1 text-sm bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleDeleteProfile}
                  className="border border-red-400 text-red-400 rounded-full px-4 py-1 text-sm bg-transparent hover:bg-red-400 hover:text-white transition-colors cursor-pointer"
                >
                  Delete Profile
                </button>
              </>
          ) : isFriend ? (
            <button
              onClick={handleUnfriend}
              className="border border-red-400 text-red-400 rounded-full px-4 py-1 text-sm bg-transparent hover:bg-red-400 hover:text-white transition-colors cursor-pointer"
            >
              Unfriend
            </button>
          ) : requestSent ? (
            <button
              disabled
              className="border border-neutral-600 text-neutral-500 rounded-full px-4 py-1 text-sm bg-transparent cursor-default"
            >
              Request Sent
            </button>
          ) : (
            <button
              onClick={handleSendFriendRequest}
              className="border border-white text-white rounded-full px-4 py-1 text-sm bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              Add Friend
            </button>
          )}
          </div>
        </div>

        {/* Bio + region */}
        <div className="mb-4">
          {profile.bio && (
            <span className="bg-neutral-800 text-white rounded-full px-4 py-2 text-sm inline-block mr-2">
              {profile.bio}
            </span>
          )}
          {profile.region && (
            <span className="text-neutral-400 text-sm">📍 {profile.region}</span>
          )}
        </div>

        {/* Edit form */}
        {isEditing && (
          <form
            onSubmit={handleEditSubmit}
            className="bg-neutral-800 rounded-xl p-6 mb-6 grid grid-cols-2 gap-6"
          >
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold">Username</label>
              <input
                value={editData.username}
                onChange={e => setEditData(p => ({ ...p, username: e.target.value }))}
                className="bg-neutral-700 border border-neutral-600 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
              />
              <label className="text-sm font-semibold">Bio</label>
              <input
                value={editData.bio}
                onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))}
                className="bg-neutral-700 border border-neutral-600 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
              />
              <label className="text-sm font-semibold">Region</label>
              <input
                value={editData.region}
                onChange={e => setEditData(p => ({ ...p, region: e.target.value }))}
                className="bg-neutral-700 border border-neutral-600 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold">Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleInterest(i)}
                    className={`rounded-full px-3 py-1 text-sm border cursor-pointer transition-colors ${editData.interests.includes(i) ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="col-span-2 border border-white text-white rounded-full py-2 font-semibold bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        )}

        {/* Pending friend requests (own profile only) */}
          {isOwnProfile && profile.friendRequests?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">
                Friend Requests ({profile.friendRequests.length})
              </h3>
              <div className="flex flex-col gap-2">
                {profile.friendRequests.map(req => (
                  <div key={req._id} className="bg-neutral-800 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm font-semibold">
                      {req.username?.[0]?.toUpperCase()}
                    </div>
                    <span
                      className="text-white text-sm cursor-pointer hover:text-green-400"
                      onClick={() => navigate(`/profile/${req._id}`)}
                    >
                      {req.username}
                    </span>
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => handleAccept(req)}
                        className="border border-white text-white rounded-full px-4 py-1 text-sm bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(req)}
                        className="border border-neutral-600 text-neutral-400 rounded-full px-4 py-1 text-sm bg-transparent hover:border-red-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Friends */}
        {profile.friends?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Friends</h3>
            <div className="flex flex-wrap gap-3">
              {profile.friends.map(friend => (
                <div
                  key={friend._id}
                  onClick={() => navigate(`/profile/${friend._id}`)}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm font-semibold">
                    {friend.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-white text-sm">{friend.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Albums</h3>
            <div className="flex flex-wrap gap-3">
              {albums.map(album => (
                <div
                  key={album._id}
                  onClick={() => navigate(`/album/${album._id}`)}
                  className="bg-neutral-800 rounded-xl p-4 min-w-40 cursor-pointer hover:bg-neutral-700 transition-colors"
                >
                  <p className="m-0 font-semibold text-white text-sm">{album.name}</p>
                  <p className="m-0 text-neutral-400 text-xs mt-1">{album.posts?.length} posts</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts grid */}
        {activeTab === 'photos' && (
          posts.length === 0
            ? <p className="text-neutral-400">No posts yet</p>
            : <div style={{ columnCount: 4, columnGap: '14px' }}>
                {posts.map(post => <PostPreview key={post._id} post={post} />)}
              </div>
        )}

        {activeTab === 'liked' && (
          <p className="text-neutral-400">Liked posts coming soon</p>
        )}

      </main>
    </div>
  )
}

export default Profile