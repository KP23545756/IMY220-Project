import { useState } from 'react'

const dummyComments = [
  { id: 1, user: 'jorge_h', text: 'The greenery is UNREAL' },
  { id: 2, user: 'wren.watches', text: 'Which forest is this?' },
  { id: 3, user: 'abdul345', text: 'Bro might be THE lorax' },
]

function Comments() {
  const [newComment, setNewComment] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: connect to a real backend endpoint
    console.log('New comment submitted:', newComment)
    setNewComment('')
  }

  return (
    <div className="comments">
      <div className="comments-box">
        <h3>Top Comments</h3>
        {dummyComments.map((comment) => (
          <p key={comment.id}>
            <strong>{comment.user}</strong> {comment.text}
          </p>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
      </form>
    </div>
  )
}

export default Comments
