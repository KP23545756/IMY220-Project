import PostPreview from './PostPreview.jsx'
import Post1 from '../assets/post1_GwenWeustink.avif'
import Post2 from '../assets/post2-HansJurgenMager.avif'
import Post3 from '../assets/post3_AbhijitSinha.avif'
import Post4 from '../assets/post4_KarMingMoo.avif'

// TODO: replace with the actual user's posts
const dummyUserPosts = [
  { id: 1, title: 'Post', image: Post1 },
  { id: 2, title: 'Post', image: Post2 },
  { id: 3, title: 'Long post', image: Post3 },
  { id: 4, title: 'Post', image: Post4 },
]

function UserPosts() {
  return (
    <div className="feed-grid">
      {dummyUserPosts.map((post) => (
        <PostPreview key={post.id} post={post} />
      ))}
    </div>
  )
}

export default UserPosts