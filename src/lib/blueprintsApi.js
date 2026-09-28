import api from './apiClient.js'

export async function getBlueprint(author, name) {
  const { data } = await api.get(`/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`)
  return data.data ?? data
}

export async function getByAuthor(author) {
  const { data } = await api.get('/blueprints', { params: { author } })
  return data.data ?? data
}

export async function createBlueprint(payload) {
  const { data } = await api.post('/blueprints', payload)
  return data.data ?? data
}

export async function updateBlueprint(author, name, points) {
  const { data } = await api.put(`/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`, { points })
  return data.data ?? data
}

export async function deleteBlueprint(author, name) {
  await api.delete(`/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`)
}