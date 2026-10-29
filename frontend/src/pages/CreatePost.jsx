import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Header from '../components/Header.jsx'

const AVAILABLE_TAGS = ['Birds', 'Trees', 'Rainforest', 'Macro', 'Landscape', 'Wildlife', 'Night Sky']

function CreatePostPage() {
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const { token } = useAuth()
  const navigate = useNavigate()

  const processFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setServerError('Please upload an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setServerError('Image must be under 2MB')
      return
    }
    setServerError('')
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
      setImageUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e) => {
    processFile(e.target.files[0])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    processFile(file)
  }

  const handleUrlInput = (e) => {
    setImageUrl(e.target.value)
    setImagePreview(e.target.value)
  }

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const validate = () => {
    const newErrors = {}
    if (!imageUrl.trim()) newErrors.imageUrl = 'Please upload an image or paste an image URL'
    if (!description.trim()) {
      newErrors.description = 'Description is required'
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (description.trim().length > 300) {
      newErrors.description = 'Description must be under 300 characters'
    }
    if (selectedTags.length === 0) newErrors.tags = 'Please select at least one tag'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl, description, tags: selectedTags })
      })
      const data = await res.json()
      if (!res.ok) { setServerError(data.message || 'Failed to create post'); return }
      navigate(`/post/${data._id}`)
    } catch (err) {
      setServerError('Something went wrong, please try again')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white page-bg">
      <Header />
      <main className="max-w-6xl mx-auto px-5 py-5">
        <div className="grid gap-5" style={{ gridTemplateColumns: '1.6fr 1fr' }}>

          {/* Left: drag and drop upload area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            className={`rounded-xl overflow-hidden bg-neutral-800 min-h-96 flex items-center justify-center relative transition-colors ${isDragging ? 'border-2 border-green-400 bg-neutral-700' : 'border-2 border-dashed border-neutral-600'} ${!imagePreview ? 'cursor-pointer hover:border-neutral-400' : ''}`}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImageUrl(''); setImagePreview('') }}
                  className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 cursor-pointer border-0 text-lg"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="text-center p-8">
                <p className="text-neutral-400 text-4xl mb-4">↑</p>
                <p className="text-neutral-300 font-semibold mb-1">
                  {isDragging ? 'Drop image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-neutral-500 text-sm mb-4">or click to browse</p>
                <p className="text-neutral-600 text-xs">Max 2MB · JPG, PNG, WEBP</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Right: form */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold m-0">New Post</h2>
            {serverError && <span className="text-red-400 text-sm">{serverError}</span>}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">

              {/* URL input as alternative to upload */}
              <label htmlFor="post-imageurl" className="text-sm font-semibold">
                Or paste an image URL
              </label>
              <input
                id="post-imageurl"
                type="text"
                placeholder="https://..."
                value={imagePreview?.startsWith('data:') ? '' : imageUrl}
                onChange={handleUrlInput}
                className="bg-neutral-800 border border-neutral-600 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
              />
              {errors.imageUrl && <span className="text-red-400 text-xs">{errors.imageUrl}</span>}

              <label htmlFor="post-description" className="text-sm font-semibold">Description</label>
              <textarea
                id="post-description"
                placeholder="Describe your photo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                className="bg-neutral-800 border border-neutral-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400 min-h-20 resize-none"
              />
              <span className="text-neutral-400 text-xs -mt-2">{description.length}/300</span>
              {errors.description && <span className="text-red-400 text-xs">{errors.description}</span>}

              <label className="text-sm font-semibold">Tags (select at least one)</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3 py-1 text-sm border cursor-pointer transition-colors ${selectedTags.includes(tag) ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {errors.tags && <span className="text-red-400 text-xs">{errors.tags}</span>}

              <button
                type="submit"
                className="mt-2 w-full border border-white text-white rounded-full py-2 font-semibold bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
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