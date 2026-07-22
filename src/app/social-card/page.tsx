'use client';

import { useState, useEffect } from 'react';

const TIMES = ['hace 2 horas', 'hace 5 horas', 'hace 1 día', 'hace 2 días', 'hace 3 días', 'hace 5 días', 'hace 1 semana', 'hace 2 semanas', 'hace 3 semanas', 'hace 1 mes'];
const EMOJIS = ['😊', '🙌', '👏', '💪', '⭐', '❤️', '🔥', '🎯', '👍', '🌟', '🍽️', '🤝', '✅', '🙏', '✨', '🎉', '💎', '🤩', '😍', '💯', '🫶', '👀', '🏆', '🚗', '💇', '🦷', '🧹', '🌿', '🐾', '🎊'];

const BASE_EXAMPLES = [
  { business: 'Restaurante Casa Blanca', author: 'Laura M.', rating: 5, text: 'Comida espectacular y trato increíble. Volveremos sin duda. El mejor restaurante de la zona.', response: '', time: 'hace 2 horas' },
  { business: 'Taller Mecánico Pérez', author: 'Jorge T.', rating: 5, text: 'Dejé el coche por una revisión y quedó como nuevo. Precio justo y me lo dejaron listo en el día. Muy recomendable.', response: '', time: 'hace 5 horas' },
  { business: 'Peluquería Carmen', author: 'Marta F.', rating: 5, text: 'Me hicieron un corte y un brushing espectacular. Salí como nueva. El trato increíble, volveré sin duda.', response: '', time: 'hace 1 día' },
  { business: 'Hotel Miramar', author: 'Raúl G.', rating: 4, text: 'Habitación limpia, cama cómoda y buen desayuno. La única pega es que el aire acondicionado hacía ruido.', response: '', time: 'hace 2 días' },
  { business: 'Clínica Dental Soriano', author: 'Elena V.', rating: 5, text: 'Muy profesionales y cercanos. Me hicieron un blanqueamiento y el resultado es increíble. Sin dolor y muy rápido.', response: '', time: 'hace 3 días' },
  { business: 'Cafetería La Central', author: 'David P.', rating: 4, text: 'El mejor café del barrio. Las tostadas enormes y el personal muy simpático. A veces hay cola pero merece la pena.', response: '', time: 'hace 5 días' },
  { business: 'Clínica FisioSalud', author: 'Sofía R.', rating: 5, text: 'Llevaba meses con dolor de espalda y en 4 sesiones noté una mejoría increíble. Muy agradecida con todo el equipo.', response: '', time: 'hace 1 semana' },
  { business: 'Lavandería EcoClean', author: 'Antonio L.', rating: 3, text: 'Ropa limpia y bien doblada, pero tardaron un día más de lo prometido. Me avisaron pero igualmente incómodo.', response: '', time: 'hace 2 semanas' },
  { business: 'Tienda de Mascotas Patitas', author: 'Cristina B.', rating: 5, text: 'Compré comida para mi perro y me asesoraron genial. Precios buenos y atención excelente. Mi perro alucina con el pienso.', response: '', time: 'hace 3 semanas' },
  { business: 'Barbería King\'s', author: 'Álvaro M.', rating: 5, text: 'Me arreglaron la barba y el pelo de 10. Ambiente chulo, música guay y te atienden genial. Mi barbería de confianza ya.', response: '', time: 'hace 1 mes' },
];

