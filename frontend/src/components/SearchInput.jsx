import { useState } from 'react'

// Handles search input. Actual search functionality is not implemented yet.
function SearchInput() {
  const [query, setQuery] = useState('')

  const handleChange = (e) => {
    setQuery(e.target.value)
    // TODO: implement real search (filter/fetch) in a later deliverable
  }

  return (
    <input
      type="text"
      className="search-input"
      placeholder="Search"
      value={query}
      onChange={handleChange}
    />
  )
}

export default SearchInput
