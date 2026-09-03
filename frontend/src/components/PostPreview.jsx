import { Link } from 'react-router-dom'

function PostPreview({ post }) {
  return (
    <Link to={`/post/${post?.id ?? 1}`} className="post-preview">
      <img
        src={post?.image}
        alt={post?.title || 'Post'}
        className="feed-thumb"
        style={{ width: '100%', display: 'block' }}
      />
    </Link>
  )
}

export default PostPreview