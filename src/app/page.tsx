'use client';

import { useState, FormEvent } from 'react';

const reviews = [
  { name: 'María González', review: 'Espectacular todo. La crema de calabaza y el tartar de atún son increíbles. Volveremos sin duda.', rating: 5 },
  { name: 'Carlos Martínez', review: 'La comida buena pero el servicio muy lento. Estuvimos 40 minutos esperando para que nos tomaran nota.', rating: 2 },
  { name: 'Laura Pérez', review: 'Muy buena experiencia. El pulpo a la gallega espectacular. El único pero es que el local se queda pequeño.', rating: 4 },
  { name: 'Javier Ruiz', review: 'La mejor paella que he probado fuera de Valencia. Trato excelente y terraza encantadora. Recomendado 100%.', rating: 5 },
  { name: 'Ana Sánchez', review: 'Bien pero caro para lo que ofrece. Las raciones son pequeñas y los precios algo elevados.', rating: 3 },
  { name: 'David López', review: 'Un desastre. Teníamos reserva confirmada y cuando llegamos no había mesa. Muy mala organización.', rating: 1 },
];

const example = "Comida excelente pero el servicio fue muy lento. Estuvimos esperando 30 minutos para que nos tomaran nota y otro tanto para el postre. La comida compensa pero la espera es demasiado.";

