import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import PostPreview from './PostPreview.jsx'

function Feed({ feedType = 'global' }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError('')
      try {
        const url = feedType === 'local' ? '/api/posts/feed' : '/api/posts'
        const headers = feedType === 'local' ? { Authorization: `Bearer ${token}` } : {}
        const res = await fetch(url, { headers })
        const data = await res.json()
        if (!res.ok) { setError('Failed to load posts'); return }
        setPosts(data)
      } catch (err) {
        setError('Something went wrong loading posts')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [feedType])

  if (loading) return <p className="text-neutral-400 text-center py-8">Loading posts...</p>
  if (error) return <p className="text-red-400 text-center py-8">{error}</p>
  if (posts.length === 0) return <p className="text-neutral-400 text-center py-8">{feedType === 'local' ? 'No posts from people you follow yet' : 'No posts yet'}</p>

  return (
    <div style={{ columnCount: 4, columnGap: '14px', margin: '16px 0' }}>
      {posts.map((post) => (
        <PostPreview key={post._id} post={post} />
      ))}
    </div>
  )
}

export default Feed