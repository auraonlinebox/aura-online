'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientDashboard({ params }: { params: Promise<{ clientId: string }> }) {
  const [clientId, setClientId] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [googleConnected, setGoogleConnected] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notificationGranted, setNotificationGranted] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setClientId(p.clientId);
      if (new URLSearchParams(window.location.search).get('google_connected')) {
        setGoogleConnected(true);
      }
    });
  }, [params]);

  useEffect(() => {
    if (!clientId) return;
    fetch(`/api/google/reviews?clientId=${clientId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.needsAuth) { setError('not_connected'); return; }
        setReviews(data.reviews || []);
        setLocationName(data.locationName || '');
        setGoogleConnected(true);
      })
      .catch(() => setError('not_connected'))
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationGranted(true);
    }
  }, []);

  const requestNotification = async () => {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setNotificationGranted(true);
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
          ) as any,
        });
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub, clientId }),
        });
      }
    }
  };

  const generateResponse = async (review: any) => {
    setLoadingId(review.id);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review: review.text,
          rating: review.rating,
          author: review.author,
          source: 'dashboard',
        }),
      });
      const data = await res.json();
      setResponses((prev) => ({ ...prev, [review.id]: data.response || 'Error' }));
    } catch {
      setResponses((prev) => ({ ...prev, [review.id]: 'Error al generar' }));
    }
    setLoadingId(null);
  };

  const publishReply = async (review: any) => {
    const text = responses[review.id] || review.response;
    if (!text) return;
    setPublishingId(review.id);
    try {
      const res = await fetch('/api/google/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, reviewId: review.id, reply: text, locationName }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, response: text } : r));
        setCopiedId(review.id);
        setTimeout(() => setCopiedId(null), 3000);
      } else {
        alert(data.error || 'Error al publicar');
      }
    } catch {
      alert('Error de conexión al publicar');
    }
    setPublishingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="AURA" className="h-10" />
          </Link>
          <div className="flex items-center gap-3">
            {!notificationGranted && 'Notification' in window && (
              <button onClick={requestNotification} className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all">
                Activar notificaciones
              </button>
            )}
            {notificationGranted && (
              <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Notificaciones activas</span>
            )}
            <span className="text-xs font-semibold text-gray-800">Dashboard {clientId}</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando reseñas...</div>
        ) : error === 'not_connected' ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M12 14a4 4 0 004-4V6a4 4 0 00-8 0v4a4 4 0 004 4z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Conecta tu Google Business</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Para gestionar tus reseñas, primero conecta tu perfil de empresa de Google.</p>
            <a href={`/api/google/auth?clientId=${clientId}`} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all shadow-lg">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Conectar con Google
            </a>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Reseñas de Google</h1>
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{reviews.length} reseñas</span>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => {
                const hasResponse = responses[review.id] || review.response;
                const isGenerating = loadingId === review.id;

                return (
                  <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                        {review.author.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900">{review.author}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={`text-sm ${s <= review.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                            ))}
                          </div>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                            {new Date(review.date).toLocaleDateString('es')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.text}</p>

                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">A</div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Respuesta de AURA</span>
                      </div>

                      {review.response && !responses[review.id] ? (
                        <p className="text-sm text-gray-500 italic bg-gray-50 rounded-lg p-3 border border-gray-100">
                          Ya respondida: {review.response}
                        </p>
                      ) : editingId === review.id ? (
                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full text-sm text-gray-700 leading-relaxed bg-orange-50 rounded-lg p-3 border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-y min-h-[80px]" rows={3} />
                      ) : responses[review.id] ? (
                        <p className="text-sm text-gray-700 leading-relaxed bg-orange-50 rounded-lg p-3 border border-orange-100">
                          {responses[review.id]}
                        </p>
                      ) : (
                        <button onClick={() => generateResponse(review)} disabled={isGenerating} className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-all">
                          {isGenerating ? 'Generando respuesta...' : 'Generar respuesta con AURA'}
                        </button>
                      )}

                      {(responses[review.id] || review.response) && (
                        <div className="flex gap-2 mt-2">
                          {editingId === review.id ? (
                            <>
                              <button onClick={() => { setResponses((prev) => ({ ...prev, [review.id]: editText })); setEditingId(null); }} className="text-xs px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all">
                                Guardar
                              </button>
                              <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all">
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditText(responses[review.id] || review.response); setEditingId(review.id); }} className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-all">
                                Editar
                              </button>
                              <button onClick={() => generateResponse(review)} disabled={isGenerating} className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all">
                                {isGenerating ? 'Generando...' : 'Regenerar'}
                              </button>
                              <button onClick={() => publishReply(review)} disabled={publishingId === review.id} className="text-xs px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-all">
                                {publishingId === review.id ? 'Publicando...' : copiedId === review.id ? '¡Publicada!' : 'Publicar en Google'}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {copiedId && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-sm px-5 py-3 rounded-xl shadow-lg">
          Respuesta publicada en Google Business Profile
        </div>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
