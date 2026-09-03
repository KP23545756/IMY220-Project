import { useParams } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header.jsx'
import PostImage from '../components/PostImage.jsx'
import PostDetails from '../components/PostDetails.jsx'
import Comments from '../components/Comments.jsx'
import EditPost from '../components/EditPost.jsx'

// TODO: replace with the real post fetched
const dummyPost = {
  description: 'I speak for the trees',
  author: { name: 'Lorax', region: 'Northern Cape' },
}

function Post() {
  const { id } = useParams()
  const [isEditing, setIsEditing] = useState(false)

  console.log('Viewing post id:', id)

  return (
    <div className="page">
      <Header />
      <main className="post-page-layout">
        <PostImage />

        <div className="post-side-panel">
          {isEditing ? (
            <EditPost post={dummyPost} />
          ) : (
            <>
              <PostDetails post={dummyPost} />
              <button type="button" onClick={() => setIsEditing(true)}>
                Edit Post
              </button>
            </>
          )}

          <Comments />
        </div>
      </main>
    </div>
  )
}

export default Post
