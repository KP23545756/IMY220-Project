import ProfilePreview from './ProfilePreview.jsx'

// TODO: replace with the actual friends list fetched from the backend
// once that functionality exists.
const dummyFriends = [
  { id: 2, name: 'account name', region: 'Region' },
  { id: 3, name: 'account name', region: 'Region' },
]

// Displays all users that the current user is friends with.
function Friends() {
  return (
    <div className="friends-list">
      <h3>Friends</h3>
      {dummyFriends.map((friend) => (
        <ProfilePreview key={friend.id} profile={friend} />
      ))}
    </div>
  )
}

export default Friends
