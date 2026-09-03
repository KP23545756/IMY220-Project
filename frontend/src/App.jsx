import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Splash from './pages/Splash.jsx'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import Post from './pages/Post.jsx'
import CreatePost from './pages/CreatePost.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
