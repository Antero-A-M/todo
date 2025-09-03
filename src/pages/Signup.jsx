// src/pages/Signup.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      const body = { user: { email, password } }
      await api.post('/user/signup', body)
      alert('Account created. You can sign in now.')
      navigate('/signin')
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
      <h3>Sign up</h3>
      <form onSubmit={handleSignup}>
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
        <button type="submit">Create account</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </div>
  )
}