export default function Home() {
  const [review, setReview] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const generateResponse = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (review.trim().length < 5) return;
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: review.trim(), rating: rating || undefined, author: reviewAuthor || undefined }),
      });
      const data = await res.json();
      setResponse(data.response || data.error || 'Error');
    } catch {
      setResponse('Error al generar respuesta');
    }
    setLoading(false);
  };

  const loadExample = (r: typeof reviews[0]) => {
    setReview(r.review);
    setReviewAuthor(r.name);
    setRating(r.rating);
    setResponse('');
    setTimeout(() => generateResponse(), 300);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="AURA" className="h-10 sm:h-12" />
          </a>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#demo" className="text-gray-500 hover:text-gray-900 hidden sm:inline">Demo</a>
            <a href="#ejemplos" className="text-gray-500 hover:text-gray-900 hidden sm:inline">Ejemplos</a>
            <a href="#como-funciona" className="text-gray-500 hover:text-gray-900 hidden sm:inline">Cómo funciona</a>
            <button onClick={() => setShowContact(true)} className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all">
              Quiero AURA
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-16 sm:pt-16 sm:pb-20 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Tu restaurante<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">
                habla por sí solo
              </span>
            </h1>
            <div className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-medium px-4 py-1.5 rounded-full">
              Para restaurantes que cuidan su reputación
            </div>
            <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
              Cada reseña en Google es una oportunidad. AURA te ayuda a responder de forma profesional, humana y rápida. Mejora tu reputación sin esfuerzo.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#demo" className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg">
                Ver demo gratis
              </a>
              <button onClick={() => setShowContact(true)} className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-gray-300 transition-all">
                Solicitar acceso
              </button>
            </div>
            <div className="flex justify-center gap-6 text-sm text-gray-400">
              <span>✓ Sin compromiso</span>
              <span>✓ 7 días gratis</span>
              <span>✓ Sin tarjeta</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Pruébalo tú mismo
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Pega una reseña real y ve cómo AURA la respondería. Sin registro, sin compromiso.
            </p>
          </div>

          {/* Quick examples */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Ejemplos reales:</p>
            <div className="flex flex-wrap gap-2">
              {reviews.map((r, i) => (
                <button key={i} onClick={() => loadExample(r)} className="text-xs bg-white border border-gray-200 hover:border-orange-300 px-3 py-1.5 rounded-full text-gray-600 hover:text-orange-600 transition-all">
                  {r.name} {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">Reseña recibida</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)} className={`text-lg transition-all ${rating >= s ? 'text-yellow-400' : 'text-gray-200'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs text-gray-400">De</span>
                <input type="text" value={reviewAuthor} onChange={(e) => setReviewAuthor(e.target.value)} placeholder="Nombre del cliente (opcional)" className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:border-orange-300" />
              </div>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Pega aquí la reseña de Google que quieras responder..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none text-sm min-h-[120px]"
                rows={4}
              />
              <button onClick={generateResponse} disabled={loading || review.length < 5} className="w-full mt-3 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-all text-sm">
                {loading ? 'Generando...' : 'Generar respuesta con IA'}
              </button>
              {review.length > 5 && (
                <button onClick={() => { setReview(''); setReviewAuthor(''); setResponse(''); setRating(0); }} className="text-xs text-gray-400 mt-2 hover:text-gray-600">
                  Limpiar
                </button>
              )}
            </div>

            {/* Output */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-700 mb-3">Respuesta generada por AURA</div>
              {response ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed">{response}</p>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(response); alert('Respuesta copiada'); }} className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                    Copiar respuesta
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-center min-h-[120px]">
                  <p className="text-sm text-gray-400 text-center">
                    {loading ? '🤖 Analizando la reseña...' : 'Pega una reseña a la izquierda y genera tu primera respuesta'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>
            Cómo funciona AURA
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { n: '01', icon: '🔗', t: 'Conecta tu Google', d: 'Añades tu restaurante. Nos encargamos de monitorizar tus reseñas en tiempo real.' },
              { n: '02', icon: '🤖', t: 'IA responde por ti', d: 'Cada nueva reseña recibe una respuesta profesional, personalizada y humana generada por AURA.' },
              { n: '03', icon: '✅', t: 'Tú apruebas o publicas', d: 'Revisas antes de publicar. O activas el modo automático y AURA responde al instante.' },
            ].map((s, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="text-4xl mb-2">{s.icon}</div>
                <div className="text-xs font-bold text-orange-500 tracking-widest">{s.n}</div>
                <h3 className="font-bold text-lg text-gray-900">{s.t}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real examples */}
      <section id="ejemplos" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Así responde AURA
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Reseñas reales de Google, respondidas por AURA. Natural, humano, al grano.
            </p>
          </div>
          <div className="space-y-6">
            {[
              {
                name: 'María González',
                initial: 'M',
                stars: 5,
                date: 'hace 3 días',
                review: 'Espectacular todo. La crema de calabaza y el tartar de atún son increíbles. El camarero Javier nos trató fenomenal. Volveremos sin duda.',
                response: 'María, jo, gracias. Lo de la crema de calabaza y el tartar es de lo que más nos pide la gente. Y a Javier le voy a leer tu comentario, se lo merece. ¡Un abrazo!',
              },
              {
                name: 'Carlos Martínez',
                initial: 'C',
                stars: 2,
                date: 'hace 1 semana',
                review: 'La comida buena pero el servicio nefasto. Estuvimos 40 minutos esperando para que nos tomaran nota y cuando pedimos la cuenta, otro cuarto de hora. El camarero parecía agobiado.',
                response: 'Carlos, madre mía, lo siento. 40 minutos esperando no se le hace a nadie. Ya hemos hablado en sala para que no vuelva a pasar. ¡Un saludo!',
              },
              {
                name: 'Laura Pérez',
                initial: 'L',
                stars: 4,
                date: 'hace 5 días',
                review: 'Muy buena experiencia. El pulpo a la gallega espectacular y el arroz con leche casero riquísimo. El único pero es que el local se queda pequeño los fines de semana.',
                response: 'Laura, gracias. Me alegra que el pulpo te gustara, la verdad es que le echamos horas. Y lo del espacio, tienes razón, los fines de semana se nos queda pequeño, estamos en ello. ¡Hasta pronto!',
              },
              {
                name: 'Javier Ruiz',
                initial: 'J',
                stars: 5,
                date: 'hace 2 semanas',
                review: 'La mejor paella que he probado fuera de Valencia. El trato inmejorable y la terraza encantadora. Precio más que razonable para la calidad.',
                response: 'Javier, anda, gracias. Que digas eso de la paella, viniendo de alguien que sabe, es lo mejor. Me alegra que la terraza también te gustara. ¡Nos vemos!',
              },
              {
                name: 'Ana Sánchez',
                initial: 'A',
                stars: 3,
                date: 'hace 1 semana',
                review: 'Bien pero caro para lo que ofrece. Las raciones son pequeñas y los precios algo elevados. El sitio está bien decorado y el servicio correcto.',
                response: 'Ana, gracias, tomamos nota de las raciones y los precios. Lo revisamos con cocina. Me alegra que el sitio te gustara. ¡Un saludo!',
              },
              {
                name: 'David López',
                initial: 'D',
                stars: 1,
                date: 'hace 4 días',
                review: 'Un desastre. Teníamos reserva confirmada y cuando llegamos no había mesa. Muy mala organización y el recibimiento fue frío. No volveré.',
                response: 'David, buf, lo siento mucho. Fallar con una reserva no tiene nombre. Ya hemos revisado el sistema. Esperamos que nos des otra oportunidad. ¡Un abrazo!',
              },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                    {r.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">{r.name}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-sm ${s <= r.stars ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{r.review}</p>
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">A</div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Respuesta de AURA</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{r.response}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-gray-900 py-16 text-center">
        <div className="max-w-xl mx-auto px-4 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            ¿Cuánto cuesta AURA?
          </h2>
          <p className="text-gray-400 text-lg">
            Menos de lo que cuesta un café al día. Y la primera semana es gratis.
          </p>
          <button onClick={() => setShowContact(true)} className="inline-block px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all">
            Solicitar acceso anticipado
          </button>
          <p className="text-xs text-gray-600">Sin compromiso. Sin tarjeta. 7 días gratis.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { n: '280.000+', l: 'Restaurantes en España' },
              { n: '87%', l: 'No responden reseñas' },
              { n: '2.3★', l: 'Pérdida media sin gestión' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl sm:text-3xl font-black text-gray-900">{s.n}</div>
                <div className="text-xs text-gray-400 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowContact(false)}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Solicitar acceso a AURA</h3>
              <button onClick={() => setShowContact(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); if (!accepted) { alert('Debes aceptar la política de privacidad'); return; } setSending(true); try { const webhook = 'https://script.google.com/macros/s/AKfycbyNtOHk1u4HagOiIrMRzMa8L_yvzGQ6jxRSm9AEbmxkWGbBWY-VBiO8o66b9PVnMjc/exec'; const params = new URLSearchParams({ name, email, restaurant, phone, accepted: '1' }); await fetch(`${webhook}?${params}`, { mode: 'no-cors' }); alert('¡Gracias! Te contactaremos pronto.'); setShowContact(false); setName(''); setEmail(''); setRestaurant(''); setPhone(''); setAccepted(false); } catch { alert('Error al enviar. Inténtalo de nuevo.'); } finally { setSending(false); } }} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Nombre</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="tu@email.com" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Restaurante</label>
                <input type="text" value={restaurant} onChange={(e) => setRestaurant(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="Nombre de tu restaurante" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Teléfono <span className="text-gray-300">(opcional)</span></label>
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

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-gray-400">
          <h4 className="font-bold text-gray-700 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>AURA</h4>
          <p>© 2026 AURA. Todos los derechos reservados. | <a href="https://aura-online.es" className="hover:text-gray-600">aura-online.es</a> | <a href="/privacidad" className="hover:text-gray-600 underline">Privacidad</a></p>
        </div>
      </footer>
    </div>
  );
}
