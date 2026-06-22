export function TotalPoints({ total = 0, author, name }) {
  if (!author || !name) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        Selecciona un plano para ver el total de puntos
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-sm font-medium text-blue-800 mb-1">
        Total de Puntos
      </h3>
      <p className="text-3xl font-bold text-blue-600">{total}</p>
      <p className="text-xs text-blue-600 mt-1">
        {author} / {name}
      </p>
    </div>
  );
}