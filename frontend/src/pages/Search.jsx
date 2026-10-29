import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import PostPreview from '../components/PostPreview.jsx'

function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')

  useEffect(() => {
    if (!query) return
    const fetchResults = async () => {
      setLoading(true)
      try {
        const [usersRes, postsRes, albumsRes] = await Promise.all([
          fetch(`/api/users/search/${encodeURIComponent(query)}`),
          fetch(`/api/posts/search/${encodeURIComponent(query)}`),
          fetch(`/api/albums/search/${encodeURIComponent(query)}`)
        ])
        const [usersData, postsData, albumsData] = await Promise.all([
          usersRes.json(),
          postsRes.json(),
          albumsRes.json()
        ])
        setUsers(usersData)
        setPosts(postsData)
        setAlbums(albumsData)
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [query])

  return (
    <div className="min-h-screen bg-neutral-900 page-bg text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-5 py-5">
        <h2 className="text-xl font-bold mb-2">
          Search results for <span className="text-green-400">"{query}"</span>
        </h2>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {['posts', 'users', 'albums'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1 text-sm border cursor-pointer transition-colors capitalize ${activeTab === tab ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
            >
              {tab} ({tab === 'posts' ? posts.length : tab === 'users' ? users.length : albums.length})
            </button>
          ))}
        </div>

        {loading && <p className="text-neutral-400">Searching...</p>}

        {/* Posts tab */}
        {!loading && activeTab === 'posts' && (
          posts.length === 0
            ? <p className="text-neutral-400">No posts found</p>
            : <div style={{ columnCount: 4, columnGap: '14px' }}>
                {posts.map(post => <PostPreview key={post._id} post={post} />)}
              </div>
        )}

        {/* Users tab */}
        {!loading && activeTab === 'users' && (
          users.length === 0
            ? <p className="text-neutral-400">No users found</p>
            : <div className="flex flex-col gap-3">
                {users.map(user => (
                  <div
                    key={user._id}
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="flex items-center gap-4 bg-neutral-800 rounded-xl p-4 cursor-pointer hover:bg-neutral-700 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                      {user.profilePicture
                        ? <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover rounded-full" />
                        : user.username?.[0]?.toUpperCase()
                      }
                    </div>
                    <div>
                      <p className="m-0 font-semibold text-white">{user.username}</p>
                      {user.region && <p className="m-0 text-neutral-400 text-sm">📍 {user.region}</p>}
                      {user.bio && <p className="m-0 text-neutral-400 text-sm">{user.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
        )}

        {/* Albums tab */}
        {!loading && activeTab === 'albums' && (
          albums.length === 0
            ? <p className="text-neutral-400">No albums found</p>
            : <div className="flex flex-wrap gap-4">
                {albums.map(album => (
                  <div
                    key={album._id}
                    onClick={() => navigate(`/album/${album._id}`)}
                    className="bg-neutral-800 rounded-xl p-4 min-w-48 cursor-pointer hover:bg-neutral-700 transition-colors"
                  >
                    <p className="m-0 font-semibold text-white">{album.name}</p>
                    {album.description && <p className="m-0 text-neutral-400 text-sm mt-1">{album.description}</p>}
                    <p className="m-0 text-neutral-500 text-xs mt-2">by {album.author?.username}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {album.tags?.map(tag => (
                        <span key={tag} className="border border-neutral-600 rounded-full px-2 py-0.5 text-xs text-neutral-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
        )}
      </main>
    </div>
  )
}

export default Search