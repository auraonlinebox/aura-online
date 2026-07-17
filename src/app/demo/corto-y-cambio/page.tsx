'use client';

import { useState } from 'react';
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

export default function DemoCortoYCambio() {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const generateResponse = async (id: string, review: typeof REVIEWS[0]) => {
    setLoadingId(id);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: review.text, rating: review.rating, author: review.author }),
      });
      const data = await res.json();
      setResponses((prev) => ({ ...prev, [id]: data.response || 'Error' }));
    } catch {
      setResponses((prev) => ({ ...prev, [id]: 'Error al generar' }));
    }
    setLoadingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src="/logo.svg" alt="AURA" className="h-10" />
            </Link>
            <span className="text-gray-200">|</span>
            <div>
              <span className="text-sm font-semibold text-gray-800">Corto y Cambio</span>
              <span className="ml-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Demo</span>
            </div>
          </div>
          <a href="https://wa.me/34600000000" target="_blank" className="text-xs bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-all">
            Quiero AURA para mi negocio
          </a>
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
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">A</div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Respuesta de AURA</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed bg-orange-50 rounded-lg p-3 border border-orange-100">
                      {responses[id]}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => generateResponse(id, review)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all"
                      >
                        {isLoading ? 'Generando...' : 'Generar otra respuesta'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => generateResponse(id, review)}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-all"
                  >
                    {isLoading ? 'Generando respuesta...' : 'Ver cómo responde AURA'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-gray-400 mb-4">¿Quieres lo mismo para tu negocio?</p>
          <a
            href="https://wa.me/34600000000"
            target="_blank"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg"
          >
            Solicitar demo gratuita
          </a>
        </div>

        <div className="text-center text-xs text-gray-400 mt-8 py-4 border-t border-gray-200">
          <Link href="/" className="text-orange-500 hover:text-orange-600 underline">AURA</Link> &middot; Demo para Corto y Cambio
        </div>
      </div>
    </div>
  );
}
