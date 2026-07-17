'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const PLANS = [
  { name: 'Básico', price: '29,90€', annual: '299€', desc: 'Para autónomos y pequeños negocios', responses: '50 respuestas/mes', features: ['Respuestas personalizadas', '3 reseñas simultáneas', 'Soporte email'] },
  { name: 'Pro', price: '39,90€', annual: '399€', desc: 'Para negocios en crecimiento', popular: true, responses: '100 respuestas/mes', features: ['Todo lo de Básico', '10 reseñas simultáneas', 'Soporte prioritario', 'Dashboard avanzado'] },
  { name: 'Premium', price: '49,90€', annual: '499€', desc: 'Para cadenas y franquicias', responses: 'Ilimitadas', features: ['Todo lo de Pro', 'Reseñas ilimitadas', 'API exclusiva', 'Gestor de cuentas'] },
];

export default function ProspectPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<{ businessName: string; reviews: { author: string; text: string; rating: number }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generations, setGenerations] = useState(0);
  const [showPlans, setShowPlans] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`aura_prospect_${slug}`);
    setGenerations(stored ? parseInt(stored, 10) : 0);
  }, [slug]);

  useEffect(() => {
    fetch(`/api/prospect?slug=${slug}`)
      .then((r) => { if (!r.ok) throw new Error('not_found'); return r.json(); })
      .then((d) => setData(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const generateResponse = async (review: { author: string; text: string; rating: number }, idx: number) => {
    const key = `${idx}`;
    if (generations >= 3) { setShowPlans(true); return; }
    setLoadingId(key);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: review.text, rating: review.rating, author: review.author, source: 'prospect' }),
      });
      const json = await res.json();
      if (res.status === 429 && json.limitExceeded) { setShowPlans(true); return; }
      const newGens = generations + 1;
      setGenerations(newGens);
      localStorage.setItem(`aura_prospect_${slug}`, String(newGens));
      setResponses((prev) => ({ ...prev, [key]: json.response }));
    } catch { /* ignore */ } finally { setLoadingId(null); }
  };

  const startEdit = (key: string) => {
    setEditingId(key);
    setEditText(responses[key] || '');
  };

  const saveEdit = (key: string) => {
    setResponses((prev) => ({ ...prev, [key]: editText }));
    setEditingId(null);
  };

  const publish = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
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
        <p className="text-gray-500 mb-6">Este enlace no es válido o ha expirado. Solicita uno nuevo a tu asesor.</p>
        <a href="/" className="inline-block px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all">Ir a AURA</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; AURA</a>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">{data?.businessName}</h1>
        <p className="text-gray-500 mt-1 mb-8">Estas son las reseñas sin responder de tu negocio. Pulsa "Generar respuesta" para ver cómo AURA las responde por ti.</p>

        {generations >= 3 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-6 flex items-center justify-between">
            <span className="text-sm text-orange-800">Has usado tus 3 generaciones gratuitas.</span>
            <button onClick={() => setShowPlans(true)} className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-all">Ver planes</button>
          </div>
        )}

        <div className="space-y-4">
          {data?.reviews.map((review, idx) => {
            const key = `${idx}`;
            const hasResponse = responses[key];
            return (
              <div key={key} className="p-5 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">{review.author[0]}</div>
                    <span className="font-medium text-gray-900 text-sm">{review.author}</span>
                  </div>
                  <span className="text-sm">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{review.text}</p>
                {!hasResponse ? (
                  <button
                    onClick={() => generateResponse(review, idx)}
                    disabled={loadingId === key}
                    className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50"
                  >
                    {loadingId === key ? 'Generando...' : 'Generar respuesta'}
                  </button>
                ) : editingId === key ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(key)} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all">Guardar</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="text-sm text-gray-700">{responses[key]}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => publish(responses[key], key)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-all"
                      >
                        {copiedId === key ? '¡Copiado!' : 'Publicar'}
                      </button>
                      <button onClick={() => startEdit(key)} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">Editar</button>
                      <button
                        onClick={() => generateResponse(review, idx)}
                        disabled={loadingId === key}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                      >
                        Generar otra
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">{3 - Math.min(generations, 3)} de 3 generaciones gratuitas restantes</p>
          {generations < 3 && (
            <button onClick={() => setShowPlans(true)} className="px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all">
              Quiero AURA para mi negocio
            </button>
          )}
        </div>
      </div>

      {showPlans && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPlans(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPlans(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Planes de AURA</h2>
            <p className="text-sm text-gray-500 mb-6">Elige el plan que mejor se adapte a tu negocio</p>
            <div className="space-y-4">
              {PLANS.map((plan) => (
                <div key={plan.name} className={`p-4 rounded-xl border-2 ${plan.popular ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                  {plan.popular && <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">MÁS POPULAR</span>}
                  <div className="flex items-center justify-between mt-1">
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-sm text-gray-500">/mes</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                  <p className="text-xs text-orange-500 font-medium mt-1">{plan.responses}</p>
                  <p className="text-xs text-green-600 font-medium mt-0.5">Anual: {plan.annual} (2 meses gratis)</p>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map((f, i) => <li key={i} className="text-xs text-gray-600 flex items-center gap-1"><span className="text-green-500">✓</span> {f}</li>)}
                  </ul>
                  <button
                    onClick={() => { setPaying(plan.name); fetch('/api/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: plan.name.toLowerCase() }) }).then((r) => r.json()).then((d) => { if (d.url) window.location.href = d.url; else { alert('Pago no disponible aún. Contáctanos por WhatsApp.'); setPaying(null); } }).catch(() => setPaying(null)); }}
                    disabled={paying === plan.name}
                    className="w-full mt-3 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all text-sm disabled:opacity-50"
                  >
                    {paying === plan.name ? 'Redirigiendo...' : `Contratar ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">¿Dudas? <a href="/" onClick={(e) => { e.preventDefault(); setShowPlans(false); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-orange-500 underline hover:text-orange-600">Contáctanos</a></p>
          </div>
        </div>
      )}

      {copiedId && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm shadow-lg z-50">
          Pégala en Google Business Profile para publicarla.
        </div>
      )}
    </div>
  );
}
