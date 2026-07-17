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
            <img src="/logo.svg" alt="AURA" className="h-12 sm:h-16" />
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
              Tu negocio<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">
                habla por sí solo
              </span>
            </h1>
            <div className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-medium px-4 py-1.5 rounded-full">
              Para empresari@s que cuidan su reputación
            </div>
            <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
              Cada reseña en Google es una oportunidad. AURA te ayuda a responder de forma profesional, humana y rápida. Mejora tu reputación online sin esfuerzo.
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
                    {loading ? 'Analizando la reseña...' : 'Pega una reseña a la izquierda y genera tu primera respuesta'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            ¿Por qué elegir AURA?
          </h2>
          <p className="text-gray-500 text-center max-w-xl mx-auto mb-12">
            Responder reseñas no es un lujo. Es lo que separa un negocio con buena imagen de uno que pasa desapercibido.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {[
              {
                t: 'Responder rápido sube tu estrella',
                d: 'Los negocios que responden a sus reseñas en menos de 24 horas mejoran su valoración media hasta un 0.3★. Google premia la actividad y posiciona mejor a quienes interactúan con sus clientes.',
              },
              {
                t: 'El 89% de los clientes lee las respuestas',
                d: 'Antes de elegir un negocio, la mayoría mira cómo el dueño responde. Una respuesta profesional y humana convierte a un indeciso en cliente. El silencio, en cambio, se interpreta como desinterés.',
              },
              {
                t: 'Sin AURA, pierdes clientes cada día',
                d: 'Cada reseña sin responder es una oportunidad perdida. Una crítica mal gestionada aleja a cientos de clientes potenciales. Una respuesta a tiempo puede recuperar a ese cliente y convencer a otros.',
              },
              {
                t: 'El algoritmo de Google te favorece',
                d: 'Google valora los perfiles activos. Cuantas más reseñas respondas, mejor apareces en las búsquedas locales. AURA te ayuda a mantener esa actividad sin esfuerzo.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold text-sm mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.t}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>

          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed max-w-3xl mx-auto mb-6">
              <strong className="text-gray-900">Cada reseña sin responder</strong> es una mesa vacía. Con AURA, respondes en segundos, mejoras tu reputación y duermes tranquilo mientras la IA trabaja por ti. <strong className="text-gray-900">Tus clientes hablan. AURA responde. Tú ganas.</strong>
            </p>
            <button onClick={() => setShowContact(true)} className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10">
              Solicitar 7 días gratis
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
            <p className="text-xs text-gray-500 mt-3">Sin compromiso · Sin tarjeta · Sin spam</p>
          </div>
        </div>
      </section>

      {/* CTA trial */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Prueba AURA gratis durante 7 días
          </h2>
          <p className="text-gray-400 text-base sm:text-lg mb-3 max-w-lg mx-auto">
            Sin compromiso. Sin tarjeta de crédito. Solo tú, tu negocio y la IA más avanzada para responder reseñas.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500 mb-8">
            <span className="flex items-center gap-1">✓ Configuración en 5 minutos</span>
            <span className="flex items-center gap-1">✓ IA entrena con tu estilo</span>
            <span className="flex items-center gap-1">✓ Cancela cuando quieras</span>
          </div>
          <button onClick={() => setShowContact(true)} className="inline-flex items-center gap-2 px-10 py-5 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-all text-lg shadow-xl shadow-orange-500/20">
            Empezar prueba gratuita
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
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
              { n: '01', icon: '🔗', t: 'Conecta tu Google', d: 'Añades tu negocio. Nos encargamos de monitorizar tus reseñas en tiempo real.' },
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
              Restaurantes, peluquerías, talleres, clínicas... Sea cual sea tu negocio, AURA responde por ti.
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
                response: 'María, gracias por tus palabras, las recibo con alegría. La crema de calabaza y el tartar de atún son platos que cuidamos con esmero. Se lo haré saber a Javier, se alegrará mucho. Un fuerte abrazo.',
                label: 'Restaurante',
              },
              {
                name: 'Sara Ruiz',
                initial: 'S',
                stars: 4,
                date: 'hace 5 días',
                review: 'Muy contenta con el corte. Patricia entendió exactamente lo que quería y me dio buenos consejos para el mantenimiento en casa. El trato fue súper agradable. Repetiré sin duda.',
                response: 'Sara, gracias por compartirlo. Patricia es una gran profesional y se alegrará mucho de leer tus palabras. Nos encanta que nuestros clientes salgan contentos. Te esperamos cuando quieras.',
                label: 'Peluquería',
              },
              {
                name: 'Javier Ruiz',
                initial: 'J',
                stars: 1,
                date: 'hace 1 semana',
                review: 'Dejé el coche por una revisión y tardaron 3 días en decirme qué tenía. El presupuesto final duplicó el inicial y encima no quedó bien arreglado del todo. Mala comunicación.',
                response: 'Javier, lamento profundamente lo sucedido. No es la forma de trabajar que queremos. Hemos revisado el proceso para que los presupuestos sean más claros. Si te parece, hablamos en persona cuando vuelvas. Recibe un cordial saludo.',
                label: 'Taller mecánico',
              },
              {
                name: 'Laura Pérez',
                initial: 'L',
                stars: 5,
                date: 'hace 4 días',
                review: 'La mejor clínica dental en la que he estado. La dra. Martínez es un encanto y me explicó todo el tratamiento paso a paso. Cero dolor y resultados increíbles. 100% recomendable.',
                response: 'Laura, qué alegría leer un comentario como este. La doctora Martínez es una gran profesional y le haré llegar tus palabras. Nos llena de satisfacción saber que estás contenta. Hasta pronto.',
                label: 'Clínica dental',
              },
              {
                name: 'Ana Sánchez',
                initial: 'A',
                stars: 3,
                date: 'hace 1 semana',
                review: 'El local está bien pero los precios han subido mucho. La dependienta fue amable pero tardó en atenderme porque estaba sola. La calidad del producto sigue siendo buena.',
                response: 'Ana, gracias por tu sinceridad. Tomamos nota de los tiempos de espera y lo revisaremos con atención. Nos alegra que valores la calidad de nuestros productos. Un saludo afectuoso.',
                label: 'Tienda de ropa',
              },
              {
                name: 'David López',
                initial: 'D',
                stars: 2,
                date: 'hace 2 días',
                review: 'Contraté un servicio de limpieza a fondo y llegaron 40 minutos tarde. La limpieza estuvo bien pero la organización fue un desastre. No avisaron de la demora.',
                response: 'David, lamento sinceramente lo ocurrido. La puntualidad es fundamental y no estuvo a la altura. Ya hemos hablado con el equipo para que no se repita. Esperamos una nueva oportunidad para demostrártelo.',
                label: 'Limpiezas',
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
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">{r.label}</span>
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

      {/* Pricing */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Planes para cada negocio
          </h2>
          <p className="text-gray-500 text-center max-w-lg mx-auto mb-12">
            Elige el plan que mejor se adapte a tu volumen de reseñas y al nivel de personalización que necesites.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Básico */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 flex flex-col shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Básico</h3>
                <p className="text-xs text-gray-400 mb-4">Para negocios que empiezan a cuidar su reputación</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">19,90</span>
                  <span className="text-gray-400 text-sm">€/mes</span>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8 flex-1">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>Respuestas por IA <strong>genérica</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>Revisión manual antes de publicar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>Hasta 50 reseñas/mes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>Soporte por email</span>
                </li>
              </ul>
              <button onClick={() => setShowContact(true)} className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-gray-300 transition-all text-sm">
                Elegir Básico
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl border-2 border-orange-400 p-6 sm:p-8 flex flex-col shadow-md relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Recomendado
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Pro</h3>
                <p className="text-xs text-gray-400 mb-4">Para negocios con volumen y que quieren diferenciarse</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">29,90</span>
                  <span className="text-gray-400 text-sm">€/mes</span>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8 flex-1">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>IA <strong>personalizada</strong> que aprende de tus reseñas anteriores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>Revisión manual antes de publicar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>Hasta 200 reseñas/mes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>Soporte prioritario</span>
                </li>
              </ul>
              <button onClick={() => setShowContact(true)} className="w-full py-3 bg-orange-400 text-white font-semibold rounded-full hover:bg-orange-500 transition-all text-sm shadow-lg shadow-orange-200">
                Elegir Pro
              </button>
            </div>

            {/* Élite */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 flex flex-col shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Élite</h3>
                <p className="text-xs text-gray-400 mb-4">Para quienes quieren despreocuparse por completo</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">39,90</span>
                  <span className="text-gray-400 text-sm">€/mes</span>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8 flex-1">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>IA <strong>personalizada</strong> que aprende de tus reseñas anteriores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>Respuestas <strong>totalmente automatizadas</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>Revisadas por el <strong>equipo de AURA</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>Reseñas ilimitadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span>Soporte 24/7 dedicado</span>
                </li>
              </ul>
              <button onClick={() => setShowContact(true)} className="w-full py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all text-sm">
                Elegir Élite
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-xs text-gray-400">
              Todos los planes incluyen <strong>7 días de prueba gratuita</strong>. Sin permanencia. Cancela cuando quieras.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { n: '280.000+', l: 'Negocios en España' },
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
                <input type="text" value={restaurant} onChange={(e) => setRestaurant(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="Nombre de tu negocio" />
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
          <a href="/" className="inline-block mb-3">
            <img src="/logo.svg" alt="AURA" className="h-10 mx-auto" />
          </a>
          <p>© 2026 AURA. Todos los derechos reservados. | <a href="https://aura-online.es" className="hover:text-gray-600">aura-online.es</a> | <a href="/privacidad" className="hover:text-gray-600 underline">Privacidad</a></p>
        </div>
      </footer>
    </div>
  );
}