export default function SocialCardPage() {
  const [examples, setExamples] = useState(BASE_EXAMPLES);
  const [generating, setGenerating] = useState(true);
  const [cards, setCards] = useState(BASE_EXAMPLES.slice(0, 5));
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [personality, setPersonality] = useState(1.3);
  const [selectedEmojis, setSelectedEmojis] = useState(['😊', '🙌', '👏']);

  useEffect(() => {
    fetch('/api/generate-examples', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examples: BASE_EXAMPLES, personality: 1.3, emojis: ['😊', '🙌', '👏'] }),
    }).then(r => r.json()).then(data => {
      if (data.examples) {
        setExamples(data.examples);
        setCards(data.examples.slice(0, showAll ? 10 : 5));
      }
    }).catch(() => {}).finally(() => setGenerating(false));
  }, []);

  const displayCards = showAll ? examples : cards;

  const addCard = () => {
    if (displayCards.length >= 10) return;
    const next = examples[displayCards.length] || { business: '', author: '', rating: 5, text: '', response: '', time: 'hace 2 horas' };
    setCards([...displayCards, next]);
  };

  const removeCard = (i: number) => {
    if (displayCards.length <= 1) return;
    const copy = displayCards.filter((_, idx) => idx !== i);
    setCards(copy);
    if (activeIndex >= copy.length) setActiveIndex(copy.length - 1);
  };

  const updateCard = (i: number, field: string, value: string | number) => {
    const copy = [...displayCards];
    (copy[i] as any)[field] = value;
    setCards(copy);
  };

  const c = displayCards[activeIndex] || { business: '', author: '', rating: 5, text: '', response: '' };
  const stars = '★'.repeat(c.rating) + '☆'.repeat(5 - c.rating);

  const captureCard = async (el: HTMLElement) => {
    const h2c = await import('html2canvas');
    return h2c.default(el, { scale: 2, backgroundColor: '#fff', useCORS: true });
  };

  const downloadCard = async (index?: number) => {
    const idx = index ?? activeIndex;
    const card = displayCards[idx];
    if (!card) return;
    setDownloading(true);
    try {
      if (index !== undefined && index !== activeIndex) setActiveIndex(index);
      await new Promise(r => setTimeout(r, 300));
      const el = document.getElementById('card-preview');
      if (!el) return;
      const canvas = await captureCard(el);
      const link = document.createElement('a');
      link.download = `aura-${(card.business || 'card').replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download error', e);
    }
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; Volver</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Generador de tarjetas Instagram</h1>
        <p className="text-sm text-gray-500 mb-6">Crea tarjetas con reseñas y respuestas de AURA. Descárgalas como PNG.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-500 font-medium">Tarjetas ({displayCards.length}/10)</label>
                <div className="flex gap-2">
                  {!showAll && displayCards.length < 10 && <button onClick={addCard} className="text-xs text-orange-500 hover:text-orange-600 font-medium">+ Añadir</button>}
                  <button onClick={() => { setShowAll(!showAll); setActiveIndex(0); }} className={`text-xs font-medium ${showAll ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>
                    {showAll ? 'Modo edición' : 'Ver 10'}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {displayCards.map((card, i) => (
                  <button key={i} onClick={() => setActiveIndex(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all truncate max-w-[180px] ${i === activeIndex ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <span className="text-[10px] opacity-60 mr-1">{i + 1}.</span>
                    {card.business || card.author || 'Nueva'}
                  </button>
                ))}
              </div>
            </div>

            {!showAll && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-400">Negocio</label>
                  <input type="text" value={c.business} onChange={(e) => updateCard(activeIndex, 'business', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-300" placeholder="Nombre del negocio" />
                </div>
                <div className="flex gap-2">
                  <input type="text" value={c.author} onChange={(e) => updateCard(activeIndex, 'author', e.target.value)} placeholder="Cliente" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <select value={c.rating} onChange={(e) => updateCard(activeIndex, 'rating', Number(e.target.value))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}★</option>)}
                  </select>
                </div>
                <textarea value={c.text} onChange={(e) => updateCard(activeIndex, 'text', e.target.value)} placeholder="Texto de la reseña" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
                <div className="flex gap-2 items-center">
                  <label className="text-xs text-gray-400">Tiempo:</label>
                  <select value={c.time || 'hace 2 horas'} onChange={(e) => updateCard(activeIndex, 'time', e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <textarea value={c.response} onChange={(e) => updateCard(activeIndex, 'response', e.target.value)} placeholder="Respuesta de AURA" rows={3} className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm resize-none bg-orange-50" />
                <button onClick={async () => { try { const r = await fetch('/api/generate-examples', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ examples: [{ text: c.text, author: c.author, business: c.business }], personality, emojis: selectedEmojis }) }); const d = await r.json(); if (d.examples?.[0]?.response) updateCard(activeIndex, 'response', d.examples[0].response); } catch {} }} className="text-xs text-orange-500 hover:text-orange-600 font-medium">🔄 Regenerar respuesta</button>
                {displayCards.length > 1 && <button onClick={() => removeCard(activeIndex)} className="text-xs text-red-400 hover:text-red-500">Eliminar</button>}
              </div>
            )}

            {/* Configurator */}
            {!showAll && (
              <details className="bg-white border border-gray-200 rounded-xl p-4">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none font-medium">Ajustes de personalización</summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-gray-500 font-medium">Personalidad</label>
                      <span className="text-[11px] text-gray-400">{personality <= 0.8 ? 'Conservadora' : personality <= 1.2 ? 'Equilibrada' : 'Creativa'}</span>
                    </div>
                    <input type="range" min="0.5" max="1.5" step="0.1" value={personality} onChange={(e) => setPersonality(parseFloat(e.target.value))} className="w-full accent-orange-500" />
                    <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
                      <span>0.5</span><span>0.7</span><span>0.9</span><span>1.1</span><span>1.3</span><span>1.5</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium block mb-1">Emojis en respuestas <span className="text-gray-300 font-normal">(solo si encajan)</span></label>
                    <div className="flex flex-wrap gap-1">
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => setSelectedEmojis(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])} className={`w-7 h-7 text-sm flex items-center justify-center rounded-md border transition-all ${selectedEmojis.includes(e) ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200 opacity-40 hover:opacity-80'}`}>{e}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            )}

            {!showAll && (
              <button onClick={() => downloadCard()} disabled={downloading} className="w-full py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all text-sm disabled:opacity-50">
                {downloading ? 'Descargando...' : 'Descargar esta tarjeta'}
              </button>
            )}

            {!showAll && (
              <button
                onClick={async () => {
                  setDownloading(true);
                  for (let i = 0; i < displayCards.length; i++) {
                    setActiveIndex(i);
                    await new Promise(r => setTimeout(r, 400));
                    const el = document.getElementById('card-preview');
                    if (!el) continue;
                    try {
                      const canvas = await captureCard(el);
                      const link = document.createElement('a');
                      link.download = `aura-${(displayCards[i].business || 'card').replace(/\s+/g, '-')}.png`;
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    } catch {}
                    await new Promise(r => setTimeout(r, 400));
                  }
                  setDownloading(false);
                }}
                disabled={downloading}
                className="w-full py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900 transition-all text-sm disabled:opacity-50"
              >
                {downloading ? 'Descargando...' : `Descargar todas (${displayCards.length})`}
              </button>
            )}

            {generating && <p className="text-xs text-orange-500 text-center py-2 animate-pulse">Generando respuestas con AURA...</p>}
            {showAll && (
              <p className="text-sm text-gray-500 text-center py-4">
                Vista general — {examples.length} ejemplos con respuestas reales de AURA.
              </p>
            )}
          </div>

          <div className="lg:col-span-3 flex items-start justify-center pt-2">
            <div
              id="card-preview"
              className="bg-white overflow-hidden shadow-xl"
              style={{ width: 500, height: 500, borderRadius: 32 }}
            >
              <div className="h-full flex flex-col overflow-hidden">
                <div className="flex-shrink-0 flex items-center justify-center pt-6 pb-2">
                  <img src="https://aura-online.es/logo.svg?v=2" alt="AURA" className="h-10" />
                </div>

                <div className="flex-1 flex flex-col px-6 gap-2.5 overflow-hidden">
                  {(c.text || c.response) ? (
                    <>
                      <div className="bg-gray-50 rounded-2xl px-5 py-4 flex-shrink-0">
                        <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                            {c.author ? c.author[0].toUpperCase() : '?'}
                          </div>
                          <div className="flex-1">
                            <div style={{ color: '#1f2937', fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{c.author || 'Cliente'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {[1,2,3,4,5].map(i => (
                                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= c.rating ? '#eab308' : '#d1d5db'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                              ))}
                              <span style={{ color: '#9ca3af', fontSize: 10, marginLeft: 4 }}>{c.time || 'hace 2 horas'}</span>
                            </div>
                          </div>
                          <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path fill="#9ca3af" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed" style={{ textAlign: 'justify' }}>&ldquo;{c.text || 'Texto de la reseña'}&rdquo;</p>
                      </div>
                      {c.response && (
                        <div className="flex-shrink-0" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', borderRadius: 16, border: '2px solid #f97316', padding: '14px 16px', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <span style={{ display: 'inline-flex', width: 18, height: 18, background: '#f97316', color: '#fff', borderRadius: '50%', fontSize: 10, fontWeight: 700, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>A</span>
                            <span style={{ color: '#ea580c', fontWeight: 700, fontSize: 11 }}>RESPUESTA DE AURA</span>
                          </div>
                        <p className="text-sm text-gray-700 leading-relaxed" style={{ textAlign: 'justify' }}>{c.response}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        </div>
                        <p className="text-gray-400 text-sm">Rellena los datos para ver la tarjeta</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-center pt-2 pb-5" style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2.5, color: '#d97706' }}>
                  AURA · REPUTACIÓN DIGITAL
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}