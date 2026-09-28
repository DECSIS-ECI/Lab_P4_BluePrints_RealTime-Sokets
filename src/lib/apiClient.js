import axios from 'axios'

const API_ROOT = (import.meta.env.VITE_API_BASE || 'http://localhost:8080').replace(/\/$/, '')

// Para /auth/login (sin prefijo /api)
export const authApi = axios.create({ baseURL: API_ROOT, timeout: 8000 })

// Para /api/blueprints/**
const api = axios.create({ baseURL: `${API_ROOT}/api`, timeout: 8000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) localStorage.removeItem('token')
    return Promise.reject(err)
  },
)

export default api