function getFirstName(author: string): string | null {
  const cleaned = author.trim();
  if (!cleaned) return null;
  const parts = cleaned.split(/[\s.]+/);
  const first = parts[0];
  if (!first) return null;
  if (first.endsWith('88') || /\d/.test(first)) return null;
  if (first.length < 2) return null;
  return first;
}

function getDishes(text: string): string[] {
  const all = [
    'crema de calabaza', 'tartar de atún', 'patatas bravas', 'tortilla de patatas',
    'paella', 'croquetas', 'pulpo a la gallega', 'pulpo', 'jamón', 'gambas',
    'calamares', 'arroz', 'bacalao', 'solomillo', 'entrecot', 'secreto',
    'cochinillo', 'merluza', 'lubina', 'mejillones', 'navajas', 'almejas',
    'callos', 'cocido', 'fabada', 'salmorejo', 'gazpacho', 'tarta de queso',
    'flan', 'crema catalana', 'torrija', 'churros', 'vino', 'cerveza',
    'queso', 'hamburguesa', 'pizza', 'pasta', 'risotto', 'sushi', 'fideuá',
    'empanada', 'ensalada', 'revuelto', 'huevos rotos', 'chipirones',
    'boquerones', 'caracoles', 'pimientos', 'tortilla', 'bravas',
  ];
  const t = text.toLowerCase();
  return all.filter(d => t.includes(d)).slice(0, 2);
}

function getWaiterName(text: string): string | null {
  const skip = new Set(['parecía', 'parecia', 'estaba', 'estresado', 'era', 'muy', 'fue', 'era', 'fue', 'está', 'esta', 'nos', 'te', 'le', 'me', 'se', 'lo', 'la', 'os', 'un', 'una', 'estába', 'agobiado', 'nervioso', 'estresada']);
  const lower = text.toLowerCase();
  const patterns = [
    /camarero\s+([a-záéíóúñ]+)/i,
    /camarera\s+([a-záéíóúñ]+)/i,
    /encargado\s+([a-záéíóúñ]+)/i,
  ];
  const t = text;
  for (const pat of patterns) {
    const m = t.match(pat);
    if (m) {
      const word = m[1];
      if (word.length > 2 && !skip.has(word.toLowerCase()) && word[0] === word[0].toUpperCase()) return word;
    }
  }
  const revPat = /([a-záéíóúñ]+)\s+el\s+camarero/i;
  const rm = t.match(revPat);
  if (rm) {
    const word = rm[1];
    if (word.length > 2 && !skip.has(word.toLowerCase())) return word[0].toUpperCase() + word.slice(1).toLowerCase();
  }
  const revPat2 = /([a-záéíóúñ]+)\s+la\s+camarera/i;
  const rm2 = t.match(revPat2);
  if (rm2) {
    const word = rm2[1];
    if (word.length > 2 && !skip.has(word.toLowerCase())) return word[0].toUpperCase() + word.slice(1).toLowerCase();
  }
  return null;
}

function detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const t = text.toLowerCase();
  const neg = ['pésimo', 'pésima', 'fatal', 'nefasto', 'terrible', 'horrible', 'desastre', 'malo', 'mala', 'peor', 'nunca', 'no volver', 'no vuelvo', 'no recomend', 'queja', 'enfadado', 'decepcion', 'lento', 'tarde', 'esperando', 'sucia', 'fría', 'caro', 'cara', 'carísimo', 'carisimo', 'desagradable', 'malísimo', 'malisimo', 'borde', 'mala', 'malo', 'nefasta'];
  const pos = ['espectacular', 'increíble', 'increible', 'fenomenal', 'excelente', 'maravilloso', 'perfecto', 'encantador', 'riquísimo', 'riquisimo', 'delicioso', 'estupendo', 'genial', 'fantástico', 'fantastico', 'recomiendo', 'repetiremos', 'volveremos', 'inolvidable', 'brutal', 'impecable', 'buenísima', 'buenísimo', 'buenisima', 'buenisimo', 'inmejorable'];

  const negCount = neg.filter(w => t.includes(w)).length;
  const posCount = pos.filter(w => t.includes(w)).length;

  if (negCount > posCount) return 'negative';
  if (posCount > negCount) return 'positive';
  return 'neutral';
}

function hasTopic(text: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(text));
}

