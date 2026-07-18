'use client';

import { useState } from 'react';

const EXAMPLES = [
  { business: 'Restaurante Casa Blanca', author: 'Laura M.', rating: 5, text: 'Comida espectacular y trato increíble. Volveremos sin duda. El mejor restaurante de la zona.', response: 'Laura, muchísimas gracias por tus palabras. Nos alegra saber que disfrutasteis de la experiencia. Trabajamos cada día para que cada visita sea especial. ¡Os esperamos de nuevo muy pronto!' },
  { business: 'Taller Mecánico Pérez', author: 'Jorge T.', rating: 5, text: 'Dejé el coche por una revisión y quedó como nuevo. Precio justo y me lo dejaron listo en el día. Muy recomendable.', response: 'Jorge, gracias por confiar en nosotros. Nos alegra que el trabajo fuese de tu agrado y que todo quedase a tu gusto. Somos un taller de toda la vida y nos encanta cuidar los detalles. ¡Un saludo!' },
  { business: 'Peluquería Carmen', author: 'Marta F.', rating: 5, text: 'Me hicieron un corte y un brushing espectacular. Salí como nueva. El trato increíble, volveré sin duda.', response: 'Marta, nos encanta leerte. Saber que saliste contenta es lo más importante para nosotras. Todo el equipo se esfuerza cada día para que te sientas mimada. ¡Te esperamos pronto!' },
  { business: 'Hotel Miramar', author: 'Raúl G.', rating: 4, text: 'Habitación limpia, cama cómoda y buen desayuno. La única pega es que el aire acondicionado hacía ruido.', response: 'Raúl, gracias por tu reseña. Nos alegra que disfrutases de tu estancia y del desayuno. Tomamos nota de lo del aire acondicionado, lo revisaremos para que no vuelva a ocurrir. ¡Esperamos verte de nuevo!' },
  { business: 'Clínica Dental Soriano', author: 'Elena V.', rating: 5, text: 'Muy profesionales y cercanos. Me hicieron un blanqueamiento y el resultado es increíble. Sin dolor y muy rápido.', response: 'Elena, nos alegra muchísimo que estés contenta con el resultado. Nuestro objetivo es que te sientas cómoda desde el primer momento. ¡Gracias por confiar en nosotros!' },
  { business: 'Cafetería La Central', author: 'David P.', rating: 4, text: 'El mejor café del barrio. Las tostadas enormes y el personal muy simpático. A veces hay cola pero merece la pena.', response: 'David, gracias por tu visita y por tomarte el tiempo de valorarnos. Nos encanta saber que el café y las tostadas fueron de tu agrado. Trabajamos para que la espera merezca la pena. ¡Te esperamos!' },
  { business: 'Clínica FisioSalud', author: 'Sofía R.', rating: 5, text: 'Llevaba meses con dolor de espalda y en 4 sesiones noté una mejoría increíble. Muy agradecida con todo el equipo.', response: 'Sofía, nos alegra muchísimo que hayas notado mejoría tan pronto. Trabajamos cada día para ayudar a nuestros pacientes a recuperar su bienestar. ¡Gracias por tu confianza!' },
  { business: 'Lavandería EcoClean', author: 'Antonio L.', rating: 3, text: 'Ropa limpia y bien doblada, pero tardaron un día más de lo prometido. Me avisaron pero igualmente incómodo.', response: 'Antonio, gracias por tu sinceridad. Nos alegra que el servicio fuese correcto, pero lamentamos el retraso. Estamos revisando nuestros procesos para que no vuelva a pasar. Esperamos darte un mejor servicio la próxima vez.' },
  { business: 'Tienda de Mascotas Patitas', author: 'Cristina B.', rating: 5, text: 'Compré comida para mi perro y me asesoraron genial. Precios buenos y atención excelente. Mi perro alucina con el pienso.', response: 'Cristina, gracias por tu visita. Nos encanta saber que tanto tú como tu perro estáis contentos. Nuestro equipo disfruta aconsejando a cada cliente. ¡Os esperamos a los dos!' },
  { business: 'Barbería King\'s', author: 'Álvaro M.', rating: 5, text: 'Me arreglaron la barba y el pelo de 10. Ambiente chulo, música guay y te atienden genial. Mi barbería de confianza ya.', response: 'Álvaro, gracias por tu reseña. Nos mola saber que te gusta el ambiente y el trabajo. Ese es el estilo que buscamos. ¡Te esperamos cuando quieras, máquina!' },
];

