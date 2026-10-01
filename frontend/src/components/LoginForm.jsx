import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!password.trim()) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setServerError(data.message || 'Login failed'); return }
      login(data.user, data.token)
      navigate('/home')
    } catch (err) {
      setServerError('Something went wrong, please try again')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 w-72">
      {serverError && <span className="text-red-400 text-sm">{serverError}</span>}

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

      <button
        type="submit"
        className="border border-white text-white rounded-full px-6 py-2 font-semibold bg-transparent hover:bg-white hover:text-black transition-colors cursor-pointer mt-2"
      >
        Login
      </button>
    </form>
  )
}

export default LoginForm