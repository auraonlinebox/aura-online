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
  reserva: [/reserva/, /reservado/, /no había mesa/, /confirmad/],
  racion: [/ración/, /racion/, /poco\b/, /escaso/, /cantidad/, /pequeñ/],
  ambiente: [/ambiente/, /local/, /sitio/, /terraza/, /música/, /ruido/, /limpio/, /sucia/, /frío/, /calor/, /decoración/],
  camarero: [/camarero/, /camarera/, /encargado/, /servicio/, /trato/, /atento/, /borde/, /desagradable/],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const openerPos = (g: string) => pick([
  `${g}gracias de corazón`,
  `${g}qué alegría leer esto`,
  `${g}nos llena de satisfacción tu comentario`,
  `${g}gracias por tus palabras`,
  `${g}cuánto nos alegramos de que así fuera`,
  `${g}es un placer recibir reseñas como esta`,
  `${g}de verdad, gracias por tu tiempo`,
  `${g}gracias, qué bonito leer algo así`,
  `${g}nos llega al alma tu comentario`,
  `${g}mil gracias por compartirlo`,
]);
const openerNeg = (g: string) => pick([
  `${g}lamento sinceramente lo ocurrido`,
  `${g}gracias por tu honestidad, la valoro profundamente`,
  `${g}siento mucho que la experiencia no fuera la esperada`,
  `${g}tienes toda la razón y te pido disculpas`,
  `${g}lamento profundamente lo sucedido`,
  `${g}gracias por decirlo con claridad, nos ayuda a mejorar`,
  `${g}lo siento de verdad, no es lo que queremos`,
  `${g}agradezco tu sinceridad y lamento lo que pasó`,
]);
const openerNeu = (g: string) => pick([
  `${g}gracias por tu sinceridad`,
  `${g}agradezco que te hayas tomado el tiempo`,
  `${g}gracias por compartir tu experiencia con honestidad`,
  `${g}valoro mucho tu opinión, gracias`,
  `${g}gracias por escribirnos, nos ayuda a crecer`,
]);
const close = () => pick([
  'Un fuerte abrazo.', 'Recibe un cordial saludo.', 'Con afecto.',
  'Hasta pronto.', 'Esperamos verte de nuevo.',
  'Un abrazo muy sincero.', 'Gracias de nuevo.',
  'Te esperamos con los brazos abiertos.', 'Un saludo afectuoso.',
]);

