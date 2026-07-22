'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const REVIEWS = [
  {
    author: 'Marta L.',
    rating: 5,
    date: 'hace 2 meses',
    text: 'María me mimó durante 5 horas para encontrar el color exacto que yo quería en unas balayage. Leyó mi mente y como guinda me cortó el pelo dándole la mejor forma para dar más vida a mis rizos. Llevo 5 años viviendo en Madrid y siento que por fin he encontrado mi peluquería. Gracias.',
    response: 'Marta, tus palabras nos llegan al corazón. María es una artista y se alegrará muchísimo de saber que has conectado con su trabajo. Para nosotras no hay nada más bonito que un cliente encuentre su lugar. Te esperamos con los brazos abiertos.',
  },
  {
    author: 'Giuliana R.',
    rating: 5,
    date: 'hace 4 meses',
    text: 'Mi experiencia en Corto y Cambio fue espectacular. Fui con mi cabello largo y el deseo de un corte pixie, un cambio extremo para mi cabello abundante y rizado. Igor me atendió con mucho esmero, una persona experta con una técnica asombrosa. Entendió mis deseos perfectamente y me dejó completamente satisfecha.',
    response: 'Giuliana, gracias por confiar en nosotros para un cambio tan importante. Igor recuerda tu visita con mucho cariño. Nos encanta cuando un cliente se atreve y sale feliz. Un abrazo enorme y hasta pronto.',
  },
  {
    author: 'Ana M.',
    rating: 4,
    date: 'hace 1 mes',
    text: 'No conocía la peluquería, la encontré buscando en internet. Me atendió Pablo y ha sido muy agradable en todo momento, entendió perfectamente lo que le pedía y consiguió el resultado que buscaba. Pocas veces salgo muy contenta de una peluquería, pero hoy ha sido así.',
    response: 'Ana, nos alegra muchísimo que te llevaras esa buena sensación. Pablo es un gran profesional y se esfuerza cada día por entender a cada cliente. Esperamos verte de nuevo por aquí cuando quieras mimarte un poco.',
  },
  {
    author: 'Carlos G.',
    rating: 3,
    date: 'hace 1 semana',
    text: 'El corte de pelo está bien, pero me pareció caro para lo que es. 35€ por un corte de caballero me parece excesivo. El peluquero fue agradable eso sí, pero no sé si repetiré por el precio.',
    response: 'Carlos, gracias por tu sinceridad. Tomamos nota de tu comentario sobre los precios. Nos esforzamos por ofrecer la mejor calidad y productos profesionales, pero entendemos que el presupuesto importa. Si te animas a volver, pregúntanos por nuestras promociones. Un saludo.',
  },
  {
    author: 'Laura S.',
    rating: 2,
    date: 'hace 2 semanas',
    text: 'Pedí cita para unas mechas y llegué puntual pero me hicieron esperar 25 minutos. El resultado de las mechas no fue exactamente lo que pedí, el tono quedó más subido de lo que quería. La chica que me atendió fue simpática pero creo que no supo decirme que no era lo que buscaba.',
    response: 'Laura, lamentamos la espera y que el resultado no fuera el esperado. Te agradecemos que lo compartas porque nos ayuda a mejorar. Si te apetece, pásate por el salón para que podamos verlo juntos y ajustarlo a tu gusto. Queremos que salgas contenta. Un abrazo.',
  },
  {
    author: 'Patricia N.',
    rating: 5,
    date: 'hace 3 meses',
    text: 'Estuve hace dos días, me atendió María. No puedo estar más contenta con el resultado, no pudo captar mejor lo que quería hacerme. María es súper profesional, perfeccionista y le pone mucho cariño además de ir explicándote y asesorando. Volveré sin duda.',
    response: 'Patricia, gracias por tomarte el tiempo de escribirnos. María es así, una perfeccionista nata. Nos alegramos de que lo valores y de que te sintieras en buenas manos. Te esperamos cuando quieras.',
  },
];

const BUSINESS_TYPES = ['Restaurante', 'Peluquería', 'Taller mecánico', 'Clínica dental', 'Fisioterapia', 'Inmobiliaria', 'Hotel', 'Tienda', 'Academia', 'Veterinario', 'Jardinería', 'Limpiezas', 'Otros'];

const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    price: '19,90',
    annual: '199 €/año',
    desc: 'Para negocios que empiezan',
    features: ['Respuestas personalizadas', 'Revisión manual', 'Hasta 50 reseñas/mes', 'Análisis de palabras clave', 'Soporte email'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29,90',
    annual: '299 €/año',
    desc: 'Para negocios con volumen',
    features: ['AURA personalizada', 'Revisión manual', 'Hasta 200 reseñas/mes', 'Análisis de palabras clave', 'Soporte prioritario'],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '39,90',
    annual: '399 €/año',
    desc: 'Para despreocuparse',
    features: ['AURA personalizada', 'Gestión delegada', 'Reseñas ilimitadas', 'Análisis de palabras clave', 'Soporte 24/7'],
    popular: false,
  },
];

