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
  `${g}anda, gracias`,
  `${g}jo, gracias`,
  `${g}ay, gracias`,
  `${g}buf, gracias`,
  `${g}vaya, gracias`,
  `${g}hombre, gracias`,
  `${g}pues nada, gracias`,
  `${g}toma ya, gracias`,
  `${g}jolín, gracias`,
  `${g}qué alegría, gracias`,
  `${g}cuánto me alegro, gracias`,
  `${g}nada, gracias`,
]);
const openerNeg = (g: string) => pick([
  `${g}buf, lo siento`,
  `${g}jolín, lo siento`,
  `${g}vaya, lo siento`,
  `${g}ay, lo siento`,
  `${g}madre mía, lo siento`,
  `${g}tela, lo siento`,
  `${g}qué mal, lo siento`,
  `${g}jo, lo siento mucho`,
  `${g}pues nada, lo siento`,
  `${g}hombre, lo siento de verdad`,
]);
const openerNeu = (g: string) => pick([
  `${g}gracias`,
  `${g}pues nada, gracias`,
  `${g}anda, gracias`,
  `${g}jo, gracias por decirlo`,
  `${g}vaya, gracias por la sinceridad`,
  `${g}hombre, gracias por escribir`,
]);
const close = () => pick([
  '¡Un abrazo!', '¡Un saludo!', '¡Hasta pronto!', '¡Gracias!', '¡Nos vemos!',
  '¡Esperamos verte pronto!', '¡Un abrazo grande!', '¡Nada, gracias!',
  '¡Ahí estamos!', '¡Te esperamos!', '¡Gracias de corazón!',
]);

function dishRef(d: string, art: string): string {
  return pick([
    `lo de ${art} ${d}`,
    `que menciones ${art} ${d}`,
    `que te gustara ${art} ${d}`,
    `que probaras ${art} ${d}`,
    `lo de ${art} ${d} que dices`,
    `${art} ${d}`,
  ]);
}
function dishPos(d: string, art: string): string {
  return pick([
    `tiene su cosa, esa receta`,
    `es de los platos que más nos piden`,
    `no sabes lo que nos gusta leer esto`,
    `es de los que más nos enorgullecen`,
    `la verdad, es un plato que nos encanta hacer`,
    `tiene su historia detrás`,
    `la cocina le echa horas a ese plato`,
    `qué bien que lo digas, es un clásico aquí`,
    `lo hacemos con ganas, la verdad`,
  ]);
}

