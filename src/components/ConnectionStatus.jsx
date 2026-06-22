export function ConnectionStatus({ connected, error, tech }) {
  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        {tech}: {error}
      </div>
    );
  }

  if (connected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        {tech}: Conectado
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
      {tech}: Desconectado
    </div>
  );
}