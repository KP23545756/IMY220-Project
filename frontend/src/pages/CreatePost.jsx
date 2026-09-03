import { useState } from 'react'
import Header from '../components/Header.jsx'

const AVAILABLE_TAGS = ['Birds', 'Trees', 'Rainforest', 'Macro', 'Landscape', 'Wildlife', 'Night Sky']

function CreatePostPage() {
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [errors, setErrors] = useState({})

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const validate = () => {
    const newErrors = {}
    if (!description.trim()) {
      newErrors.description = 'Description is required'
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (description.trim().length > 300) {
      newErrors.description = 'Description must be under 300 characters'
    }
    if (selectedTags.length === 0) {
      newErrors.tags = 'Please select at least one tag'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    // TODO: connect to a real backend endpoint
    console.log('Post submitted:', { description, selectedTags })
  }

  return (
    <div className="page page--createpost">
        <Header />
      <main className="create-post-page">
        <div className="create-post-layout">
          <div className="create-post-image-panel">
            <div className="placeholder-box create-post-upload">
              {/* TODO: replace with <input type="file" /> image upload */}
              + Upload Photo
            </div>
          </div>
          <div className="create-post-side-panel">
            <h2>New Post</h2>
            <form onSubmit={handleSubmit} noValidate>
              <label>Description</label>
              <textarea
                placeholder="Describe your photo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
              />
              <span className="char-count">{description.length}/300</span>
              {errors.description && (
                <span className="error-text">{errors.description}</span>
              )}
              <label>Tags (select at least one)</label>
              <div className="tag-selector">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-option ${selectedTags.includes(tag) ? 'tag-option--selected' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {errors.tags && (
                <span className="error-text">{errors.tags}</span>
              )}

              <button type="submit" className="submit-post-btn">
                Post
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  )
}

export default CreatePostPage