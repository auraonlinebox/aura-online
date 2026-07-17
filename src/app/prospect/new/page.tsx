'use client';

import { useState } from 'react';

export default function NewProspect() {
  const [businessName, setBusinessName] = useState('');
  const [reviews, setReviews] = useState([{ author: '', text: '', rating: 5 }]);
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const addReview = () => {
    if (reviews.length >= 6) return;
    setReviews([...reviews, { author: '', text: '', rating: 5 }]);
  };

  const removeReview = (i: number) => {
    if (reviews.length <= 1) return;
    setReviews(reviews.filter((_, idx) => idx !== i));
  };

  const updateReview = (i: number, field: string, value: string | number) => {
    const copy = [...reviews];
    (copy[i] as any)[field] = value;
    setReviews(copy);
  };

  const generate = async () => {
    if (!businessName.trim()) return alert('Introduce el nombre del negocio');
    const valid = reviews.every((r) => r.author.trim() && r.text.trim());
    if (!valid) return alert('Todas las reseñas necesitan autor y texto');
    setLoading(true);
    setSlug('');
    try {
      const res = await fetch('/api/prospect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          reviews: reviews.map((r) => ({ ...r, rating: Number(r.rating) })),
        }),
      });
      const data = await res.json();
      setSlug(data.url);
    } catch {
      alert('Error al generar el enlace');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; Volver</a>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Nuevo prospecto</h1>
        <p className="text-gray-500 mb-8">Pega las reseñas sin contestar y genera un enlace único para tu prospecto.</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium">Nombre del negocio</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              placeholder="Ej: Corto y Cambio"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500 font-medium">Reseñas ({reviews.length}/6)</label>
              {reviews.length < 6 && (
                <button onClick={addReview} className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                  + Añadir reseña
                </button>
              )}
            </div>
            {reviews.map((r, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-xl bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                  {reviews.length > 1 && (
                    <button onClick={() => removeReview(i)} className="text-xs text-red-400 hover:text-red-500">Eliminar</button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={r.author}
                    onChange={(e) => updateReview(i, 'author', e.target.value)}
                    placeholder="Autor"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300"
                  />
                  <select
                    value={r.rating}
                    onChange={(e) => updateReview(i, 'rating', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-orange-300"
                  >
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'⭐'.repeat(n)}</option>)}
                  </select>
                </div>
                <textarea
                  value={r.text}
                  onChange={(e) => updateReview(i, 'text', e.target.value)}
                  placeholder="Texto de la reseña"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 resize-none"
                />
              </div>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar enlace para prospecto'}
          </button>

          {slug && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-2">
              <p className="text-sm text-green-800 font-medium">¡Enlace generado!</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={slug}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-all whitespace-nowrap"
                >
                  {copied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="text-xs text-green-600">Comparte este enlace con tu prospecto para que vea cómo funciona AURA con sus propias reseñas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
