import { useState } from 'react';

export function BlueprintControls({ 
  author, 
  name, 
  onSave, 
  onDelete, 
  onCreate, 
  onAuthorChange,
  onNameChange,
  isSaving = false,
}) {
  const [newName, setNewName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) {
      alert('Por favor ingresa un nombre para el plano');
      return;
    }
    try {
      await onCreate({ author, name: newName.trim(), points: [] });
      setNewName('');
      setShowCreateModal(false);
    } catch (err) {
      alert(`Error al crear: ${err.message}`);
    }
  };

  const handleSave = async () => {
    try {
      await onSave();
    } catch (err) {
      alert(`Error al guardar: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar el plano "${name}"?`)) return;
    try {
      await onDelete();
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Autor y nombre */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Autor
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => onAuthorChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej: juan"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plano
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej: plano-1"
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          disabled={!author}
        >
          Crear
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !author || !name}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          onClick={handleDelete}
          disabled={!author || !name}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          Eliminar
        </button>
      </div>

      {/* Modal de creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Crear Nuevo Plano</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Plano
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ej: plano-2"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}