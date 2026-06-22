import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function BlueprintList({ author, onSelectBlueprint, selectedName }) {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!author) {
      setBlueprints([]);
      return;
    }

    const loadBlueprints = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getBlueprintsByAuthor(author);
        setBlueprints(data);
      } catch (err) {
        setError('Failed to load blueprints');
        setBlueprints([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlueprints();
  }, [author]);

  if (!author) {
    return <p className="text-gray-500">Ingresa un autor para ver sus planos</p>;
  }

  if (loading) {
    return <p className="text-gray-500">Cargando planos...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (blueprints.length === 0) {
    return <p className="text-gray-500">No hay planos para este autor</p>;
  }

  return (
    <div className="blueprint-list">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Planos de {author} ({blueprints.length})
      </h3>
      <div className="space-y-2">
        {blueprints.map((bp) => {
          const totalPoints = bp.points?.length || 0;
          const isSelected = bp.name === selectedName;
          
          return (
            <div
              key={bp.name}
              onClick={() => onSelectBlueprint(bp.name)}
              className={`
                flex items-center justify-between p-3 rounded-lg cursor-pointer
                transition-all duration-200
                ${isSelected 
                  ? 'bg-blue-50 border-2 border-blue-500' 
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-800">{bp.name}</span>
                <span className="text-xs text-gray-500">
                  {totalPoints} puntos
                </span>
              </div>
              {isSelected && (
                <span className="text-xs text-blue-600 font-medium">✓ Activo</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}