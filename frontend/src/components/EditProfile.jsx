import { useState } from 'react'

function EditProfile() {
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [region, setRegion] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: connect to a real backend endpoint (e.g. PUT /api/profile) once it exists
    console.log('Edit profile submitted:', { username, bio, region })
  }

  return (
    <form className="edit-profile-form" onSubmit={handleSubmit}>
      <h2 className="edit-profile-title">Create Profile Title</h2>

      <div className="edit-profile-avatar-block">
        <div className="avatar-placeholder">
          {/* TODO: implement an actual <input type="file" /> for the profile picture */}
          +
        </div>
        <button type="button">Set Profile Picture</button>
      </div>

      <div className="edit-profile-columns">
        <div className="edit-profile-col">
          <input
            type="text"
            placeholder="Username:"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Status/Bio:"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <input
            type="text"
            placeholder="Region:"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>

        <div className="edit-profile-col">
          {/* TODO: implement a proper "select two" multi-select interests control */}
          <select multiple>
            <option value="birds">Interests: select two</option>
          </select>
          <div className="tag-list stacked">
            <span className="tag">birds</span>
            <span className="tag">trees</span>
          </div>
        </div>
      </div>

      <button type="submit">Save</button>
    </form>
  )
}

export default EditProfile