const topics = {
  espera: [/espera/, /esperando/, /minuto/, /tarde\b/, /lento/, /cola/],
  precio: [/caro\b/, /cara\b/, /precio/, /barato/, /factura/, /cuenta\b/],
  reserva: [/reserva/, /reservado/, /no había (mesa|cita)/, /confirmad/],
  racion: [/ración/, /racion/, /poco\b/, /escaso/, /cantidad/],
  ambiente: [/ambiente/, /local/, /sitio/, /terraza/, /música/, /ruido/, /limpio/, /sucia/, /frío/, /calor/, /decoración/, /pequeñ/],
  camarero: [/camarero/, /camarera/, /encargado/, /servicio/, /trato/, /atento/, /borde/, /desagradable/],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const contract = (s: string) => s.replace(/\bde\s+el\b/g, 'del');

const openerPos = (g: string) => pick([
  `${g}gracias por tus palabras, las recibimos con alegría`,
  `${g}qué bonito leer un comentario como este`,
  `${g}nos alegra profundamente tu visita`,
  `${g}agradezco que te hayas tomado el tiempo de compartirlo`,
  `${g}es un placer recibir reseñas tan positivas`,
  `${g}gracias, de verdad, por esta valoración tan generosa`,
  `${g}me alegra muchísimo que la experiencia fuera tan buena`,
  `${g}qué satisfacción leer algo así`,
  `${g}tus palabras son un gran reconocimiento para el equipo`,
  `${g}mil gracias por tu confianza y por compartirlo`,
]);
const openerNeg = (g: string) => pick([
  `${g}lamento sinceramente lo ocurrido`,
  `${g}gracias por tu honestidad, la valoro profundamente`,
  `${g}siento mucho que la experiencia no estuviera a la altura`,
  `${g}tienes razón y te agradezco que lo señales`,
  `${g}lamento profundamente lo sucedido`,
  `${g}gracias por decirlo con claridad, nos ayuda a mejorar`,
  `${g}lo siento de verdad, no es la impresión que queremos dar`,
  `${g}agradezco tu sinceridad y lamento lo que pasó`,
]);
const openerNeu = (g: string) => pick([
  `${g}gracias por tu sinceridad`,
  `${g}agradezco que te hayas tomado el tiempo de escribir`,
  `${g}gracias por compartir tu experiencia con honestidad`,
  `${g}valoro mucho tu opinión`,
  `${g}gracias por escribirnos, valoramos tu opinión`,
]);
const close = () => pick([
  'Un fuerte abrazo', 'Recibe un cordial saludo', 'Con afecto',
  'Hasta pronto', 'Esperamos verte de nuevo',
  'Un abrazo sincero', 'Gracias de nuevo',
  'Te esperamos con los brazos abiertos', 'Un saludo afectuoso',
]);

function dishRef(d: string, art: string): string {
  const deEl = art === 'el' ? 'del' : `de ${art}`;
  return pick([
    `que menciones ${art} ${d}`,
    `que hayas destacado ${art} ${d}`,
    `lo que dices ${deEl} ${d}`,
    `${art} ${d}`,
    `haber disfrutado ${deEl} ${d}`,
  ]);
}
function dishPos(d: string, art: string): string {
  const lo = art === 'la' ? 'la' : 'lo';
  return pick([
    `es un plato que cuidamos con esmero`,
    `es de los que más nos enorgullece ofrecer`,
    `${lo} elaboramos con dedicación y los mejores productos`,
    `es uno de los que más mimo requiere en cocina`,
    `tiene un proceso que nos apasiona`,
    `es de los que mejor representa nuestra cocina`,
    `${lo} trabajamos con mucho respeto al producto`,
    `es un clásico que nunca defrauda`,
    `es un plato que llevamos años perfeccionando`,
    `tiene un cariño especial por parte de todo el equipo`,
  ]);
}
function waiterPos(w: string): string {
  return pick([
    `se lo haré saber a ${w}, se alegrará mucho de leerlo`,
    `voy a trasladarle tu comentario a ${w}, se lo merece`,
    `${w} es un gran profesional, le haré llegar tus palabras`,
    `compartiré tu opinión con ${w}, le hará una ilusión enorme`,
    `no sabes la alegría que le dará a ${w} saber que lo hiciste notar`,
  ]);
}
function waiterNeg(w: string): string {
  return pick([
    `hemos hablado con ${w} para que no se repita`,
    `lo ocurrido con ${w} no nos representa. Ya está hablado`,
    `ya hemos tratado el tema con ${w}. Gracias por señalarlo`,
    `no es la actitud que queremos. ${w} lo sabe y lo hemos tratado`,
  ]);
}
function esperaRef(): string {
  return pick([
    'la espera', 'teneros esperando así', 'todo ese tiempo esperando',
    'la tardanza', 'la demora',
  ]);
}

function placeWord(text: string): string {
  const t = text.toLowerCase();
  if (/\btaller\b/.test(t)) return 'taller';
  if (/\brestaurante\b/.test(t)) return 'restaurante';
  if (/\bclínica\b|\bconsulta\b/.test(t)) return 'clínica';
  if (/\bpeluquería\b|\bsalón\b/.test(t)) return 'peluquería';
  return 'local';
}

function buildFallback(review: string, author: string): string {
  const name = getFirstName(author);
  const g = name ? `${name}, ` : '';
  const t = review.toLowerCase();
  const sentiment = detectSentiment(review);
  const dishes = getDishes(review);
  const waiter = getWaiterName(review);

  const tiene = (topic: keyof typeof topics) => hasTopic(t, topics[topic]);

  // --- NEGATIVAS ---
  if (sentiment === 'negative') {
    const invitar = pick([
      ' Si quieres, escríbenos a nuestro email y hablamos con más calma.',
      ' Me gustaría que hablaras conmigo directamente en tu próxima visita.',
      ' Me encantaría que me lo comentaras en persona cuando vuelvas.',
      ' Si te parece, hablamos en persona la próxima vez que vengas.',
      ' Estoy a tu disposición para hablarlo cuando quieras.',
    ]);
    if (waiter) {
      return `${openerNeg(g)}. ${capitalize(waiterNeg(waiter))}.${invitar} ${close()}.`;
    }
    if (tiene('reserva')) {
      return pick([
        `${openerNeg(g)}. Fallar con la reserva no tiene nombre. Hemos revisado el sistema para que no vuelva a ocurrir.${invitar} ${close()}.`,
        `${openerNeg(g)}. Lo de la reserva fue inaceptable y ya lo hemos solucionado.${invitar} ${close()}.`,
        `${openerNeg(g)}. Una reserva confirmada debe respetarse y hemos ajustado el proceso.${invitar} ${close()}.`,
        `${openerNeg(g)}. No hay excusa. Hemos revisado el sistema para que no se repita.${invitar} ${close()}.`,
      ]);
    }
    if (tiene('espera')) {
      if (dishes.length > 0) {
        const d = dishes[0];
        const art = d.startsWith('crema') || d.startsWith('tarta') || d.startsWith('ensal') ? 'la' : 'el';
        return pick([
          `${openerNeg(g)}. ${capitalize(esperaRef())} no es aceptable, menos cuando se viene a disfrutar de ${d}. Hemos hablado con el equipo de sala.${invitar} ${close()}.`,
          `${openerNeg(g)}. ${capitalize(d)} merece comerse con calma, no después de esperar así. Ya lo hemos tratado internamente.${invitar} ${close()}.`,
          `${openerNeg(g)}. No es justo. ${capitalize(dishRef(d, art))} es algo que cuidamos, y la espera no estuvo a la altura.${invitar} ${close()}.`,
        ]);
      }
      return pick([
        `${openerNeg(g)}. ${capitalize(esperaRef())} fue excesiva. Ya hemos tomado medidas con el equipo.${invitar} ${close()}.`,
        `${openerNeg(g)}. No es admisible tener a nadie esperando así. Lo hemos tratado.${invitar} ${close()}.`,
        `${openerNeg(g)}. ${capitalize(esperaRef())} no refleja el servicio que queremos dar. Ya está hablado.${invitar} ${close()}.`,
      ]);
    }
    if (tiene('precio')) {
      return pick([
        `${openerNeu(g)}. Tomamos nota de lo que comentas sobre los precios. Lo revisaremos con atención.${invitar} ${close()}.`,
        `${openerNeu(g)}. Agradecemos la observación sobre los precios y la tendremos muy en cuenta.${invitar} ${close()}.`,
        `${openerNeu(g)}. Gracias por señalarlo. Evaluaremos los precios.${invitar} ${close()}.`,
      ]);
    }
    if (tiene('racion')) {
      return pick([
        `${openerNeu(g)}. Revisaremos las raciones, tomamos nota.${invitar} ${close()}.`,
        `${openerNeu(g)}. Tomamos nota de lo de las raciones y lo tendremos en cuenta.${invitar} ${close()}.`,
        `${openerNeu(g)}. Agradecemos tu comentario sobre las raciones. Lo tendremos presente.${invitar} ${close()}.`,
      ]);
    }
    if (tiene('ambiente')) {
      return pick([
        `${openerNeg(g)}. Lo del ambiente lo revisaremos para mejorarlo.${invitar} ${close()}.`,
        `${openerNeu(g)}. Gracias por tu observación sobre el local. Trabajaremos en ello.${invitar} ${close()}.`,
        `${openerNeg(g)}. Tomamos nota de lo que comentas del ambiente y lo hablaremos en equipo.${invitar} ${close()}.`,
      ]);
    }
    return pick([
      `${openerNeg(g)}. Hemos hablado con el equipo para que no se repita.${invitar} ${close()}.`,
      `${openerNeu(g)}. Gracias por tu sinceridad. Trabajaremos en mejorar.${invitar} ${close()}.`,
      `${openerNeg(g)}. Lamento que no fuera una buena experiencia.${invitar} ${close()}.`,
    ]);
  }

  // --- POSITIVAS ---
  if (sentiment === 'positive') {
    if (waiter) {
      return `${openerPos(g)}. ${capitalize(waiterPos(waiter))}. ${close()}.`;
    }
    if (dishes.length > 0) {
      const d = dishes[0];
      const art = d.startsWith('crema') || d.startsWith('tarta') || d.startsWith('ensal') ? 'la' : 'el';
      let extra = '';
      if (tiene('ambiente')) extra = pick([
        ' En cuanto al local, tomamos nota y lo tendremos en cuenta.',
        ' También agradezco tu sinceridad sobre el espacio, lo revisaremos.',
        ' Y respecto al local, recogemos el comentario para mejorarlo.',
      ]);
      if (tiene('espera')) extra = pick([
        ' Lamento la espera, no es lo que queremos.',
        ' Tomamos nota del tiempo de espera, ya lo hemos hablado.',
        ' La demora no es aceptable, trabajaremos en ello.',
      ]);
      if (tiene('precio')) extra = pick([
        ' Tomamos nota de lo que comentas sobre los precios.',
        ' Gracias también por tu observación sobre los precios.',
        ' Revisaremos los precios con atención.',
      ]);
      if (tiene('racion')) extra = pick([
        ' Revisaremos las raciones con cocina.',
        ' Gracias por señalar lo de las raciones, lo tendremos presente.',
        ' Tomamos nota sobre las raciones.',
      ]);
      return pick([
        `${openerPos(g)}. ${capitalize(dishRef(d, art))} — ${dishPos(d, art)}.${extra} ${close()}.`,
        `${openerPos(g)}. ${capitalize(dishRef(d, art))}, ${dishPos(d, art)}.${extra} ${close()}.`,
      ]);
    }
    if (tiene('camarero')) {
      return pick([
        `${openerPos(g)}. El trato es tan importante como el servicio que ofrecemos. Se lo haré saber al equipo. ${close()}.`,
        `${openerPos(g)}. El equipo se merece leer comentarios como este. Se lo trasladaré encantado. ${close()}.`,
        `${openerPos(g)}. Nos alegra que el trato estuviera a la altura de tus expectativas. ${close()}.`,
      ]);
    }
    if (tiene('ambiente')) {
      return pick([
        `${openerPos(g)}. Nos encanta que el ambiente haya sido de tu agrado. ${close()}.`,
        `${openerPos(g)}. El local lo cuidamos con esmero y alegra que se note. ${close()}.`,
        `${openerPos(g)}. Que disfrutaras del espacio nos llena de satisfacción. ${close()}.`,
      ]);
    }
    return pick([
      `${openerPos(g)}. Nos alegra profundamente que la experiencia fuera positiva. ${close()}.`,
      `${openerPos(g)}. Gracias por tu visita y por compartirlo. ${close()}.`,
      `${openerPos(g)}. Ojalá verte de nuevo por aquí. ${close()}.`,
    ]);
  }

  // --- NEUTRALES ---
  if (waiter) {
    return `${openerNeu(g)}. ${capitalize(waiterNeg(waiter))}. ${close()}.`;
  }
  if (dishes.length > 0) {
    const d = dishes[0];
    const art = d.startsWith('crema') || d.startsWith('tarta') || d.startsWith('ensal') ? 'la' : 'el';
    const opts: string[] = [];
    if (tiene('espera')) opts.push(`${openerNeu(g)}. Tomamos nota de la espera. ${capitalize(dishRef(d, art))} ${dishPos(d, art)}. ${close()}.`);
    if (tiene('precio')) opts.push(`${openerNeu(g)}. Tomamos nota de los precios. ${capitalize(dishRef(d, art))} ${dishPos(d, art)}. ${close()}.`);
    if (tiene('racion')) opts.push(`${openerNeu(g)}. Revisamos las raciones. ${capitalize(dishRef(d, art))} ${dishPos(d, art)}. ${close()}.`);
    opts.push(
      `${openerNeu(g)}. ${capitalize(dishRef(d, art))}, ${dishPos(d, art)}. ${close()}.`,
      `${openerNeu(g)}. ${capitalize(dishRef(d, art))} ${dishPos(d, art)}. ${close()}.`,
    );
    return pick(opts);
  }
  if (tiene('espera')) return pick([
    `${openerNeu(g)}. Tomamos nota de la espera. ${close()}.`,
    `${openerNeu(g)}. Lo de la espera lo trataremos con el equipo. ${close()}.`,
  ]);
  if (tiene('precio')) return pick([
    `${openerNeu(g)}. Tomamos nota de los precios. ${close()}.`,
    `${openerNeu(g)}. Lo de los precios lo revisaremos. ${close()}.`,
  ]);
  if (tiene('racion')) return pick([
    `${openerNeu(g)}. Revisamos las raciones, tomamos nota. ${close()}.`,
    `${openerNeu(g)}. Lo de las raciones lo tendremos en cuenta. ${close()}.`,
  ]);

  return pick([
    `${openerNeu(g)}. Tomamos nota. ${close()}.`,
    `${openerNeu(g)}. Lo tendremos muy en cuenta. ${close()}.`,
    `${openerNeu(g)}. Cada opinión nos ayuda a mejorar. ${close()}.`,
  ]);
}

function sentimentPrompt(text: string): string {
  const sent = detectSentiment(text);
  if (sent === 'negative') return 'Estrategia ante críticas: mantén la calma, muestra empatía sin aceptar culpas legales o compromisos innecesarios. Invita a escribir al email del negocio o a contactar por teléfono para conversar sobre lo sucedido.';
  if (sent === 'positive') return 'Estrategia ante elogios: celebra el comentario de manera entusiasta pero profesional, agradeciendo la confianza depositada en nuestro trabajo. Invita a una futura visita o contratación de servicios manteniendo la sobriedad en el lenguaje.';
  return 'TONO: opinión mezclada. Agradece la sinceridad y responde a lo que dice.';
}

function buildPrompt(review: string, author: string, businessName?: string): string {
  const name = getFirstName(author);
  const sentGuide = sentimentPrompt(review);

  return `Actúa como el Responsable de Atención al Cliente de un negocio de alta calidad. Tu objetivo es responder a las reseñas de Google Maps de forma humana, profesional, cercana y estratégica.

Sigue estas reglas estrictas:

Personalización: Si la reseña menciona algún servicio específico (ej. "el cambio de aceite", "el corte de pelo", "la limpieza"), una persona del equipo o un detalle de la experiencia, debes mencionarlo explícitamente en la respuesta para demostrar que el comentario ha sido leído y valorado.

Tono: Sé cálido, agradecido y directo. Evita frases robóticas o clichés como 'valoramos su feedback' o 'esperamos verle pronto'. Usa un lenguaje natural y profesional.

${sentGuide}

Está estrictamente prohibido el uso de emojis.

Longitud: Máximo 4-5 frases. Las respuestas deben ser breves y fáciles de leer.

Variación obligatoria: Cada respuesta debe ser completamente distinta a la anterior. Cambia la estructura, el arranque y el cierre. No repitas ni una misma frase de una respuesta a otra.

Idioma: Escribe en un español impecable, natural y adaptado al tono de España.

Nombre del negocio: ${businessName || '[Nombre del Negocio]'}
Nombre del cliente: ${name || 'Cliente'}
Calificación: [disponible]
Texto de la reseña: "${review}"

Genera solo la respuesta, sin explicaciones ni notas previas.`;
}

export async function POST(req: Request) {
  try {
    const { review, rating, author, businessName } = await req.json();
    if (!review || typeof review !== 'string' || review.length < 5) {
      return Response.json({ error: 'Escribe la reseña para generar una respuesta.' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'API key de Gemini no configurada. Añade GOOGLE_AI_API_KEY en las variables de entorno.' }, { status: 500 });
    }

    const safeAuthor = typeof author === 'string' && author.trim() ? author.trim() : 'Cliente';
    const safeBusiness = typeof businessName === 'string' && businessName.trim() ? businessName.trim() : '';
    const prompt = buildPrompt(review, safeAuthor, safeBusiness);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 1.0, maxOutputTokens: 400 },
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('Gemini HTTP error:', res.status, errBody);
      return Response.json({ error: `Gemini respondió con error (${res.status})` }, { status: 502 });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return Response.json({ error: 'Gemini no generó texto de respuesta' }, { status: 502 });
    }

    return Response.json({ response: text.trim() });
  } catch (e) {
    console.error('AURA API error:', e);
    return Response.json({ error: 'Error al generar respuesta' }, { status: 500 });
  }
}
