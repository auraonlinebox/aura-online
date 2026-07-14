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
  const patterns = [
    /camarero\s+(\S+)/i, /camarera\s+(\S+)/i, /encargado\s+(\S+)/i,
    /(\S+)\s+el\s+camarero/i, /(\S+)\s+la\s+camarera/i,
  ];
  const t = text.toLowerCase();
  for (const pat of patterns) {
    const m = t.match(pat);
    if (m && m[1].length > 2 && /^[a-záéíóúñ]+$/.test(m[1])) return m[1];
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

function buildFallback(review: string, author: string): string {
  const name = getFirstName(author);
  const greeting = name ? `${name}, ` : '';
  const t = review.toLowerCase();
  const sentiment = detectSentiment(review);
  const dishes = getDishes(review);
  const waiter = getWaiterName(review);

  const tiene = (topic: keyof typeof topics) => hasTopic(t, topics[topic]);

  // --- NEGATIVAS ---
  if (sentiment === 'negative') {
    if (waiter) {
      return pick([
        `${greeting}lo siento mucho. Lo que pasaste con ${waiter} no es normal. Ya hablamos con él. Gracias por decirlo.`,
        `${greeting}disculpa, ${waiter} no tendría que haber actuado así. Lo hemos hablado. Ojalá nos des otra oportunidad.`,
        `${greeting}lo siento. ${waiter} se ha equivocado y ya lo hemos tratado. Gracias por ser sincero.`,
      ]);
    }
    if (tiene('reserva')) {
      return pick([
        `${greeting}lo siento mucho. Fallar con la reserva no tiene perdón. Ya revisamos el sistema. Esperamos verte de nuevo.`,
        `${greeting}disculpa, es imperdonable. La reserva tendría que estar. Ya lo hemos arreglado para que no se repita.`,
        `${greeting}siento mucho lo de la reserva. No volverá a pasar. Un saludo.`,
      ]);
    }
    if (tiene('espera')) {
      if (dishes.length > 0) {
        const d = dishes[0];
        return pick([
          `${greeting}tienes razón. Esperar así ${dishes.length > 1 ? 'para comer' : 'para un'} ${d} no es normal. Lo hablamos con el equipo.`,
          `${greeting}disculpa. La espera fue demasiado, y${d.includes('de') ? '' : ' para'} ${d} no es lo normal. Ya lo hemos hablado.`,
        ]);
      }
      return pick([
        `${greeting}disculpa, tienes razón. La espera fue demasiado. Ya lo hablamos con el equipo de sala. Un saludo.`,
        `${greeting}lo siento. No es normal esperar tanto. Tomamos nota y hablamos con el equipo. Esperamos verte de nuevo.`,
        `${greeting}siento mucho la espera. Ya hemos hablado con sala para que no se repita.`,
      ]);
    }
    if (tiene('precio')) {
      return pick([
        `${greeting}gracias por decirlo. Tomamos nota de los precios. Un saludo.`,
        `${greeting}gracias por la sinceridad. Revisaremos los precios. Un saludo.`,
      ]);
    }
    if (tiene('racion')) {
      return pick([
        `${greeting}gracias por la sinceridad. Revisaremos las raciones con cocina. Un saludo.`,
        `${greeting}tomas nota. Lo de las raciones lo miramos. Gracias.`,
      ]);
    }
    if (tiene('ambiente')) {
      return pick([
        `${greeting}gracias por decirlo. Lo tendremos en cuenta para mejorar. Un saludo.`,
        `${greeting}lo siento. Lo del ambiente lo hablamos con el equipo para mejorarlo.`,
      ]);
    }
    return pick([
      `${greeting}siento mucho lo que pasaste. Hablamos con el equipo. Gracias por decirlo.`,
      `${greeting}gracias por la sinceridad. Tomamos nota para mejorar. Un saludo.`,
      `${greeting}lo siento. No es la experiencia que queremos dar. Trabajamos en ello.`,
    ]);
  }

  // --- POSITIVAS ---
  if (sentiment === 'positive') {
    if (waiter) {
      return pick([
        `${greeting}gracias de verdad. ${waiter} se va a alegrar un montón cuando se lo diga. ¡Te esperamos!`,
        `${greeting}me alegra un montón lo que dices de ${waiter}. Se lo voy a leer. ¡Hasta pronto!`,
        `${greeting}gracias. ${waiter} es un gran profesional. Se lo digo de tu parte. ¡Te esperamos!`,
      ]);
    }
    if (dishes.length > 0) {
      const d = dishes[0];
      const art = d.startsWith('crema') || d.startsWith('tarta') || d.startsWith('ensal') ? 'la' : 'el';
      return pick([
        `${greeting}gracias de verdad. Me alegra un montón que te gustara ${art} ${d}, lo cocinamos con mucho cariño. ¡Te esperamos!`,
        `${greeting}gracias. ${art} ${d} es de los platos que más mimamos. Me alegra que lo disfrutaras. ¡Hasta pronto!`,
        `${greeting}qué alegría leer esto. Lo de ${art} ${d} lo cuidamos mucho. ¡Te esperamos cuando quieras!`,
      ]);
    }
    if (tiene('camarero')) {
      return pick([
        `${greeting}gracias de verdad. Me alegra que el trato fuera bueno. Se lo digo al equipo. ¡Te esperamos!`,
        `${greeting}gracias. El equipo se va a poner contento con tu comentario. ¡Te esperamos!`,
      ]);
    }
    if (tiene('ambiente')) {
      return pick([
        `${greeting}gracias de verdad. Me alegra que disfrutaras del ambiente. ¡Te esperamos!`,
        `${greeting}gracias. Nos encanta que el sitio guste. ¡Hasta pronto!`,
      ]);
    }
    return pick([
      `${greeting}gracias de verdad. Me alegra un montón que lo pasaras bien. ¡Te esperamos!`,
      `${greeting}gracias. Nos alegra que todo fuera bien. ¡Hasta pronto!`,
      `${greeting}gracias por venir y por tu comentario. ¡Os esperamos cuando queráis!`,
    ]);
  }

  // --- NEUTRALES ---
  if (waiter) {
    return pick([
      `${greeting}gracias por tu sinceridad. Lo que dices de ${waiter} lo hablamos. Un saludo.`,
      `${greeting}gracias. Lo de ${waiter} lo tratamos. Tomamos nota de todo.`,
    ]);
  }
  if (dishes.length > 0) {
    const d = dishes[0];
    const art = d.startsWith('crema') || d.startsWith('tarta') || d.startsWith('ensal') ? 'la' : 'el';
    const opts: string[] = [];
    if (tiene('espera')) opts.push(`${greeting}gracias. Tomamos nota de la espera. Me alegra que te gustara ${art} ${d}. Un saludo.`);
    if (tiene('precio')) opts.push(`${greeting}gracias. Tomamos nota de los precios. Me alegra que disfrutaras ${art} ${d}. Un saludo.`);
    if (tiene('racion')) opts.push(`${greeting}gracias. Revisamos las raciones. Nos alegra que probaras ${art} ${d}.`);
    opts.push(
      `${greeting}gracias por tu visita. Nos alegra que probaras ${art} ${d}. Tomamos nota. Un saludo.`,
      `${greeting}gracias. ${art} ${d} es de los que más nos piden. Tomamos nota de todo.`,
    );
    return pick(opts);
  }
  if (tiene('espera')) return pick([
    `${greeting}gracias por decirlo. Tomamos nota de la espera. Un saludo.`,
    `${greeting}gracias. Lo de la espera lo hablamos con el equipo.`,
  ]);
  if (tiene('precio')) return pick([
    `${greeting}gracias. Tomamos nota de los precios. Un saludo.`,
    `${greeting}gracias por la sinceridad. Lo de los precios lo revisamos.`,
  ]);
  if (tiene('racion')) return pick([
    `${greeting}gracias. Revisaremos las raciones. Un saludo.`,
    `${greeting}gracias. Lo de las raciones lo miramos con cocina.`,
  ]);

  return pick([
    `${greeting}gracias por tu sinceridad. Tomamos nota. Un saludo.`,
    `${greeting}gracias por escribirnos. Lo tenemos en cuenta.`,
    `${greeting}gracias. Cada opinión nos ayuda. Un saludo.`,
  ]);
}

function sentimentPrompt(text: string): string {
  const sent = detectSentiment(text);
  if (sent === 'negative') return 'La reseña es NEGATIVA (queja, crítica). Discúlpate sin excusas, reconoce el problema concreto y di qué harás. No finjas alegría.';
  if (sent === 'positive') return 'La reseña es POSITIVA (elogio). Agradece con naturalidad y menciona algún detalle concreto que haya dicho.';
  return 'La reseña es NEUTRAL (opinión mezclada o sin carga). Agradece la sinceridad y responde al punto concreto que mencione.';
}

function buildPrompt(review: string, author: string): string {
  const name = getFirstName(author);
  const sentGuide = sentimentPrompt(review);

  return `Eres el dueño de un restaurante en España. Vas a contestar una reseña de Google. IGNORA las estrellas. LEE el TEXTO y responde SOLO a lo que dice.

${sentGuide}

CADA VEZ que generes una respuesta, debe ser DIFERENTE a la anterior. No repitas la misma estructura siempre.

INSTRUCCIÓN CLAVE: Busca en el texto qué menciona EXACTAMENTE y responde a ESO. No hagas un mensaje genérico.

PASOS:
1. LEE la reseña palabra por palabra.
2. ENCUENTRA los puntos clave: ¿un plato concreto? (croqueta, paella, pulpo, arroz, crema, tartar...), ¿el servicio?, ¿el ambiente?, ¿los precios?, ¿la espera?, ¿una reserva?, ¿un camarero?
3. RESPONDE solo a esos puntos. Si menciona un plato, habla de ESE plato. Si menciona a un camarero, responde sobre él. Si se queja de algo, discúlpate por ESO concretamente.
4. USA el nombre si está visible.${name ? ` Se llama ${name}.` : ''}
5. CIERRA corto: "un abrazo", "hasta pronto", "te esperamos". Varía el cierre cada vez.

NO USAR: frases hechas de robot como "agradecemos su preferencia", "nos complace", "valoramos su opinión", "te invito a cenar", "para demostrártelo", "ajustar lo que no funcionó".
USA: "gracias de verdad", "tienes razón", "lo siento", "lo hablamos con el equipo", "me alegra un montón".

MÁXIMO 3 FRASES. Sin introducciones. Directo. Suena a persona real, no a community manager. VARIACIÓN: cada respuesta debe sonar distinta.

EJEMPLOS (son solo referencia, NO los copies exactos):

María | "La crema de calabaza increíble. El camarero Javier fenomenal."
→ "María, gracias de verdad. Me alegra un montón que te gustara la crema de calabaza, la hacemos con mucho cariño. Y Javier se va a llevar tu comentario a casa. ¡Os esperamos!"

Carlos | "Comida buena pero 40 minutos esperando. Servicio nefasto."
→ "Carlos, disculpa, tienes razón. 40 minutos esperando no se le hace a nadie. Ya he hablado con el equipo de sala. Esperamos verte de nuevo."

Antonio | "La comida buena pero Juan el camarero es muy desagradable. No volveré."
→ "Antonio, lo siento mucho. Lo que pasaste con Juan no es aceptable. Ya lo hemos hablado con él. Gracias por decirlo."

AHORA RESPONDE A ESTA RESEÑA (IGNORA LAS ESTRELLAS, LEE SOLO EL TEXTO). DIFERENTE a todo lo anterior:

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
