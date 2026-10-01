import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import SearchInput from './SearchInput.jsx'
import logo from '../assets/Logo.png'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-600 font-display">
      <Link to="/home" className="flex items-center gap-3 no-underline text-white">
        <img src={logo} alt="Nature, Noticed logo" className="w-10 h-10 rounded-full object-cover" />
        <span className="font-semibold text-white">Nature, Noticed</span>
      </Link>

      <nav className="flex gap-6">
        <Link to="/home" className="text-white no-underline font-semibold hover:text-green-400">Home</Link>
        {user && <Link to={`/profile/${user.id}`} className="text-white no-underline font-semibold hover:text-green-400">Profile</Link>}
        <Link to="/create-post" className="text-white no-underline font-semibold hover:text-green-400">+ Post</Link>
        <Link to="/create-album" className="text-white no-underline font-semibold hover:text-green-400">+ Album</Link>
      </nav>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-white text-sm">Hi, {user.username}</span>
            <button
              onClick={handleLogout}
              className="border border-white text-white rounded-full px-4 py-1 text-sm bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/?mode=login" className="text-white no-underline text-sm border border-white rounded-full px-4 py-1 hover:bg-white hover:text-black transition-colors">Login</Link>
            <Link to="/?mode=signup" className="text-white no-underline text-sm border border-white rounded-full px-4 py-1 hover:bg-white hover:text-black transition-colors">Sign Up</Link>
          </>
        )}
      </div>

      <SearchInput />
    </header>
  )
}

export default Header