export default function SocialCardPage() {
  const [cards, setCards] = useState(EXAMPLES.slice(0, 5));
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const displayCards = showAll ? EXAMPLES : cards;

  const addCard = () => {
    if (displayCards.length >= 10) return;
    const next = EXAMPLES[displayCards.length];
    if (next) {
      setCards([...displayCards, next]);
    } else {
      setCards([...displayCards, { business: '', author: '', rating: 5, text: '', response: '' }]);
    }
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

  const downloadCard = () => {
    const el = document.getElementById('card-preview');
    if (!el) return;
    import('html2canvas').then((h2c) => {
      h2c.default(el, { scale: 2, backgroundColor: '#fff', useCORS: true }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `aura-${(c.business || 'card').replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; Volver</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Generador de tarjetas Instagram</h1>
        <p className="text-sm text-gray-500 mb-6">Crea tarjetas profesionales con reseñas y respuestas de AURA. Descárgalas como PNG.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-500 font-medium">Tarjetas ({displayCards.length}/10)</label>
                <div className="flex gap-2">
                  {!showAll && displayCards.length < 10 && <button onClick={addCard} className="text-xs text-orange-500 hover:text-orange-600 font-medium">+ Añadir</button>}
                  <button onClick={() => { setShowAll(!showAll); setActiveIndex(0); }} className={`text-xs font-medium ${showAll ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>
                    {showAll ? 'Modo edición' : 'Ver 10 ejemplos'}
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
                <textarea value={c.response} onChange={(e) => updateCard(activeIndex, 'response', e.target.value)} placeholder="Respuesta de AURA" rows={3} className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm resize-none bg-orange-50" />
                {displayCards.length > 1 && <button onClick={() => removeCard(activeIndex)} className="text-xs text-red-400 hover:text-red-500">Eliminar</button>}
              </div>
            )}

            {!showAll && (
              <>
                <button onClick={downloadCard} className="w-full py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all text-sm">
                  Descargar esta tarjeta
                </button>
                <button
                  onClick={async () => {
                    const h2c = await import('html2canvas');
                    for (let i = 0; i < displayCards.length; i++) {
                      setActiveIndex(i);
                      await new Promise(r => setTimeout(r, 300));
                      const el = document.getElementById('card-preview');
                      if (!el) continue;
                      const canvas = await h2c.default(el, { scale: 2, backgroundColor: '#fff', useCORS: true });
                      const link = document.createElement('a');
                      link.download = `aura-${(displayCards[i].business || 'card').replace(/\s+/g, '-')}.png`;
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                      await new Promise(r => setTimeout(r, 500));
                    }
                  }}
                  className="w-full py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900 transition-all text-sm"
                >
                  Descargar todas ({displayCards.length})
                </button>
              </>
            )}

            {showAll && (
              <p className="text-sm text-gray-500 text-center py-4">Modo vista — los 10 ejemplos. Haz screenshot desde el móvil o vuelve a "Modo edición" para descargar.</p>
            )}
          </div>

          <div className="lg:col-span-3 flex items-start justify-center pt-2">
            <div id="card-preview" className="w-full max-w-[500px] bg-white overflow-hidden shadow-xl" style={{ aspectRatio: '1/1', borderRadius: 32 }}>
              <div className="h-full flex flex-col">
                <div className="bg-white px-8 py-6 flex items-center gap-4 border-b border-gray-100">
                  <img src="https://aura-online.es/logo.svg?v=2" alt="AURA" className="h-14" />
                  <div className="ml-auto text-right">
                    <div className="text-gray-300 text-[10px] tracking-[2px]">PARA</div>
                    <div className="text-gray-800 text-base font-semibold">{c.business || 'tu negocio'}</div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center px-10 py-6">
                  {(c.text || c.response) ? (
                    <>
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">{c.author ? c.author[0].toUpperCase() : '?'}</div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{c.author || 'Cliente'}</div>
                            <div className="text-lg tracking-wide" style={{ color: '#f59e0b' }}>{stars}</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl px-6 py-4">
                          <p className="text-sm text-gray-700 italic leading-relaxed">&ldquo;{c.text || 'Texto de la reseña'}&rdquo;</p>
                        </div>
                      </div>
                      {c.response && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            <span className="text-[10px] font-bold text-orange-500 tracking-[2px]">RESPUESTA AURA</span>
                          </div>
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl px-6 py-4">
                            <p className="text-sm text-gray-700 leading-relaxed">{c.response}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                      </div>
                      <p className="text-gray-400 text-sm">Rellena los datos para<br />ver la previsualización</p>
                    </div>
                  )}
                </div>

                <div className="px-10 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide">aura-online.es</span>
                  <span className="text-[10px] text-gray-300">⋆</span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide">RESEÑAS · RESPUESTAS · REPUTACIÓN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
