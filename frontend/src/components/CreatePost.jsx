import { useState } from 'react'

function CreatePost() {
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: connect to a real backend endpoint (e.g. POST /api/posts) once it exists
    console.log('Create post submitted:', { description, tags })
  }

  return (
    <form className="create-post-form" onSubmit={handleSubmit}>
      <h2>Create Post</h2>

      <div className="placeholder-box upload-box">
        {/* TODO: implement an actual <input type="file" /> image upload here */}
        Upload photo
      </div>

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="text"
        placeholder="Tags (e.g. Birds, Trees)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <button type="submit">Post</button>
    </form>
  )
}

export default CreatePost
