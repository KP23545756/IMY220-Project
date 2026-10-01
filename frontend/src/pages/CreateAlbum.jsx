import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Header from '../components/Header.jsx'

const AVAILABLE_TAGS = ['Birds', 'Trees', 'Rainforest', 'Macro', 'Landscape', 'Wildlife', 'Night Sky']

function CreateAlbum() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const { token } = useAuth()
  const navigate = useNavigate()

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Album name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    try {
      const res = await fetch('/api/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, tags: selectedTags })
      })
      const data = await res.json()
      if (!res.ok) { setServerError(data.message || 'Failed to create album'); return }
      navigate(`/album/${data._id}`)
    } catch (err) {
      setServerError('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white page-bg">
      <Header />
      <main className="max-w-2xl mx-auto px-5 py-5">
        <h2 className="text-xl font-bold mb-4">Create Album</h2>
        {serverError && <span className="text-red-400 text-sm">{serverError}</span>}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 bg-neutral-800 rounded-xl p-6">
          <label className="text-sm font-semibold">Album Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Morning Walks"
            className="bg-neutral-700 border border-neutral-600 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
          />
          {errors.name && <span className="text-red-400 text-xs">{errors.name}</span>}

          <label className="text-sm font-semibold">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is this album about?"
            className="bg-neutral-700 border border-neutral-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400 min-h-20 resize-none"
          />

          <label className="text-sm font-semibold">Tags</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map(tag => (
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

          <button
            type="submit"
            className="mt-2 border border-white text-white rounded-full py-2 font-semibold bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
          >
            Create Album
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateAlbum