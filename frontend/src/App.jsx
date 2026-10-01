import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Splash from './pages/Splash.jsx'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import Post from './pages/Post.jsx'
import CreatePost from './pages/CreatePost.jsx'
import Album from './pages/Album.jsx'
import CreateAlbum from './pages/CreateAlbum.jsx'
import { useAuth } from './context/AuthContext.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/" />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/post/:id" element={
          <ProtectedRoute><Post /></ProtectedRoute>
        } />
        <Route path="/create-post" element={
          <ProtectedRoute><CreatePost /></ProtectedRoute>
        } />
        <Route path="/album/:id" element={
          <ProtectedRoute><Album /></ProtectedRoute>
        } />
        <Route path="/create-album" element={
          <ProtectedRoute><CreateAlbum /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
