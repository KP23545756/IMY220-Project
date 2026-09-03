function ProfileInfo({ profile }) {
  return (
    <div className="profile-info">
      <div className="profile-banner-row">
        <div className="profile-banner-placeholder">
          {/* TODO: replace with the user's profile banner image */}
          profile banner / set profile banner
        </div>

        <div className="profile-header-tabs">
          <span className="profile-name-pill">{profile?.name || 'account name'}</span>
          <div className="profile-subtabs">
            <span>Photos</span> | <span>Likes</span>
          </div>
        </div>
      </div>

      <div className="profile-avatar-overlap-row">
        <div className="avatar-placeholder">
          {/* TODO: replace with the user's profile picture */}
          Account
        </div>

        <div className="tag-list">
          {/* TODO: replace with the user's actual selected interests */}
          <span className="tag">Birds</span>
          <span className="tag">Trees</span>
        </div>
      </div>

      <p className="profile-bio-pill">{profile?.bio || 'account bio/status'}</p>
    </div>
  )
}

export default ProfileInfo
