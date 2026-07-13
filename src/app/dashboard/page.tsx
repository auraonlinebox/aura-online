'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type ReviewStatus = 'pending' | 'published' | 'dismissed' | 'generating';
type SpamLevel = 'none' | 'suspicious' | 'spam';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  response: string;
  status: ReviewStatus;
  spam: SpamLevel;
  spamReason?: string;
}

const DEMO_REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Carlos M.',
    rating: 2,
    date: '10 jul 2026',
    text: 'La comida bien pero el servicio fatal. Estuvimos esperando 40 minutos para que nos tomaran nota y cuando llegó la cuenta nos habían cobrado platos que no pedimos. El camarero parecía estresado y ni siquiera se disculpó. Una pena porque la croqueta de jamón estaba buena.',
    response: '',
    status: 'pending',
    spam: 'none',
  },
  {
    id: '2',
    author: 'Laura G.',
    rating: 5,
    date: '8 jul 2026',
    text: 'Espectacular! Fuimos a celebrar nuestro aniversario y todo fue perfecto. El trato del personal increíble, la comida deliciosa y el ambiente muy acogedor. Repetiremos sin duda. Recomiendo el arroz con bogavante, de lo mejor que he probado.',
    response: '',
    status: 'pending',
    spam: 'none',
  },
  {
    id: '3',
    author: 'Ana R.',
    rating: 3,
    date: '5 jul 2026',
    text: 'Bien pero sin más. La carne estaba buena pero los postres muy justos. Los precios me parecen algo elevados para lo que ofrecen. El sitio está bien decorado.',
    response: '',
    status: 'pending',
    spam: 'none',
  },
  {
    id: '4',
    author: 'Mario87',
    rating: 1,
    date: '3 jul 2026',
    text: 'Nunca más. Comida fría, servicio pésimo y encima carísimo. No lo recomiendo a nadie. Mejor ir al de al lado.',
    response: '',
    status: 'pending',
    spam: 'none',
  },
  {
    id: '5',
    author: 'Marta L.',
    rating: 4,
    date: '1 jul 2026',
    text: 'Muy buena experiencia en general. El pulpo a la gallega espectacular. El único pero es que el local se queda pequeño y está muy justo de espacio entre mesas. Por lo demás genial, volveremos.',
    response: '',
    status: 'pending',
    spam: 'none',
  },
  {
    id: '6',
    author: 'Pedro S.',
    rating: 5,
    date: '28 jun 2026',
    text: 'Gran descubrimiento. Atención excelente, cocina de producto y precios razonables. El dueño viene a las mesas a preguntar cómo va todo, se agradece ese trato cercano. Volveremos seguro.',
    response: '',
    status: 'published',
    spam: 'none',
  },
  {
    id: 'spam1',
    author: 'Clara88',
    rating: 5,
    date: '12 jul 2026',
    text: 'Todo genial, muy recomendable. Volveremos sin duda. La comida espectacular y el servicio de 10.',
    response: '',
    status: 'pending',
    spam: 'none',
  },
  {
    id: 'spam2',
    author: 'Juan T.',
    rating: 1,
    date: '11 jul 2026',
    text: ' pesimo pesimo pesimo pesimo pesimo nada recomendable llamar antes de ir pesimo',
    response: '',
    status: 'pending',
    spam: 'suspicious',
    spamReason: 'Texto repetitivo, parece reseña automatizada o falsa.',
  },
];