function formatTimeLeft(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const total = Math.floor(ms / 1000);
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

export default function DemoCortoYCambio() {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [name, setName] = useState('');
  const [apellido1, setApellido1] = useState('');
  const [apellido2, setApellido2] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('');
  const [otroTipo, setOtroTipo] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ d: 7, h: 0, m: 0, s: 0 });
  const [paying, setPaying] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const start = localStorage.getItem('aura_trial_start');
    const now = Date.now();
    let end: number;

    if (start) {
      end = parseInt(start, 10) + 7 * 24 * 60 * 60 * 1000;
    } else {
      const newStart = now.toString();
      localStorage.setItem('aura_trial_start', newStart);
      localStorage.setItem('aura_trial_visited', '1');
      end = now + 7 * 24 * 60 * 60 * 1000;
    }

    const tick = () => {
      const remaining = end - Date.now();
      if (remaining <= 0) {
        setExpired(true);
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setTimeLeft(formatTimeLeft(remaining));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handlePayment = async (planId: string) => {
    setPaying(planId);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, businessName: 'Corto y Cambio', email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.needSetup) {
        alert(data.error);
        setShowContact(true);
      } else {
        alert(data.error || 'Error al procesar el pago');
      }
    } catch {
      alert('Error de conexión');
    }
    setPaying(null);
  };

  const generateResponse = async (id: string, review: typeof REVIEWS[0]) => {
    setLoadingId(id);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: review.text, rating: review.rating, author: review.author, source: 'demo' }),
      });
      const data = await res.json();
      setResponses((prev) => ({ ...prev, [id]: data.response || 'Error' }));
    } catch {
      setResponses((prev) => ({ ...prev, [id]: 'Error al generar' }));
    }
    setLoadingId(null);
  };

  return (
    <div className={`min-h-screen bg-gray-50 pb-12 ${expired ? 'blur-sm pointer-events-none select-none' : ''}`}>
      {/* Trial banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center py-2 text-xs font-medium">
        {expired
          ? 'Periodo de prueba finalizado. Elige un plan para continuar.'
          : `Prueba gratuita — te quedan ${timeLeft.d}d ${timeLeft.h}h ${timeLeft.m}m ${timeLeft.s}s`
        }
      </div>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src="/logo.svg?v=2" alt="AURA" className="h-10" />
            </Link>
            <span className="text-gray-200">|</span>
            <div>
              <span className="text-sm font-semibold text-gray-800">Corto y Cambio</span>
              <span className="ml-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Demo</span>
            </div>
          </div>
          <button onClick={() => setShowPlans(true)} className="text-xs bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-all">
            Quiero AURA para mi negocio
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Tus reseñas, respondidas por AURA
          </h1>
          <p className="text-sm text-gray-500">
            Así funciona AURA con Corto y Cambio. Cada reseña recibe una respuesta profesional, personalizada y humana.
          </p>
        </div>

        <div className="space-y-4">
          {REVIEWS.map((review, i) => {
            const id = String(i);
            const hasResponse = responses[id];
            const isLoading = loadingId === id;

            return (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
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
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{review.date}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed mb-4">{review.text}</p>

                {hasResponse ? (
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">A</div>
                        <span className="text-xs font-semibold text-orange-600 uppercase">Respuesta de AURA</span>
                      </div>
                      {editingId === id ? (
                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full text-sm text-gray-700 leading-relaxed bg-orange-50 rounded-lg p-3 border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-y min-h-[80px]" rows={3} />
                      ) : (
                        <p className="text-sm text-gray-700 leading-relaxed bg-orange-50 rounded-lg p-3 border border-orange-100">
                          {responses[id]}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {editingId === id ? (
                          <>
                            <button onClick={() => { setResponses((prev) => ({ ...prev, [id]: editText })); setEditingId(null); }} className="text-xs px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all">
                              Guardar
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all">
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditText(responses[id]); setEditingId(id); }} className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-all">
                              Editar
                            </button>
                            <button onClick={async () => { try { await navigator.clipboard.writeText(responses[id]); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); } catch {} }} className="text-xs px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all">
                              {copiedId === id ? '¡Copiado!' : 'Publicar'}
                            </button>
                            <button onClick={() => generateResponse(id, review)} disabled={isLoading} className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all">
                              {isLoading ? 'Generando...' : 'Generar otra'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                ) : (
                  <button onClick={() => generateResponse(id, review)} disabled={isLoading} className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-all">
                    {isLoading ? 'Generando respuesta...' : 'Ver cómo responde AURA'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-gray-400 mt-8 py-4 border-t border-gray-200">
          <Link href="/" className="text-orange-500 hover:text-orange-600 underline">AURA</Link> &middot; Demo para Corto y Cambio
        </div>
      </div>

      {/* Expiry / Payment modal */}
      {(expired || showPlans) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Prueba finalizada
              </h2>
              <p className="text-sm text-gray-500">
                Elige el plan que mejor se adapte a tu negocio y sigue gestionando tus reseñas con AURA.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {PLANS.map((plan) => (
                <div key={plan.id} className={`relative rounded-xl border p-4 ${plan.popular ? 'border-orange-400 bg-orange-50/30' : 'border-gray-200'}`}>
                  {plan.popular && (
                    <span className="absolute -top-2.5 right-4 bg-orange-400 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">Recomendado</span>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-400">{plan.desc}</p>
                      <ul className="mt-2 space-y-1">
                        {plan.features.map((f, fi) => (
                          <li key={fi} className="text-xs text-gray-600 flex items-center gap-1">
                            <span className="text-emerald-500">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-gray-900">{plan.price}<span className="text-xs font-normal text-gray-400">€/mes</span></div>
                      <div className="text-[10px] text-emerald-600 font-medium">{plan.annual}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePayment(plan.id)}
                    disabled={paying === plan.id}
                    className={`w-full mt-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                      plan.popular
                        ? 'bg-orange-400 text-white hover:bg-orange-500 shadow-lg shadow-orange-200'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-50`}
                  >
                    {paying === plan.id ? 'Procesando...' : 'Contratar'}
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-[10px] text-gray-400 mb-3">Pago seguro con tarjeta. Cancela cuando quieras.</p>
              <button onClick={() => setShowContact(true)} className="text-xs text-gray-500 underline hover:text-gray-700">
                ¿Dudas? Contáctanos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowContact(false)}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Solicitar acceso a AURA</h3>
              <button onClick={() => setShowContact(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); if (!accepted) { alert('Debes aceptar la política de privacidad'); return; } setSending(true); try { const webhook = 'https://script.google.com/macros/s/AKfycbx3Z-rbUCsd36A-c7V7mvHq5_a2s9Dc0c9tj9_-eZKeuN-poRse9FJPDGJ9e5lys2Wk/exec'; const params = new URLSearchParams({ name, apellido1, apellido2, email, businessName, tipoNegocio: tipoNegocio === 'Otros' ? otroTipo : tipoNegocio, phone, fecha: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'long', timeStyle: 'medium' }), accepted: '1' }); await fetch(`${webhook}?${params}`, { mode: 'no-cors' }); await fetch('/api/register-contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, apellido1, apellido2, email, businessName, tipoNegocio: tipoNegocio === 'Otros' ? otroTipo : tipoNegocio, phone, accepted: '1' }) }).catch(() => {}); alert('¡Gracias! Te contactaremos pronto.'); setShowContact(false); setName(''); setApellido1(''); setApellido2(''); setEmail(''); setBusinessName(''); setTipoNegocio(''); setOtroTipo(''); setPhone(''); setAccepted(false); } catch { alert('Error al enviar. Inténtalo de nuevo.'); } finally { setSending(false); } }} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Nombre</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Primer apellido</label>
                <input type="text" value={apellido1} onChange={(e) => setApellido1(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="Primer apellido" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Segundo apellido <span className="text-gray-300">(opcional)</span></label>
                <input type="text" value={apellido2} onChange={(e) => setApellido2(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="Segundo apellido" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="tu@email.com" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Nombre del negocio</label>
                <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="Nombre de tu negocio" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Tipo de negocio</label>
                <select value={tipoNegocio} onChange={(e) => setTipoNegocio(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 bg-white">
                  <option value="">Selecciona...</option>
                  {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {tipoNegocio === 'Otros' && (
                <div>
                  <label className="text-xs text-gray-500 font-medium">Especifica tu tipo de negocio</label>
                  <input type="text" value={otroTipo} onChange={(e) => setOtroTipo(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="Ej: Agencia de marketing" />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 font-medium">Teléfono (Opcional)</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="+34 600 000 000" />
              </div>
              <label className="flex items-start gap-2 text-xs text-gray-500">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" />
                <span>He leído y acepto la <a href="/privacidad" target="_blank" className="text-orange-500 underline hover:text-orange-600">política de privacidad</a></span>
              </label>
              <button type="submit" disabled={sending || !accepted} className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">
                {sending ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {copiedId && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg">
          Respuesta copiada al portapapeles. Pégala en Google Business Profile para publicarla.
        </div>
      )}
    </div>
  );
}
