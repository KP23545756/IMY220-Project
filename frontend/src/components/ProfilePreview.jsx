import { Link } from 'react-router-dom'

function ProfilePreview({ profile }) {
  return (
    <Link to={`/profile/${profile?.id ?? 1}`} className="profile-preview">
      <div className="avatar-placeholder small">
        {/* TODO: replace with the user's actual profile picture */}
      </div>
      <div>
        <p className="profile-preview-name">{profile?.name || 'account name'}</p>
        <p className="profile-preview-region">{profile?.region || 'Region'}</p>
      </div>
    </Link>
  )
}

export default ProfilePreview
