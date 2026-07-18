'use client';

import { useRef, useEffect, useState } from 'react';

export default function DownloadIconPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2;

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(1, '#d97706');

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    const starPoints = [
      [cx, cy - r * 0.75],
      [cx + r * 0.2, cy - r * 0.2],
      [cx + r * 0.75, cy - r * 0.2],
      [cx + r * 0.3, cy + r * 0.15],
      [cx + r * 0.45, cy + r * 0.65],
      [cx, cy + r * 0.3],
      [cx - r * 0.45, cy + r * 0.65],
      [cx - r * 0.3, cy + r * 0.15],
      [cx - r * 0.75, cy - r * 0.2],
      [cx - r * 0.2, cy - r * 0.2],
    ];
    ctx.moveTo(starPoints[0][0], starPoints[0][1]);
    for (let i = 1; i < starPoints.length; i++) {
      ctx.lineTo(starPoints[i][0], starPoints[i][1]);
    }
    ctx.closePath();
    ctx.fill();
  }, []);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'aura-icon.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Icono AURA para Instagram</h1>
        <canvas ref={canvasRef} className="w-48 h-48 mx-auto rounded-full shadow-md" />
        <button
          onClick={download}
          className="px-8 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all"
        >
          {downloaded ? '¡Descargado!' : 'Descargar PNG'}
        </button>
        <p className="text-xs text-gray-400">Se descargará como PNG listo para subir a Instagram.</p>
      </div>
    </div>
  );
}
