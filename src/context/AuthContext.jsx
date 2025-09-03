// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [email, setEmail] = useState(null)

  useEffect(() => {
    const t = sessionStorage.getItem('token')
    const e = sessionStorage.getItem('email')
    if (t) setToken(t)
    if (e) setEmail(e)
  }, [])

  const login = ({ token, email }) => {
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('email', email)
    setToken(token)
    setEmail(email)
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('email')
    setToken(null)
    setEmail(null)
  }

  return (
    <AuthContext.Provider value={{ token, email, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
