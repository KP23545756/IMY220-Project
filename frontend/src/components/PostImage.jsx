import { Link } from 'react-router-dom'

// Displays the image for the post, with a back-navigation arrow in the
// top-left corner per the wireframe.
function PostImage() {
  return (
    <div className="post-image post-image-placeholder-box">
      <Link to="/home" className="post-back-arrow" aria-label="Back">
        &#8592;
      </Link>
      {/* TODO: replace with the actual post image, e.g. <img src={post.imageUrl} /> */}
      Post
    </div>
  )
}

export default PostImage
