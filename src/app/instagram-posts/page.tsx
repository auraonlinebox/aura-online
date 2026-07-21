'use client';

import { useState, useRef, useEffect } from 'react';

const POSTS = [
  {
    id: 'estrellas',
    title: 'Sube tu valoración',
    gradient: 'from-orange-400 to-orange-600',
    emoji: '⭐',
    big: '+0.3★',
    text: 'Responder reseñas de Google sube tu valoración media',
    detail: 'Los negocios que responden en menos de 24h mejoran su puntuación',
  },
  {
    id: 'clientes',
    title: 'Clientes que leen',
    gradient: 'from-amber-400 to-orange-500',
    emoji: '👀',
    big: '89%',
    text: 'de los clientes lee las respuestas antes de elegir',
    detail: 'Una respuesta profesional convierte indecisos en clientes',
  },
  {
    id: 'respuesta',
    title: 'Respuesta automatizada',
    gradient: 'from-orange-500 to-red-500',
    emoji: '✍️',
    big: '',
    text: 'Ejemplo de respuesta generada por AURA',
    detail: '"Gracias por tus palabras, María. Nos alegra saber que disfrutaste de la experiencia. ¡Esperamos verte de nuevo!"',
  },
];

export default function InstagramPosts() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const download = async (i: number) => {
    const id = POSTS[i].id;
    setDownloading(id);
    try {
      const el = refs.current[i];
      if (!el) return;
      const h2c = await import('html2canvas');
      const canvas = await h2c.default(el, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
      const link = document.createElement('a');
      link.download = `aura-post-${id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {}
    setDownloading(null);
  };

  const downloadAll = async () => {
    for (let i = 0; i < POSTS.length; i++) {
      await download(i);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Posts para Instagram</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Descarga estos 3 diseños y súbelos a Instagram. 1080×1080px.</p>
        <div className="flex justify-center gap-3 mb-8">
          <button onClick={downloadAll} className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all text-sm">
            Descargar los 3
          </button>
        </div>
        <div className="space-y-8">
          {POSTS.map((post, i) => (
            <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div
                ref={(el) => { refs.current[i] = el; }}
                style={{ width: 540, height: 540, fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}
                className={`bg-gradient-to-br ${post.gradient} text-white flex flex-col items-center justify-center p-10 rounded-2xl mx-auto`}
              >
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <img src="https://aura-online.es/logo.svg?v=2" alt="AURA" style={{ filter: 'brightness(0) invert(1)', maxWidth: '100%', maxHeight: '100%' }} />
                </div>
                <div className="text-6xl mb-3">{post.big || post.emoji}</div>
                <div className="text-xl font-bold text-center leading-tight mb-2">{post.text}</div>
                <div className="text-sm text-white/80 text-center max-w-xs leading-relaxed">{post.detail}</div>
                <div className="mt-6 text-xs font-semibold tracking-widest opacity-70">AURA · REPUTACIÓN DIGITAL</div>
              </div>
              <button
                onClick={() => download(i)}
                disabled={downloading === post.id}
                className="mt-4 w-full py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 text-sm"
              >
                {downloading === post.id ? 'Descargando...' : `Descargar "${post.title}"`}
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-8">
          Las imágenes se generan en 1080×1080px, calidad óptima para Instagram.
        </p>
      </div>
    </div>
  );
}