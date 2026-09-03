import { useState } from 'react'

function EditPost({ post }) {
  const [description, setDescription] = useState(post?.description || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: connect to a real backend endpoint
    console.log('Edit post submitted:', { description })
  }

  return (
    <form className="edit-post-form" onSubmit={handleSubmit}>
      <h3>Edit Post</h3>

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* TODO: implement tag editing and image replacement */}
      <button type="submit">Save changes</button>
    </form>
  )
}

export default EditPost
