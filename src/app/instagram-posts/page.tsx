'use client';

import { useState, useRef } from 'react';

const POSTS = [
  { id: 'estrellas', title: 'Sube tu valoración' },
  { id: 'clientes', title: 'Clientes que leen' },
  { id: 'respuesta', title: 'Google Review Style' },
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

          {/* Card 1 — +0,3★ */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div
              ref={(el) => { refs.current[0] = el; }}
              style={{ width: 540, height: 540, fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}
              className="bg-white flex flex-col rounded-2xl mx-auto"
            >
              <div className="flex-shrink-0 flex items-center justify-center pt-8 pb-2">
                <img src="https://aura-online.es/logo.svg?v=2" alt="AURA" style={{ height: 76 }} />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-10">
                <div style={{ fontSize: 100, fontWeight: 900, color: '#ea580c', lineHeight: 1, letterSpacing: -3, marginBottom: 10 }}>
                  +0,3★
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width="38" height="38" viewBox="0 0 24 24" fill="#f97316"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', textAlign: 'center', lineHeight: 1.35, maxWidth: 360 }}>
                  Responder reseñas sube tu valoración media en Google
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: '#9ca3af', textAlign: 'center', maxWidth: 320, lineHeight: 1.55 }}>
                  Los negocios que responden en menos de 24h mejoran su puntuación notablemente
                </div>
              </div>

              <div className="flex-shrink-0 text-center pb-6" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, color: '#d97706' }}>
                AURA · REPUTACIÓN DIGITAL
              </div>
            </div>
            <button
              onClick={() => download(0)}
              disabled={downloading === POSTS[0].id}
              className="mt-4 w-full py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 text-sm"
            >
              {downloading === POSTS[0].id ? 'Descargando...' : 'Descargar "Sube tu valoración"'}
            </button>
          </div>

          {/* Card 2 — 89% */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div
              ref={(el) => { refs.current[1] = el; }}
              style={{ width: 540, height: 540, fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}
              className="bg-white flex flex-col rounded-2xl mx-auto"
            >
              <div className="flex-shrink-0 flex items-center justify-center pt-8 pb-2">
                <img src="https://aura-online.es/logo.svg?v=2" alt="AURA" style={{ height: 76 }} />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-10">
                <div style={{ fontSize: 120, fontWeight: 900, color: '#1f2937', lineHeight: 1, letterSpacing: -4, marginBottom: 4 }}>
                  89%
                </div>
                <div style={{ fontSize: 40, fontWeight: 300, color: '#ea580c', lineHeight: 1.1, marginBottom: 16 }}>
                  de los clientes
                </div>
                <div style={{ fontSize: 21, fontWeight: 700, color: '#1f2937', textAlign: 'center', lineHeight: 1.35, maxWidth: 380 }}>
                  lee las respuestas a las reseñas antes de elegir un negocio
                </div>
                <div style={{ marginTop: 14, fontSize: 13, color: '#9ca3af', textAlign: 'center', maxWidth: 340, lineHeight: 1.55 }}>
                  Una respuesta profesional convierte indecisos en clientes fieles
                </div>
              </div>

              <div className="flex-shrink-0 text-center pb-6" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, color: '#d97706' }}>
                AURA · REPUTACIÓN DIGITAL
              </div>
            </div>
            <button
              onClick={() => download(1)}
              disabled={downloading === POSTS[1].id}
              className="mt-4 w-full py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 text-sm"
            >
              {downloading === POSTS[1].id ? 'Descargando...' : 'Descargar "Clientes que leen"'}
            </button>
          </div>

          {/* Card 3 — Google Review Style */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div
              ref={(el) => { refs.current[2] = el; }}
              style={{ width: 540, height: 540, fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}
              className="bg-white flex flex-col rounded-2xl mx-auto"
            >
              <div className="flex-shrink-0 flex items-center justify-center pt-6 pb-3">
                <img src="https://aura-online.es/logo.svg?v=2" alt="AURA" style={{ height: 64 }} />
              </div>

              <div className="flex-1 flex flex-col px-8 gap-3 overflow-hidden">
                <div style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>M</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#1f2937', fontWeight: 600, fontSize: 16 }}>María García</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        {[1,2,3,4,5].map(i => (
                          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#eab308"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        ))}
                        <span style={{ color: '#9ca3af', fontSize: 11, marginLeft: 6 }}>hace 1 hora</span>
                      </div>
                    </div>
                    <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path fill="#9ca3af" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  </div>
                  <div style={{ color: '#374151', fontSize: 14, lineHeight: 1.6 }}>
                    "Llevo dos meses viniendo y la calidad es increíble. El trato al cliente es de 10. Volveré sin dudarlo. 100% recomendable."
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', borderRadius: 16, border: '2px solid #f97316', padding: '16px 18px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <img src="https://aura-online.es/logo.svg?v=2" alt="AURA" style={{ height: 18 }} />
                    <span style={{ color: '#ea580c', fontWeight: 700, fontSize: 12 }}>RESPUESTA DE AURA</span>
                  </div>
                  <div style={{ color: '#1f2937', fontSize: 15, lineHeight: 1.6, fontWeight: 500 }}>
                    "Mil gracias, María. Nos encanta saber que estas disfrutando de la experiencia. Tu opinión nos motiva a seguir mejorando cada día. Te esperamos de nuevo."
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 text-center pt-3 pb-5" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, color: '#d97706' }}>
                AURA · REPUTACIÓN DIGITAL
              </div>
            </div>
            <button
              onClick={() => download(2)}
              disabled={downloading === POSTS[2].id}
              className="mt-4 w-full py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 text-sm"
            >
              {downloading === POSTS[2].id ? 'Descargando...' : 'Descargar "Google Review Style"'}
            </button>
          </div>

        </div>
        <p className="text-center text-xs text-gray-400 mt-8">
          Las imágenes se generan en 1080×1080px, calidad óptima para Instagram.
        </p>
      </div>
    </div>
  );
}