import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function FeaturedCarousel() {
  const [posts, setPosts] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts')
        const data = await res.json()
        if (res.ok) setPosts(Array.isArray(data) ? data : data.posts || [])
      } catch (err) {
        console.error('Failed to load featured posts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  // Top 5 most-liked posts that have an image
  const featured = [...posts]
    .filter(p => p.imageUrl)
    .sort((a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0))
    .slice(0, 5)

  if (loading || featured.length === 0) {
    return (
      <div className="w-full h-96 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
        {loading ? 'Loading...' : 'No featured posts yet'}
      </div>
    )
  }

  const current = featured[index % featured.length]

  const goPrev = () => setIndex(i => (i === 0 ? featured.length - 1 : i - 1))
  const goNext = () => setIndex(i => (i === featured.length - 1 ? 0 : i + 1))

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden flex items-center mb-4 bg-neutral-800">
      <img
        src={current.imageUrl}
        alt={current.description}
        onClick={() => navigate(`/post/${current._id}`)}
        className="w-full h-full object-cover cursor-pointer"
      />

      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white border border-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/80 cursor-pointer"
      >
        &#8592;
      </button>

      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white border border-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/80 cursor-pointer"
      >
        &#8594;
      </button>

      <div className="absolute bottom-0 inset-x-0 p-4 pt-10 bg-gradient-to-t from-black/70 to-transparent text-white text-sm text-right">
        <p className="m-0 font-semibold">{current.description}</p>
        <p className="m-0 text-neutral-300">by {current.author?.username}</p>
      </div>
    </div>
  )
}

export default FeaturedCarousel