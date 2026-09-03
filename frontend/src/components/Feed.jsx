import PostPreview from './PostPreview.jsx'
import Post1 from '../assets/post1_GwenWeustink.avif'
import Post2 from '../assets/post2-HansJurgenMager.avif'
import Post3 from '../assets/post3_AbhijitSinha.avif'
import Post4 from '../assets/post4_KarMingMoo.avif'
import Post5 from '../assets/post5_WexorTMG.avif'
import Post6 from '../assets/post6_AgneseRudzite.avif'
import Post7 from '../assets/post7_V2osk.avif'
import Post8 from '../assets/post8_UrbanVintage.avif'

// TODO: replace dummyPosts with real posts fetched from the backend
const dummyPosts = [
  { id: 1, title: 'Post', previewHeight: 180, image: Post1 },
  { id: 2, title: 'Post', previewHeight: 260, image: Post2 },
  { id: 3, title: 'Post', previewHeight: 140, image: Post3 },
  { id: 4, title: 'Post', previewHeight: 220, image: Post4 },
  { id: 5, title: 'Long post', previewHeight: 300, image: Post5 },
  { id: 6, title: 'Post', previewHeight: 170, image: Post6 },
  { id: 7, title: 'Long post', previewHeight: 240, image: Post7 },
  { id: 8, title: 'Post', previewHeight: 200, image: Post8 },
]

function Feed() {
  return (
    <div className="feed-grid">
      {dummyPosts.map((post) => (
        <PostPreview key={post.id} post={post} />
      ))}
    </div>
  )
}

export default Feed