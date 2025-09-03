// src/App.jsx
import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import './App.css'
import Row from './components/Row'
import api from './api'
import { useAuth } from './context/AuthContext'
import Signin from './pages/Signin'
import Signup from './pages/Signup'

function Home() {
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState([])
  const { token } = useAuth()

  useEffect(() => {
    api.get('/')
      .then(res => setTasks(res.data))
      .catch(err => {
        const msg =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message
        alert(msg)
      })
  }, [])

  const addTask = () => {
    const t = task.trim()
    if (!t) return
    api.post('/create', { task: { description: t } })
      .then(res => {
        setTasks([...tasks, res.data])
        setTask('')
      })
      .catch(err => {
        const msg =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message
        alert(msg)
      })
  }

  const deleteTask = (id) => {
    api.delete(`/delete/${id}`)
      .then(() => setTasks(tasks.filter(x => x.id !== id)))
      .catch(err => {
        const msg =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message
        alert(msg)
      })
  }

  return (
    <div id="container">
      <h3>Todos</h3>

      <form>
        <input
          placeholder="Add new task"
          value={task}
          onChange={e => setTask(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTask()
            }
          }}
          disabled={!token} 
        />
      </form>

      {!token && (
        <p style={{ fontSize: 12, opacity: .8 }}>
          Sign in to add or delete tasks.
        </p>
      )}

      <ul>
        {tasks.map(item => (
          <Row key={item.id} item={item} deleteTask={deleteTask} />
        ))}
      </ul>
    </div>
  )
}

export default function App() {
  const { email, token, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  return (
    <>
      {/* yksinkertainen navigaatio */}
      <div style={{ padding: 12 }}>
        <Link to="/">Home</Link>
        {' | '}
        {token ? (
          <>
            <span style={{ opacity: .8 }}> {email} </span>
            {' '}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/signin">Sign in</Link>
            {' | '}
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  )
}
