'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const PLANS = [
  { name: 'Básico', price: '29,90€', annual: '299€', desc: 'Para autónomos y pequeños negocios', features: ['Respuestas personalizadas', 'Hasta 50 respuestas/mes', 'Soporte email'] },
  { name: 'Pro', price: '39,90€', annual: '399€', desc: 'Para negocios en crecimiento', popular: true, features: ['Todo lo de Básico', 'Hasta 100 respuestas/mes', 'Soporte prioritario', 'Estadísticas'] },
  { name: 'Premium', price: '49,90€', annual: '499€', desc: 'Para cadenas y franquicias', features: ['Todo lo de Pro', 'Respuestas ilimitadas', 'API exclusiva', 'Gestor de cuentas'] },
];

export default function ProspectPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<{ businessName: string; reviews: { author: string; text: string; rating: number; response?: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/prospect?slug=${slug}`)
      .then((r) => { if (!r.ok) throw new Error('not_found'); return r.json(); })
      .then((d) => setData(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const regenerate = async (review: { author: string; text: string; rating: number; response?: string }, idx: number) => {
    setRegeneratingId(`${idx}`);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: review.text, rating: review.rating, author: review.author, source: 'prospect' }),
      });
      const json = await res.json();
      if (json.response && data) {
        const copy = { ...data };
        copy.reviews = [...copy.reviews];
        copy.reviews[idx] = { ...copy.reviews[idx], response: json.response };
        setData(copy);
      }
    } catch { /* ignore */ } finally { setRegeneratingId(null); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
      <div className="animate-spin w-8 h-8 border-4 border-orange-300 border-t-orange-500 rounded-full" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace no encontrado</h1>
        <p className="text-gray-500 mb-6">Este enlace no es válido o ha expirado.</p>
        <a href="/" className="inline-block px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all">Ir a AURA</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">{data?.businessName}</h1>
          <p className="text-gray-500 mt-2">Así responde AURA a tus reseñas de Google</p>
        </div>

        <div className="space-y-6">
          {data?.reviews.map((review, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">{review.author[0]}</div>
                    <span className="font-medium text-gray-900 text-sm">{review.author}</span>
                  </div>
                  <span className="text-sm">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="text-sm text-gray-600 italic mb-4">"{review.text}"</p>
                {review.response ? (
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-xs font-medium text-orange-600">Respuesta de AURA</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.response}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => regenerate(review, idx)}
                    disabled={regeneratingId === `${idx}`}
                    className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50"
                  >
                    {regeneratingId === `${idx}` ? 'Generando...' : 'Generar respuesta'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">¿Te gusta lo que ves?</h2>
          <p className="text-gray-500 mb-6">AURA responde automáticamente a todas tus reseñas de Google. Mejora tu reputación online sin esfuerzo.</p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all text-base"
          >
            Probar AURA gratis 7 días
          </a>
          <p className="text-xs text-gray-400 mt-3">Sin compromiso. Sin tarjeta.</p>
        </div>
      </div>
    </div>
  );
}