function waiterPos(w: string): string {
  return pick([
    `se lo voy a decir ahora mismo a ${w}`,
    `${w} se va a poner contento cuando lo lea`,
    `voy a leérselo a ${w}, se lo merece`,
    `${w} va a flipar cuando se lo cuente`,
    `al ${w} le voy a leer tu comentario, se va a alegrar`,
    `se lo voy a pasar a ${w}, le hará ilusión`,
  ]);
}
function waiterNeg(w: string): string {
  return pick([
    `lo que pasaste con ${w} no es normal, ya hemos hablado`,
    `${w} no tendría que haber hecho eso, lo hemos tratado`,
    `ya lo hemos hablado con ${w}, no te preocupes`,
    `lo siento, con ${w} ya hemos hablado para que no se repita`,
    `no tiene excusa lo de ${w}, ya está hablado`,
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
        `${openerNeg(g)}. Fallar con la reserva no tiene nombre. Ya hemos revisado el sistema para que no vuelva a pasar. ${close()}`,
        `${openerNeg(g)}. Lo de la reserva es imperdonable, lo sé. Ya lo hemos arreglado. ${close()}`,
        `${openerNeg(g)}. Con las reservas no se juega, y lo nuestro falló. Ya está solucionado. ${close()}`,
        `${openerNeg(g)}. No hay excusa para lo de la reserva. Ya lo hemos hablado en equipo. ${close()}`,
      ]);
    }
    if (tiene('espera')) {
      if (dishes.length > 0) {
        const d = dishes[0];
        return pick([
          `${openerNeg(g)}. ${esperaRef()} no es normal, menos para venir a tomar ${d}. Lo hemos hablado en sala. ${close()}`,
          `${openerNeg(g)}. ${d} merece comerse sin prisas, pero no esperando tanto. Lo hablamos con el equipo. ${close()}`,
          `${openerNeg(g)}. Con ${d} no se juega, y menos con la espera. Ya lo hemos tratado. ${close()}`,
        ]);
      }
      return pick([
        `${openerNeg(g)}. ${esperaRef()} fue demasiado. Lo hemos hablado con el equipo de sala. ${close()}`,
        `${openerNeg(g)}. No es normal tener así a la gente. Ya hemos tomado nota. ${close()}`,
        `${openerNeg(g)}. ${esperaRef()} no se le hace a nadie. Ya está hablado. ${close()}`,
        `${openerNeg(g)}. Lo sé, fue mucho tiempo. Lo hemos tratado internamente. ${close()}`,
      ]);
    }
    if (tiene('precio')) {
      return pick([
        `${openerNeu(g)}. Tomamos nota de los precios. ${close()}`,
        `${openerNeu(g)}. Lo de los precios lo revisamos. ${close()}`,
        `${openerNeu(g)}. Gracias por decirlo, lo miramos. ${close()}`,
      ]);
    }
    if (tiene('racion')) {
      return pick([
        `${openerNeu(g)}. Lo de las raciones lo miramos con cocina. ${close()}`,
        `${openerNeu(g)}. Revisamos las raciones, tienes razón. ${close()}`,
        `${openerNeu(g)}. Tomamos nota de las raciones, lo hablamos con el equipo. ${close()}`,
      ]);
    }
    if (tiene('ambiente')) {
      return pick([
        `${openerNeg(g)}. Lo del ambiente lo hablamos para mejorarlo. ${close()}`,
        `${openerNeu(g)}. Lo del local lo tenemos en cuenta. ${close()}`,
        `${openerNeg(g)}. Tomamos nota de lo del ambiente. ${close()}`,
      ]);
    }
    return pick([
      `${openerNeg(g)}. Hablamos con el equipo para que no se repita. ${close()}`,
      `${openerNeu(g)}. Tomamos nota para mejorar. ${close()}`,
      `${openerNeg(g)}. No es nuestra intención. Trabajamos en ello. ${close()}`,
      `${openerNeg(g)}. De verdad, lo sentimos. Lo miramos. ${close()}`,
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
        `${openerPos(g)}. ${dishRef(d, art)} ${dishPos(d, art)}. ${close()}`,
        `${openerPos(g)}. ${dishRef(d, art)} — ${dishPos(d, art)}. ${close()}`,
        `${openerPos(g)}. ${dishPos(d, art)}. ${dishRef(d, art)}. ${close()}`,
        `${openerPos(g)}. ${dishRef(d, art)}, ${dishPos(d, art)}. ${close()}`,
      ]);
    }
    if (tiene('camarero')) {
      return pick([
        `${openerPos(g)}. Me alegra que el trato fuera bueno. Se lo digo al equipo. ${close()}`,
        `${openerPos(g)}. El equipo se va a poner contento con esto. ${close()}`,
        `${openerPos(g)}. Lo del servicio se lo paso al equipo, se lo merecen. ${close()}`,
        `${openerPos(g)}. Qué bien que el servicio estuviera a la altura. Se lo digo. ${close()}`,
      ]);
    }
    if (tiene('ambiente')) {
      return pick([
        `${openerPos(g)}. Nos encanta que el sitio guste. ${close()}`,
        `${openerPos(g)}. Me alegra que disfrutaras del ambiente. ${close()}`,
        `${openerPos(g)}. El local es acogedor y nos gusta que se note. ${close()}`,
      ]);
    }
    return pick([
      `${openerPos(g)}. Me alegra que lo pasaras bien. ${close()}`,
      `${openerPos(g)}. Nos alegra que todo fuera bien. ${close()}`,
      `${openerPos(g)}. Gracias por venir y por tu comentario. ${close()}`,
      `${openerPos(g)}. Qué bien que la experiencia fuera buena. ${close()}`,
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
    `${openerNeu(g)}. Lo de la espera lo hablamos con el equipo. ${close()}`,
  ]);
  if (tiene('precio')) return pick([
    `${openerNeu(g)}. Tomamos nota de los precios. ${close()}`,
    `${openerNeu(g)}. Lo de los precios lo revisamos. ${close()}`,
  ]);
  if (tiene('racion')) return pick([
    `${openerNeu(g)}. Revisamos las raciones. ${close()}`,
    `${openerNeu(g)}. Lo de las raciones lo miramos con cocina. ${close()}`,
  ]);

  return pick([
    `${openerNeu(g)}. Tomamos nota. ${close()}`,
    `${openerNeu(g)}. Lo tenemos en cuenta. ${close()}`,
    `${openerNeu(g)}. Cada opinión nos ayuda. ${close()}`,
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

  return `Eres el dueño de un restaurante en España. Contestas reseñas de Google. IGNORA las estrellas, LEE el texto.

${sentGuide}

CADA VEZ escribe algo DISTINTO: cambia la estructura, las palabras, el cierre. No repitas frases.

REGLAS:
- Busca QUÉ menciona (un plato, un camarero, espera, precio, reserva...) y responde a ESO.
- Si habla de un plato → habla de ESE plato. Si se queja de algo → discúlpate por ESO.
- Usa el nombre si está:${name ? ` "${name}"` : ''}
- MÁXIMO 3 frases. Directo. Sin introducciones.

PROHIBIDO: "agradecemos su preferencia", "nos complace", "valoramos su opinión", "te invito a cenar", "para demostrártelo", "ajustar lo que no funcionó", "cuidamos con cariño", "lo mimamos", "me alegra un montón".
USA variedad: "buf", "jolín", "anda", "vaya", "hombre", "jo", "madre mía", "tela" según el caso.

VARIACIÓN OBLIGATORIA: cada respuesta debe sonar distinta. Cambia el arranque, el desarrollo y el cierre.

EJEMPLOS (son solo para orientación, no copies):

María | "La crema de calabaza increíble. El camarero Javier fenomenal."
→ "María, jo, gracias. Lo de la crema de calabaza tiene su cosa. Y a Javier le voy a leer tu comentario. ¡Un abrazo!"

Carlos | "Comida buena pero 40 minutos esperando. Servicio nefasto."
→ "Carlos, madre mía, lo siento. 40 minutos esperando no se le hace a nadie. Ya lo hemos hablado en sala. ¡Un saludo!"

Antonio | "La comida buena pero Juan el camarero es muy desagradable. No volveré."
→ "Antonio, buf, lo siento. Lo de Juan no es normal. Ya lo hemos tratado. Gracias por decirlo."

AHORA ESCRIBE UNA RESPUESTA NUEVA Y DISTINTA (no copies ningún ejemplo anterior):

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
