import { useParams } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header.jsx'
import ProfileInfo from '../components/ProfileInfo.jsx'
import EditProfile from '../components/EditProfile.jsx'
import UserPosts from '../components/UserPosts.jsx'
import Friends from '../components/Friends.jsx'

// TODO: replace with the real profile fetched
const dummyProfile = {
  name: 'Kyle',
  bio: 'Sleeping',
  region: 'Gauteng',
}

function Profile() {
  const { id } = useParams()
  const [isEditing, setIsEditing] = useState(false)
  console.log('Viewing profile id:', id)

  return (
    <div className="page page--profile">
      <Header />
      <main>
        {isEditing ? (
          <EditProfile />
        ) : (
          <>
            <ProfileInfo profile={dummyProfile} />
            <button type="button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </>
        )}

        <Friends />

        {/* TODO: code this up to actually filter */}
        <div className="profile-posts-tabs">
          <span>Photos</span> | <span>Liked</span>
        </div>
        <UserPosts />
      </main>
    </div>
  )
}

export default Profile
