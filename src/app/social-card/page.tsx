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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; Volver</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Generar tarjetas para Instagram</h1>
        <p className="text-sm text-gray-500 mb-6">Crea tarjetas visuales con reseñas + respuestas de AURA. Haz screenshot y súbelas a Instagram.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-medium">Nombre del negocio</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300" placeholder="Ej: Corto y Cambio" />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500 font-medium">Tarjetas ({cards.length}/5)</label>
              <div className="flex gap-1">
                {cards.map((_, i) => (
                  <button key={i} onClick={() => setActiveIndex(i)} className={`w-7 h-7 rounded-full text-xs font-medium ${i === activeIndex ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{i + 1}</button>
                ))}
                {cards.length < 5 && <button onClick={addCard} className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 text-xs font-bold">+</button>}
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
              <div className="flex gap-2">
                <input type="text" value={c.author} onChange={(e) => updateCard(activeIndex, 'author', e.target.value)} placeholder="Nombre del cliente" className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
                <select value={c.rating} onChange={(e) => updateCard(activeIndex, 'rating', Number(e.target.value))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}★</option>)}
                </select>
              </div>
              <textarea value={c.text} onChange={(e) => updateCard(activeIndex, 'text', e.target.value)} placeholder="Texto de la reseña" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none" />
              <textarea value={c.response} onChange={(e) => updateCard(activeIndex, 'response', e.target.value)} placeholder="Respuesta de AURA" rows={3} className="w-full px-3 py-2 border border-orange-200 rounded-xl text-sm resize-none bg-orange-50" />
              {cards.length > 1 && <button onClick={() => removeCard(activeIndex)} className="text-xs text-red-400 hover:text-red-500">Eliminar tarjeta {activeIndex + 1}</button>}
            </div>
          </div>

          {/* Preview de la tarjeta */}
          <div className="flex items-start justify-center pt-2">
            <div id="card-preview" className="w-[400px] bg-white rounded-3xl shadow-lg overflow-hidden" style={{ aspectRatio: '1/1' }}>
              <div className="h-full flex flex-col">
                <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-4 flex items-center gap-3">
                  <svg viewBox="0 0 320 120" className="h-8" style={{ fill: '#fff' }}>
                    <path d="M38 95V25h48c20 0 34 12 34 30 0 18-14 29-34 29H53v11H38zm15-24h28c12 0 20-6 20-16s-8-16-20-16H53v32zM128 95V25h56c28 0 46 18 46 35 0 17-18 35-46 35h-56zm15-13h38c21 0 34-12 34-22 0-10-13-22-34-22h-38v44zM240 95V25h15v57h44v13h-59z" />
                  </svg>
                  <span className="text-white text-sm font-semibold tracking-wide">REPUTACIÓN DIGITAL</span>
                </div>
                <div className="flex-1 flex flex-col justify-center px-8 py-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-base font-bold text-gray-500">{c.author ? c.author[0].toUpperCase() : '?'}</div>
                      <div>
                        <p className="text-base font-semibold text-gray-900">{c.author || 'Cliente'}</p>
                        <p className="text-xs text-gray-400">{businessName || 'Nombre del negocio'}</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold" style={{ color: '#f59e0b' }}>{stars}</span>
                  </div>
                  <div className="bg-gray-50 rounded-2xl px-5 py-4 mb-4">
                    <p className="text-sm text-gray-600 italic leading-relaxed">&ldquo;{c.text || 'Texto de la reseña'}&rdquo;</p>
                  </div>
                  {c.response && (
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className="text-xs font-semibold text-orange-600 tracking-wide">RESPUESTA AURA</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{c.response}</p>
                    </div>
                  )}
                </div>
                <div className="px-8 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">aura-online.es</span>
                  <span className="text-xs font-semibold text-orange-500">AURA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">Haz screenshot a la tarjeta desde el móvil y súbela a Instagram. Usa varias tarjetas para un carrusel.</p>
        </div>
      </div>
    </div>
  );
}
