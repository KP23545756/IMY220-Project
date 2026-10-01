import { useState } from 'react'

function SearchInput() {
  const [query, setQuery] = useState('')

  const handleChange = (e) => {
    setQuery(e.target.value)
  }

  return (
    <input
      type="text"
      placeholder="Search"
      value={query}
      onChange={handleChange}
      className="bg-neutral-800 text-white border border-neutral-600 rounded-full px-4 py-2 text-sm w-48 focus:outline-none focus:border-green-400"
    />
  )
}

export default SearchInput