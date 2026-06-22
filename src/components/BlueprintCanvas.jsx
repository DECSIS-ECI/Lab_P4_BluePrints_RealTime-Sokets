import { useRef, useEffect, useState } from 'react';

export function BlueprintCanvas({ points = [], onPointClick, readOnly = false }) {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    setContext(ctx);

    // Configurar el canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = 600;
    canvas.height = 400;
    canvas.style.width = '600px';
    canvas.style.height = '400px';

    draw(ctx, points);
  }, [points]);

  const draw = (ctx, pointsToDraw) => {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, 600, 400);
    
    // Dibujar grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 600; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 400);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(600, i);
      ctx.stroke();
    }

    if (!pointsToDraw || pointsToDraw.length === 0) return;

    // Dibujar puntos como línea
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    pointsToDraw.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // Dibujar puntos individuales
    pointsToDraw.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  const handleClick = (e) => {
    if (readOnly || !onPointClick) return;

    const rect = e.target.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Validar que el punto esté dentro del canvas
    if (x >= 0 && x <= 600 && y >= 0 && y <= 400) {
      onPointClick({ x, y });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        cursor: readOnly ? 'default' : 'crosshair',
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '600px',
        height: 'auto',
        aspectRatio: '600/400',
      }}
    />
  );
}