const STARS = [1, 2, 3, 4, 5];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {STARS.map((s) => (
        <span key={s} className={`text-base ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  );
}

function SpamBadge({ level, reason }: { level: SpamLevel; reason?: string }) {
  if (level === 'none') return null;
  return (
    <span title={reason} className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full cursor-help">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
      Posible spam
    </span>
  );
}

function ReviewCard({
  review,
  onGenerate,
  onEdit,
  onApprove,
  onDismiss,
  onDelete,
}: {
  review: Review;
  onGenerate: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(review.response);

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${review.spam !== 'none' ? 'border-amber-200 bg-amber-50/30' : review.status === 'published' ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
            {review.author.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">{review.author}</span>
              <StarRating rating={review.rating} />
            </div>
            <span className="text-xs text-gray-400">{review.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SpamBadge level={review.spam} reason={review.spamReason} />
          {review.status === 'published' && <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Publicada</span>}
          {review.status === 'dismissed' && <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">Descartada</span>}
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-4 leading-relaxed">{review.text}</p>

      {review.response && !editing && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Respuesta de AURA</span>
            <button onClick={() => { setEditing(true); setEditText(review.response); }} className="text-xs text-orange-500 hover:text-orange-600">Editar</button>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{review.response}</p>
        </div>
      )}

      {editing && (
        <div className="mb-4">
          <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={4} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 resize-none" />
          <div className="flex gap-2 mt-2">
            <button onClick={() => { onEdit(review.id, editText); setEditing(false); }} className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800">Guardar</button>
            <button onClick={() => setEditing(false)} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {review.status !== 'published' && review.status !== 'dismissed' && (
          <>
            <button onClick={() => onGenerate(review.id)} disabled={review.status === 'generating'} className="text-xs px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all">
              {review.status === 'generating' ? 'Generando...' : 'Generar respuesta'}
            </button>
            <button onClick={() => { onApprove(review.id); }} disabled={!review.response} className="text-xs px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Aprobar y publicar
            </button>
            <button onClick={() => onDismiss(review.id)} className="text-xs px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-all">Ignorar</button>
          </>
        )}
        {(review.status === 'published' || review.status === 'dismissed') && (
          <button onClick={() => onDelete(review.id)} className="text-xs px-3 py-1.5 bg-white border border-gray-200 text-gray-400 rounded-lg hover:bg-gray-50 transition-all">Reabrir</button>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [reviews, setReviews] = useState<Review[]>(DEMO_REVIEWS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'spam'>('all');
  const [restaurant, setRestaurant] = useState('Restaurante El Sabor');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(restaurant);
  const [pushSub, setPushSub] = useState<PushSubscription | null>(null);
  const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'subscribed' | 'unsupported' | 'denied'>('idle');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatus('unsupported');
      return;
    }
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) { setPushSub(sub); setPushStatus('subscribed'); }
      });
    }).catch(() => setPushStatus('unsupported'));
  }, []);

  const subscribePush = useCallback(async () => {
    try {
      setPushStatus('loading');
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BAKzHfrBc9keVIdmX--lECy631JyOI1AMXaNbnsPn5TZqbmrq78qxgS5OmGEFXT44l2-dwxldORlEZS9sqFNk6U',
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
      setPushSub(sub);
      setPushStatus('subscribed');
    } catch {
      setPushStatus('denied');
    }
  }, []);

  const testNotification = useCallback(async () => {
    if (!pushSub) return;
    const demoIndex = Math.floor(Math.random() * reviews.length);
    const demo = reviews[demoIndex];
    const name = Notification.permission === 'granted' ? '' : '';
    await fetch('/api/push/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: pushSub.toJSON(),
        title: `⭐ ${demo.rating}★ — ${demo.author}`,
        body: demo.text.slice(0, 80) + (demo.text.length > 80 ? '...' : ''),
        url: '/dashboard',
      }),
    });
  }, [pushSub, reviews]);

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'published') return r.status === 'published';
    if (filter === 'spam') return r.spam !== 'none';
    return true;
  });

  const generateResponse = async (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'generating' } : r)));
    try {
      const review = reviews.find((r) => r.id === id);
      if (!review) return;
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: review.text, rating: review.rating, author: review.author }),
      });
      const data = await res.json();
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, response: data.response || 'Error al generar', status: 'pending' } : r)));
    } catch {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, response: 'Error al generar respuesta', status: 'pending' } : r)));
    }
  };

  const editResponse = (id: string, text: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, response: text } : r)));
  };

  const approveReview = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'published' } : r)));
  };

  const dismissReview = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'dismissed' } : r)));
  };

  const reopenReview = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'pending' } : r)));
  };

  const pending = reviews.filter((r) => r.status === 'pending').length;
  const published = reviews.filter((r) => r.status === 'published').length;
  const suspect = reviews.filter((r) => r.spam !== 'none').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src="/logo.svg" alt="AURA" className="h-7" />
            </Link>
            <span className="text-gray-300">|</span>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input value={tempName} onChange={(e) => setTempName(e.target.value)} className="text-sm font-semibold border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-orange-300" autoFocus />
                <button onClick={() => { setRestaurant(tempName); setEditingName(false); }} className="text-xs text-orange-500 hover:text-orange-600">✓</button>
                <button onClick={() => { setTempName(restaurant); setEditingName(false); }} className="text-xs text-gray-400 hover:text-gray-600">✗</button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-800">{restaurant}</span>
                <button onClick={() => setEditingName(true)} className="text-xs text-gray-300 hover:text-gray-500">✎</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="hidden sm:inline">Panel demo</span>
            {pushStatus === 'idle' && (
              <button onClick={subscribePush} className="hover:text-orange-500 text-gray-400">🔔 Activar notif.</button>
            )}
            {pushStatus === 'loading' && <span className="text-gray-300">⌛</span>}
            {pushStatus === 'subscribed' && (
              <button onClick={testNotification} className="hover:text-orange-500 text-emerald-500">🔔 Probar</button>
            )}
            {pushStatus === 'denied' && <span className="text-gray-300" title="Notificaciones bloqueadas">🔔 Bloqueado</span>}
            {pushStatus === 'unsupported' && <span className="text-gray-300">🔔 No compatible</span>}
            <Link href="/" className="hover:text-orange-500">Ver web</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reseñas de Google</h1>
            <p className="text-sm text-gray-500">Panel de demostración — las reseñas son simuladas</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{reviews.length}</div>
            <div className="text-xs text-gray-400">total reseñas</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button onClick={() => setFilter('all')} className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            Todas ({reviews.length})
          </button>
          <button onClick={() => setFilter('pending')} className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${filter === 'pending' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            Pendientes ({pending})
          </button>
          <button onClick={() => setFilter('published')} className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${filter === 'published' ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            Publicadas ({published})
          </button>
          <button onClick={() => setFilter('spam')} className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${filter === 'spam' ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            Spam ({suspect})
          </button>
          <div className="ml-auto text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">⚡ IA disponible</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No hay reseñas en esta categoría</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((review) => (
              <ReviewCard key={review.id} review={review} onGenerate={generateResponse} onEdit={editResponse} onApprove={approveReview} onDismiss={dismissReview} onDelete={reopenReview} />
            ))}
          </div>
        )}

        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">🧠 ¿Qué hace AURA con las reseñas extrañas?</h3>
          <ul className="text-xs text-gray-500 space-y-1.5">
            <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">●</span> <strong>Spam evidente</strong> (sin texto, repetitivo) → Se marca en amarillo. El restaurante decide si responder o ignorar.</li>
            <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">●</span> <strong>Sospechosa pero real</strong> → AURA genera una respuesta breve y cortés. El restaurante revisa y decide.</li>
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">●</span> <strong>Ofensiva o falsa</strong> → AURA sugiere respuesta profesional + ofrecer contacto privado. Se puede reportar a Google.</li>
          </ul>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400 py-4">
          Panel demo de AURA — <Link href="/" className="text-orange-500 hover:text-orange-600 underline">Volver a la web</Link>
        </div>
      </div>
    </div>
  );
}
