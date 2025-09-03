// src/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001',
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

export default api