function dishRef(d: string, art: string): string {
  return pick([
    `que menciones ${art} ${d}`,
    `que hayas destacado ${art} ${d}`,
    `lo que dices de ${art} ${d}`,
    `${art} ${d}`,
    `haber disfrutado de ${art} ${d}`,
  ]);
}
function dishPos(d: string, art: string): string {
  return pick([
    `es un plato que cuidamos con esmero`,
    `es de los que más nos enorgullece ofrecer`,
    `lo elaboramos con dedicación y los mejores productos`,
    `es uno de los que más mimo requiere en cocina`,
    `tiene un proceso que nos apasiona`,
    `es de los que mejor representa nuestra cocina`,
    `lo trabajamos con mucho respeto al producto`,
    `es un clásico que nunca defrauda`,
    `es un plato que llevamos años perfeccionando`,
    `tiene un cariño especial por parte de todo el equipo`,
  ]);
}
function waiterPos(w: string): string {
  return pick([
    `se lo haré saber a ${w}, se alegrará mucho`,
    `voy a trasladarle tu comentario a ${w}, se lo merece`,
    `${w} es un gran profesional, le haré llegar tus palabras`,
    `compartiré tu opinión con ${w}, le hará una ilusión enorme`,
    `no sabes la alegría que le dará a ${w} leer esto`,
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
    if (waiter) {
      return `${openerNeg(g)}. ${waiterNeg(waiter)}. ${close()}`;
    }
    if (tiene('reserva')) {
      return pick([
        `${openerNeg(g)}. Fallar con la reserva no tiene nombre. Hemos revisado el sistema para asegurarnos de que no vuelva a ocurrir. ${close()}`,
        `${openerNeg(g)}. Lo de la reserva fue inaceptable, lo sé. Ya está solucionado. ${close()}`,
        `${openerNeg(g)}. Una reserva confirmada debe honrarse. Ya hemos ajustado el proceso. ${close()}`,
        `${openerNeg(g)}. No hay excusa. Hemos revisado el sistema de reservas para que no se repita. ${close()}`,
      ]);
    }
    if (tiene('espera')) {
      if (dishes.length > 0) {
        const d = dishes[0];
        const art = d.startsWith('crema') || d.startsWith('tarta') || d.startsWith('ensal') ? 'la' : 'el';
        return pick([
          `${openerNeg(g)}. ${esperaRef()} no es aceptable, menos cuando se viene a disfrutar de ${d}. Hemos hablado con el equipo de sala. ${close()}`,
          `${openerNeg(g)}. ${d} merece comerse con calma, no después de esperar así. Ya lo hemos tratado internamente. ${close()}`,
          `${openerNeg(g)}. No es justo. ${dishRef(d, art)} es algo que cuidamos, y la espera no estuvo a la altura. ${close()}`,
        ]);
      }
      return pick([
        `${openerNeg(g)}. ${esperaRef()} fue excesiva. Ya hemos tomado medidas con el equipo. ${close()}`,
        `${openerNeg(g)}. No es admisible tener a nadie esperando así. Está solucionado. ${close()}`,
        `${openerNeg(g)}. ${esperaRef()} no refleja el servicio que queremos dar. Ya está hablado. ${close()}`,
      ]);
    }
    if (tiene('precio')) {
      return pick([
        `${openerNeu(g)}. Tomamos nota de lo que comentas sobre los precios. Lo revisaremos. ${close()}`,
        `${openerNeu(g)}. Agradecemos la observación sobre los precios, la tendremos en cuenta. ${close()}`,
        `${openerNeu(g)}. Gracias por señalarlo. Evaluaremos los precios con atención. ${close()}`,
      ]);
    }
    if (tiene('racion')) {
      return pick([
        `${openerNeu(g)}. Revisaremos las raciones con el equipo de cocina. ${close()}`,
        `${openerNeu(g)}. Tomamos nota de lo de las raciones. Lo hablaremos en cocina. ${close()}`,
        `${openerNeu(g)}. Agradecemos tu comentario sobre las raciones. Lo tendremos muy presente. ${close()}`,
      ]);
    }
    if (tiene('ambiente')) {
      return pick([
        `${openerNeg(g)}. Lo del ambiente lo revisaremos para mejorarlo. ${close()}`,
        `${openerNeu(g)}. Gracias por tu observación sobre el local. Trabajaremos en ello. ${close()}`,
        `${openerNeg(g)}. Tomamos nota de lo que comentas del ambiente. Lo hablaremos en equipo. ${close()}`,
      ]);
    }
    return pick([
      `${openerNeg(g)}. Hemos hablado con el equipo para que no se repita. ${close()}`,
      `${openerNeu(g)}. Gracias por tu sinceridad. Trabajaremos en mejorar. ${close()}`,
      `${openerNeg(g)}. Lamento que no fuera una buena experiencia. Tomamos nota. ${close()}`,
    ]);
  }

  // --- POSITIVAS ---
  if (sentiment === 'positive') {
    if (waiter) {
      return `${openerPos(g)}. ${waiterPos(waiter)}. ${close()}`;
    }
    if (dishes.length > 0) {
      const d = dishes[0];
      const art = d.startsWith('crema') || d.startsWith('tarta') || d.startsWith('ensal') ? 'la' : 'el';
      return pick([
        `${openerPos(g)}. ${dishRef(d, art)} — ${dishPos(d, art)}. ${close()}`,
        `${openerPos(g)}. ${dishPos(d, art)}. ${dishRef(d, art)}. ${close()}`,
        `${openerPos(g)}. ${dishRef(d, art)}, ${dishPos(d, art)}. ${close()}`,
      ]);
    }
    if (tiene('camarero')) {
      return pick([
        `${openerPos(g)}. El trato es tan importante como la comida. Se lo haré saber al equipo. ${close()}`,
        `${openerPos(g)}. El equipo se merece leer comentarios como este. Se lo trasladaré. ${close()}`,
        `${openerPos(g)}. Nos alegra que el servicio estuviera a la altura. Se lo haré llegar. ${close()}`,
      ]);
    }
    if (tiene('ambiente')) {
      return pick([
        `${openerPos(g)}. Nos encanta que el ambiente haya sido de tu agrado. ${close()}`,
        `${openerPos(g)}. El local lo cuidamos con esmero y alegra que se note. ${close()}`,
        `${openerPos(g)}. Que disfrutaras del espacio nos llena de satisfacción. ${close()}`,
      ]);
    }
    return pick([
      `${openerPos(g)}. Nos alegra profundamente que la experiencia fuera positiva. ${close()}`,
      `${openerPos(g)}. Gracias por tu visita y por compartirlo. ${close()}`,
      `${openerPos(g)}. Ojalá verte de nuevo por aquí. ${close()}`,
    ]);
  }

  // --- NEUTRALES ---
  if (waiter) {
    return `${openerNeu(g)}. ${waiterNeg(waiter)}. ${close()}`;
  }
  if (dishes.length > 0) {
    const d = dishes[0];
    const art = d.startsWith('crema') || d.startsWith('tarta') || d.startsWith('ensal') ? 'la' : 'el';
    const opts: string[] = [];
    if (tiene('espera')) opts.push(`${openerNeu(g)}. Tomamos nota de la espera. ${dishRef(d, art)} ${dishPos(d, art)}. ${close()}`);
    if (tiene('precio')) opts.push(`${openerNeu(g)}. Tomamos nota de los precios. ${dishRef(d, art)} ${dishPos(d, art)}. ${close()}`);
    if (tiene('racion')) opts.push(`${openerNeu(g)}. Revisamos las raciones. ${dishRef(d, art)} ${dishPos(d, art)}. ${close()}`);
    opts.push(
      `${openerNeu(g)}. ${dishRef(d, art)} ${dishPos(d, art)}. ${close()}`,
      `${openerNeu(g)}. ${dishPos(d, art)}. ${dishRef(d, art)}. ${close()}`,
    );
    return pick(opts);
  }
  if (tiene('espera')) return pick([
    `${openerNeu(g)}. Tomamos nota de la espera. ${close()}`,
    `${openerNeu(g)}. Lo de la espera lo trataremos con el equipo. ${close()}`,
  ]);
  if (tiene('precio')) return pick([
    `${openerNeu(g)}. Tomamos nota de los precios. ${close()}`,
    `${openerNeu(g)}. Lo de los precios lo revisaremos. ${close()}`,
  ]);
  if (tiene('racion')) return pick([
    `${openerNeu(g)}. Revisamos las raciones con cocina. ${close()}`,
    `${openerNeu(g)}. Lo de las raciones lo tendremos en cuenta. ${close()}`,
  ]);

  return pick([
    `${openerNeu(g)}. Tomamos nota. ${close()}`,
    `${openerNeu(g)}. Lo tendremos muy en cuenta. ${close()}`,
    `${openerNeu(g)}. Cada opinión nos ayuda a mejorar. ${close()}`,
  ]);
}

function sentimentPrompt(text: string): string {
  const sent = detectSentiment(text);
  if (sent === 'negative') return 'TONO: se queja. Discúlpate sin excusas, reconoce el fallo concreto.';
  if (sent === 'positive') return 'TONO: elogia. Agradece con naturalidad, ni empalagoso ni frío.';
  return 'TONO: opinión mezclada. Agradece la sinceridad y responde a lo que dice.';
}

function buildPrompt(review: string, author: string): string {
  const name = getFirstName(author);
  const sentGuide = sentimentPrompt(review);

  return `Eres el dueño o responsable de un negocio en España. Contestas reseñas de Google. IGNORA las estrellas, LEE el texto.

${sentGuide}

CADA RESPUESTA debe ser ÚNICA, elegante y memorable. No repitas estructuras ni palabras.

REGLAS:
- Busca QUÉ menciona (un plato, un camarero, espera, precio, reserva...) y responde a ESO.
- Si habla de un plato → habla de ESE plato. Si se queja de algo → discúlpate por ESO concretamente.
- Usa el nombre si está:${name ? ` "${name}"` : ''}
- MÁXIMO 3 frases. Directo. Sin introducciones.

TONO: cercano pero elegante. Dueño de restaurante con clase, que habla desde el corazón pero con estilo. Nada de "buf", "jolín", "tela", "flipar" — eso es demasiado vulgar. Usa expresiones como "gracias de corazón", "nos llena de satisfacción", "lamento sinceramente", "lo trabajamos con dedicación".

PROHIBIDO: "agradecemos su preferencia", "nos complace", "valoramos su opinión", "te invito a cenar", "para demostrártelo", "ajustar lo que no funcionó", "cuidamos con cariño", "lo mimamos", "me alegra un montón", "buf", "jolín", "anda", "jo", "tela", "madre mía", "flipar".

VARIACIÓN OBLIGATORIA: cada respuesta debe ser completamente distinta a la anterior. Cambia el arranque, el desarrollo y el cierre.

EJEMPLOS (son solo orientación, cada respuesta debe ser única):

María | "La crema de calabaza increíble. El camarero Javier fenomenal."
→ "María, gracias de corazón. La crema de calabaza es un plato que cuidamos con esmero, y alegra que lo hayas disfrutado. Se lo haré saber a Javier, se lo merece. Un fuerte abrazo."

Carlos | "Comida buena pero 40 minutos esperando. Servicio nefasto."
→ "Carlos, lamento sinceramente la espera. No es el servicio que queremos ofrecer. Ya hemos hablado con el equipo de sala para que no se repita. Recibe un cordial saludo."

Antonio | "La comida buena pero Juan el camarero es muy desagradable. No volveré."
→ "Antonio, gracias por tu honestidad, la valoro profundamente. Lo ocurrido con Juan no nos representa. Ya hemos tratado el tema con él. Esperamos verte de nuevo."

AHORA ESCRIBE UNA RESPUESTA ÚNICA Y ELEGANTE (no copies ningún ejemplo anterior, sé original):

${author}: "${review}"

Escribe SOLO la respuesta.`;

}

export async function POST(req: Request) {
  try {
    const { review, rating, author } = await req.json();
    if (!review || typeof review !== 'string' || review.length < 5) {
      return Response.json({ error: 'Escribe la reseña para generar una respuesta.' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const safeAuthor = typeof author === 'string' && author.trim() ? author.trim() : 'Cliente';
    const prompt = buildPrompt(review, safeAuthor);

    if (apiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 1.0, maxOutputTokens: 400 },
            }),
            signal: AbortSignal.timeout(20000),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return Response.json({ response: text.trim() });
        }
      } catch {}
    }

    const response = buildFallback(review, safeAuthor);
    return Response.json({ response });
  } catch {
    return Response.json({ error: 'Error al generar respuesta' }, { status: 500 });
  }
}
