import { Link } from 'react-router-dom'
import SearchInput from './SearchInput.jsx'
import logo from '../assets/Logo.png'

function Header() {
  return (
    <header className="header">
      <Link to="/home" className="logo">
        <img src={logo} alt="Nature, Noticed logo" className="logo-img" />
        <p className="website-name">Nature Noticed</p>
      </Link>

      <nav className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/profile/1">Profile</Link>
        <Link to="/create-post">+ Post</Link>
      </nav>

      <div className="nav-auth">
        <Link to="/?mode=login">Login</Link>
        <Link to="/?mode=signup">Sign Up</Link>
      </div>

      <SearchInput />
    </header>
  )
}

export default Header
