import { Link } from 'react-router-dom'

function PostImage() {
  return (
    <div className="post-image post-image-placeholder-box">
      <Link to="/home" className="post-back-arrow" aria-label="Back">
        &#8592;
      </Link>
      {/* TODO: replace with the actual post image*/}
      Post
    </div>
  )
}

export default PostImage
