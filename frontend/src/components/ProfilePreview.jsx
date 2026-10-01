import { useNavigate } from 'react-router-dom'

function ProfilePreview({ profile }) {
  const navigate = useNavigate()

  return (
    <div
      className="profile-preview"
      onClick={() => navigate(`/profile/${profile?._id || profile?.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="avatar-placeholder small">
        {profile?.profilePicture
          ? <img src={profile.profilePicture} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          : profile?.username?.[0]?.toUpperCase()
        }
      </div>
      <div>
        <p className="profile-preview-name">{profile?.username || 'Unknown'}</p>
        <p className="profile-preview-region">{profile?.region || ''}</p>
      </div>
    </div>
  )
}

export default ProfilePreview