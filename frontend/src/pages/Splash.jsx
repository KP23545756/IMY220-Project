import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import SignupForm from '../components/SignupForm.jsx'
import heroImage from '../assets/splashHero.avif'

function Splash() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') || 'signup')

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden text-white"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/50 z-0" />

      {/* Glowing border panel */}
      <div
        className="absolute inset-y-0 z-0 backdrop-md bg-black/70"
        style={{
          left: '30%',
          right: '30%',
          border: '1px solid rgba(0, 191, 255, 0.4)',
          boxShadow: '0 0 10px rgba(0,191,255,0.2), 0 0 20px rgba(0,191,255,0.4)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen p-6">

        {/* Headline */}
        <div className="mt-16 ml-[43%]">
          <h1 className="text-6xl font-bold m-0">Nature, Noticed</h1>
          <p className="text-lg font-semibold mt-2">Share the moments most would walk past</p>
        </div>

        {/* Forms + toggle */}
        <div className="mt-auto ml-[43%] flex flex-col gap-4 pb-20">
          {mode === 'signup' ? <SignupForm /> : <LoginForm />}

          <div className="flex gap-3">
            <button
              onClick={() => setMode('signup')}
              className={`border rounded-full px-8 py-3 text-base font-semibold cursor-pointer transition-colors ${mode === 'signup' ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode('login')}
              className={`border rounded-full px-8 py-3 text-base font-semibold cursor-pointer transition-colors ${mode === 'login' ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
            >
              Login
            </button>
          </div>
        </div>

        {/* Photo credit */}
        <p className="absolute bottom-4 left-4 text-sm z-10 m-0">
          Photographer: Amit Rai
        </p>
      </div>
    </div>
  )
}

export default Splash