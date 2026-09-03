import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.post('/api/signup', (req, res) => {
  const { username, email } = req.body

  res.status(201).json({
    message: 'Signup stub successful',
    user: {
      id: 'dummy-id-123',
      username: username || 'dummy_user',
      email: email || 'dummy@example.com',
    },
  })
})

app.post('/api/signin', (req, res) => {
  const { email } = req.body

  res.status(200).json({
    message: 'Signin stub successful',
    user: {
      id: 'dummy-id-123',
      email: email || 'dummy@example.com',
    },
    // TODO: return a real auth token once authentication is implemented
    token: 'dummy-token',
  })
})

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`)
})
