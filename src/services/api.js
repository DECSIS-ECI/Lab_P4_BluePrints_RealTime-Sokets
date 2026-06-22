const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export const api = {
  // Obtener todos los planos de un autor
  async getBlueprintsByAuthor(author) {
    const response = await fetch(`${API_BASE}/api/blueprints?author=${author}`);
    if (!response.ok) throw new Error('Failed to fetch blueprints');
    return response.json();
  },

  // Obtener un plano específico
  async getBlueprint(author, name) {
    const response = await fetch(`${API_BASE}/api/blueprints/${author}/${name}`);
    if (!response.ok) throw new Error('Failed to fetch blueprint');
    return response.json();
  },

  // Crear un nuevo plano
  async createBlueprint(blueprint) {
    const response = await fetch(`${API_BASE}/api/blueprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blueprint),
    });
    if (!response.ok) throw new Error('Failed to create blueprint');
    return response.json();
  },

  // Actualizar un plano existente
  async updateBlueprint(author, name, blueprint) {
    const response = await fetch(`${API_BASE}/api/blueprints/${author}/${name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blueprint),
    });
    if (!response.ok) throw new Error('Failed to update blueprint');
    return response.json();
  },

  // Eliminar un plano
  async deleteBlueprint(author, name) {
    const response = await fetch(`${API_BASE}/api/blueprints/${author}/${name}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete blueprint');
    return response.json();
  },
};