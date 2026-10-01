import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function SignupForm() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!username.trim()) newErrors.username = 'Username is required'
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!email.includes('@')) {
      newErrors.email = 'Email must contain @'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (confirmPassword !== password) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setServerError(data.message || 'Signup failed'); return }
      login(data.user, data.token)
      navigate('/home')
    } catch (err) {
      setServerError('Something went wrong, please try again')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 w-72">
      {serverError && <span className="text-red-400 text-sm">{serverError}</span>}

      <label className="text-white text-sm font-semibold">Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="bg-transparent border border-white rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
      />
      {errors.username && <span className="text-red-400 text-xs">{errors.username}</span>}

      <label className="text-white text-sm font-semibold">Email address</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-transparent border border-white rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
      />
      {errors.email && <span className="text-red-400 text-xs">{errors.email}</span>}

      <label className="text-white text-sm font-semibold">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-transparent border border-white rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
      />
      {errors.password && <span className="text-red-400 text-xs">{errors.password}</span>}

      <label className="text-white text-sm font-semibold">Confirm Password</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="bg-transparent border border-white rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
      />
      {errors.confirmPassword && <span className="text-red-400 text-xs">{errors.confirmPassword}</span>}

      <button
        type="submit"
        className="border border-white text-white rounded-full px-6 py-2 font-semibold bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer mt-2"
      >
        Sign Up
      </button>
    </form>
  )
}

export default SignupForm