import { useState, useCallback, useEffect } from 'react';
import { useBlueprint } from './hooks/useBlueprint';
import { useRealtime } from './hooks/useRealtime';
import { BlueprintCanvas } from './components/BlueprintCanvas';
import { BlueprintList } from './components/BlueprintList';
import { BlueprintControls } from './components/BlueprintControls';
import { TotalPoints } from './components/TotalPoints';
import { ConnectionStatus } from './components/ConnectionStatus';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function App() {
  // Estado principal
  const [tech, setTech] = useState('socketio');
  const [author, setAuthor] = useState('juan');
  const [name, setName] = useState('plano-1');

  // Estado del plano
  const {
    blueprint,
    loading,
    error: blueprintError,
    totalPoints,
    addPoint,
    updateBlueprint,
    deleteBlueprint,
    createBlueprint,
    loadBlueprint,
  } = useBlueprint(author, name);

  // Manejar recepción de puntos en tiempo real
  const handlePointReceived = useCallback((data) => {
    console.log('Punto recibido:', data);
    if (data.points && data.points.length > 0) {
      data.points.forEach(point => {
        addPoint(point);
      });
    }
  }, [addPoint]);

  // Conexión en tiempo real
  const {
    connected,
    error: rtError,
    sendPoint,
  } = useRealtime(tech, author, name, handlePointReceived);

  // Manejar clic en el canvas
  const handleCanvasClick = useCallback((point) => {
    // Añadir punto localmente
    addPoint(point);
    
    // Enviar a través del canal en tiempo real
    sendPoint(point);
  }, [addPoint, sendPoint]);

  // Manejar selección de plano
  const handleSelectBlueprint = useCallback((selectedName) => {
    setName(selectedName);
  }, []);

  // Manejar guardar
  const handleSave = useCallback(async () => {
    if (!blueprint) return;
    await updateBlueprint(blueprint);
    alert('Plano guardado exitosamente');
  }, [blueprint, updateBlueprint]);

  // Manejar eliminar
  const handleDelete = useCallback(async () => {
    await deleteBlueprint();
    setName('');
    alert('Plano eliminado');
  }, [deleteBlueprint]);

  // Manejar crear
  const handleCreate = useCallback(async (newBlueprint) => {
    await createBlueprint(newBlueprint);
    setName(newBlueprint.name);
    alert('Plano creado exitosamente');
  }, [createBlueprint]);

  // Efecto para recargar cuando cambia el plano
  useEffect(() => {
    if (author && name) {
      loadBlueprint();
    }
  }, [author, name, loadBlueprint]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">
          BluePrints <span>RT</span>
        </h1>
        <div className="tech-selector">
          <label>Tecnología RT:</label>
          <select value={tech} onChange={(e) => setTech(e.target.value)}>
            <option value="socketio">Socket.IO</option>
            <option value="stomp">STOMP</option>
          </select>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="app-content">
        {/* Columna izquierda - Canvas */}
        <section className="canvas-section">
          <div className="canvas-header">
            <h2 className="canvas-title">
              {author}/{name || 'Selecciona un plano'}
            </h2>
            <div className="canvas-info">
              <ConnectionStatus 
                connected={connected} 
                error={rtError} 
                tech={tech} 
              />
            </div>
          </div>

          <BlueprintCanvas
            points={blueprint?.points || []}
            onPointClick={handleCanvasClick}
            readOnly={!connected || !name}
          />

          <div className="mt-4 text-sm text-gray-500">
            Haz clic en el canvas para dibujar {!connected && '(conéctate primero)'}
          </div>
          
          {blueprintError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {blueprintError}
            </div>
          )}
        </section>

        {/* Columna derecha - Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-card">
            <BlueprintControls
              author={author}
              name={name}
              onAuthorChange={setAuthor}
              onNameChange={setName}
              onSave={handleSave}
              onDelete={handleDelete}
              onCreate={handleCreate}
              isSaving={loading}
            />
          </div>

          <div className="sidebar-card">
            <TotalPoints 
              total={totalPoints} 
              author={author} 
              name={name} 
            />
          </div>

          <div className="sidebar-card">
            <BlueprintList
              author={author}
              selectedName={name}
              onSelectBlueprint={handleSelectBlueprint}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;