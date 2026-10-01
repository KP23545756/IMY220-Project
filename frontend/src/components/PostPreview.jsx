import { Link } from 'react-router-dom'

function PostPreview({ post }) {
  return (
    <Link to={`/post/${post._id}`} className="block no-underline text-white break-inside-avoid mb-4">
      <div className="rounded-xl overflow-hidden relative">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.description}
            className="w-full block"
          />
        ) : (
          <div className="bg-neutral-700 min-h-40 flex items-center justify-center text-neutral-400 text-sm p-4">
            No image
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-white text-xs m-0 line-clamp-2">{post.description}</p>
          <p className="text-neutral-300 text-xs m-0 mt-1">by {post.author?.username}</p>
        </div>
      </div>
    </Link>
  )
}

export default PostPreview