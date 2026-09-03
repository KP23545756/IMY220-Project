import { useState } from 'react'
import LoginForm from '../components/LoginForm.jsx'
import SignupForm from '../components/SignupForm.jsx'
import logo from '../assets/Logo.png'
import heroImage from '../assets/splashHero.avif'
import { useSearchParams } from 'react-router-dom'

function Splash() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') || 'signup')

  return (
    <div className="splash-border">
    <div
      className="splash-page"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >

      <div className="splash-top-row">
        <img src={logo} alt="Nature, Noticed logo" className="logo-img-splash corner-logo" />
      </div>

      <div className="splash-headline-block">
        <h1>Nature, Noticed</h1>
        <p className="subtext1">Share the moments most would walk past</p>
      </div>

      <div className="splash-bottom-block">
        {mode === 'signup' ? <SignupForm /> : <LoginForm />}

        <div className="splash-toggle">
          <button type="button" onClick={() => setMode('signup')}>
            Sign-up
          </button>
          <button type="button" onClick={() => setMode('login')}>
            Login
          </button>
        </div>
      </div>
      </div>

      <p className="photo-credit">
        Photographer: [Amit Rai]
      </p>
    </div>
  )
}

export default Splash
