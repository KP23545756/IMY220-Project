import ProfilePreview from './ProfilePreview.jsx'

function PostDetails({ post }) {
  return (
    <div className="post-details">
      <div className="post-account-row">
        <ProfilePreview profile={post?.author} />
        <span className="post-date-time">
          {/* TODO: replace with the post's real date/time */}
          Date/Time
        </span>
      </div>

      <div className="post-description-box">
        {post?.description || 'Description'}
      </div>

      <div className="tag-list">
        {/* TODO: replace with the post's actual tags */}
        <span className="tag">Birds</span>
        <span className="tag">Trees</span>
        <span className="tag">Rainforest</span>
      </div>

      <div className="post-engagement">
        {/* TODO: replace with real like/comment counts from the backend */}
        <span>&hearts; 13.7k</span>
        <span>&#128172; 432</span>
      </div>
    </div>
  )
}

export default PostDetails
