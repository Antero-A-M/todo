// src/pages/Signin.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function Signin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSignin = async (e) => {
    e.preventDefault()
    try {
      const body = { user: { email, password } }
      const res = await api.post('/user/signin', body)
      login({ token: res.data.token, email: res.data.email })
      navigate('/')
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message
      alert(msg)
    }
  }

  return (
    <div id="container">
      <h3>Sign in</h3>
      <form onSubmit={handleSignin}>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ display: 'block', marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ display: 'block', marginBottom: 8 }}
        />
        <button type="submit">Sign in</button>
      </form>
      <p style={{ marginTop: 12 }}>
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  )
}
