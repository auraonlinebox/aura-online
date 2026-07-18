'use client';

import { useState } from 'react';

export default function SocialCardPage() {
  const [businessName, setBusinessName] = useState('');
  const [cards, setCards] = useState([{ author: '', rating: 5, text: '', response: '' }]);
  const [activeIndex, setActiveIndex] = useState(0);

  const addCard = () => {
    if (cards.length >= 5) return;
    setCards([...cards, { author: '', rating: 5, text: '', response: '' }]);
  };

  const removeCard = (i: number) => {
    if (cards.length <= 1) return;
    const copy = cards.filter((_, idx) => idx !== i);
    setCards(copy);
    if (activeIndex >= copy.length) setActiveIndex(copy.length - 1);
  };

  const updateCard = (i: number, field: string, value: string | number) => {
    const copy = [...cards];
    (copy[i] as any)[field] = value;
    setCards(copy);
  };

  const c = cards[activeIndex] || { author: '', rating: 5, text: '', response: '' };
  const stars = '★'.repeat(c.rating) + '☆'.repeat(5 - c.rating);

  const downloadCard = () => {
    const el = document.getElementById('card-preview');
    if (!el) return;
    // Use html2canvas approach - simple screenshot via canvas
    import('html2canvas').then((html2canvas) => {
      html2canvas.default(el, {
        scale: 2,
        backgroundColor: '#fff',
        useCORS: true,
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `aura-${businessName || 'card'}-${activeIndex + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; Volver</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Generador de tarjetas Instagram</h1>
        <p className="text-sm text-gray-500 mb-6">Crea tarjetas profesionales con las reseñas y respuestas de AURA. Descárgalas como PNG y súbelas a Instagram.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-medium">Nombre del negocio</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300" placeholder="Ej: Corto y Cambio" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-500 font-medium">Tarjetas ({cards.length}/5)</label>
                {cards.length < 5 && <button onClick={addCard} className="text-xs text-orange-500 hover:text-orange-600 font-medium">+ Añadir</button>}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {cards.map((_, i) => (
                  <button key={i} onClick={() => setActiveIndex(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === activeIndex ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {i + 1}{cards[i].author ? ` — ${cards[i].author}` : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex gap-2">
                <input type="text" value={c.author} onChange={(e) => updateCard(activeIndex, 'author', e.target.value)} placeholder="Nombre del cliente" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-300" />
                <select value={c.rating} onChange={(e) => updateCard(activeIndex, 'rating', Number(e.target.value))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-300">
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}★</option>)}
                </select>
              </div>
              <textarea value={c.text} onChange={(e) => updateCard(activeIndex, 'text', e.target.value)} placeholder="Texto de la reseña" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-orange-300" />
              <textarea value={c.response} onChange={(e) => updateCard(activeIndex, 'response', e.target.value)} placeholder="Respuesta de AURA" rows={3} className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm resize-none bg-orange-50 focus:outline-none focus:border-orange-400" />
              {cards.length > 1 && <button onClick={() => removeCard(activeIndex)} className="text-xs text-red-400 hover:text-red-500">Eliminar</button>}
            </div>

            <button
              onClick={downloadCard}
              className="w-full py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all text-sm"
            >
              Descargar PNG
            </button>
            <p className="text-xs text-gray-400 text-center">Necesitas instalar html2canvas (primera vez tarda unos segundos)</p>
          </div>

          {/* Preview de la tarjeta */}
          <div className="lg:col-span-3 flex items-start justify-center pt-2">
            <div id="card-preview" className="w-full max-w-[500px] bg-white overflow-hidden shadow-xl" style={{ aspectRatio: '1/1', borderRadius: 32 }}>
              <div className="h-full flex flex-col">
                {/* Cabecera AURA */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-5 flex items-center gap-4">
                  <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 200 200" className="w-7 h-7" style={{ fill: '#fff' }}>
                      <circle cx="100" cy="100" r="100" />
                      <path d="M 100 25 L 110 72 L 160 72 L 120 102 L 135 150 L 100 122 L 65 150 L 80 102 L 40 72 L 90 72 Z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white text-xl font-black tracking-wide" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>AURA</div>
                    <div className="text-white/80 text-[10px] tracking-[3px] font-medium">REPUTACIÓN DIGITAL</div>
                  </div>
                  {businessName && (
                    <div className="ml-auto text-right">
                      <div className="text-white/60 text-[9px] tracking-[2px]">PARA</div>
                      <div className="text-white text-sm font-semibold">{businessName}</div>
                    </div>
                  )}
                </div>

                {/* Contenido centrado */}
                <div className="flex-1 flex flex-col justify-center px-10 py-6">
                  {c.text || c.response ? (
                    <>
                      {/* Review */}
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">{c.author ? c.author[0].toUpperCase() : '?'}</div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{c.author || 'Cliente'}</div>
                            <div className="text-lg tracking-wide" style={{ color: '#f59e0b' }}>{stars}</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl px-6 py-4">
                          <p className="text-sm text-gray-700 italic leading-relaxed">&ldquo;{c.text || 'Texto de la reseña'}&rdquo;</p>
                        </div>
                      </div>

                      {/* Respuesta AURA */}
                      {c.response && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            <span className="text-[10px] font-bold text-orange-500 tracking-[2px]">RESPUESTA AURA</span>
                          </div>
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl px-6 py-4">
                            <p className="text-sm text-gray-700 leading-relaxed">{c.response}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                      </div>
                      <p className="text-gray-400 text-sm">Rellena los datos para<br />ver la previsualización</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-10 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide">aura-online.es</span>
                  <span className="text-[10px] text-gray-300">⋆</span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide">RESEÑAS · RESPUESTAS · REPUTACIÓN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
