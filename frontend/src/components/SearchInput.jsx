import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SearchInput() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="bg-neutral-800 text-white border border-neutral-600 rounded-full px-4 py-2 text-sm w-48 focus:outline-none focus:border-green-400"
      />
    </form>
  )
}

export default SearchInput