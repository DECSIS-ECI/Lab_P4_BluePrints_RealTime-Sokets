import { jwtDecode } from 'jwt-decode'
import { authApi } from './apiClient.js'

export async function login(username, password) {
  const { data } = await authApi.post('/auth/login', { username, password })
  const token = data.access_token
  const decoded = jwtDecode(token)
  const scopes = (decoded.scope || '').split(' ').filter(Boolean)
  localStorage.setItem('token', token)
  return { token, username: decoded.sub, scopes }
}

export function logout() {
  localStorage.removeItem('token')
}

export function getStoredSession() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const decoded = jwtDecode(token)
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token')
      return null
    }
    return { token, username: decoded.sub, scopes: (decoded.scope || '').split(' ').filter(Boolean) }
  } catch {
    localStorage.removeItem('token')
    return null
  }
}