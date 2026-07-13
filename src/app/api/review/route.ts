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

function detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const t = text.toLowerCase();
  const neg = ['pésimo', 'pésima', 'fatal', 'nefasto', 'terrible', 'horrible', 'desastre', 'malo', 'mala', 'peor', 'nunca', 'no volver', 'no vuelvo', 'no recomend', 'queja', 'enfadado', 'decepcion', 'lento', 'tarde', 'esperando', 'sucia', 'fría', 'caro', 'cara', 'carísimo', 'carisimo', 'desagradable', 'malísimo', 'malisimo'];
  const pos = ['espectacular', 'increíble', 'increible', 'fenomenal', 'excelente', 'maravilloso', 'perfecto', 'encantador', 'riquísimo', 'riquisimo', 'delicioso', 'estupendo', 'genial', 'fantástico', 'fantastico', 'recomiendo', 'repetiremos', 'volveremos', 'inolvidable', 'brutal', 'impecable'];

  const negCount = neg.filter(w => t.includes(w)).length;
  const posCount = pos.filter(w => t.includes(w)).length;

  if (negCount > posCount) return 'negative';
  if (posCount > negCount) return 'positive';
  return 'neutral';
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

INSTRUCCIÓN CLAVE: Busca en el texto qué menciona EXACTAMENTE y responde a ESO. No hagas un mensaje genérico.

PASOS:
1. LEE la reseña palabra por palabra.
2. ENCUENTRA los puntos clave: ¿un plato concreto? (croqueta, paella, pulpo, arroz, crema, tartar...), ¿el servicio?, ¿el ambiente?, ¿los precios?, ¿la espera?, ¿una reserva?, ¿un camarero?
3. RESPONDE solo a esos puntos. Si menciona un plato, habla de ESE plato. Si menciona a un camarero, responde sobre él. Si se queja de algo, discúlpate por ESO concretamente.
4. USA el nombre si está visible.${name ? ` Se llama ${name}.` : ''}
5. CIERRA corto: "un abrazo", "hasta pronto", "te esperamos".

NO USAR: frases hechas de robot como "agradecemos su preferencia", "nos complace", "valoramos su opinión", "te invito a cenar", "para demostrártelo", "ajustar lo que no funcionó".
USA: "gracias de verdad", "tienes razón", "lo siento", "lo hablamos con el equipo", "me alegra un montón".

MÁXIMO 3 FRASES. Sin introducciones. Directo. Suena a persona real, no a community manager.

EJEMPLOS:

Cliente: María | "La crema de calabaza increíble. El camarero Javier fenomenal."
→ "María, gracias de verdad. Me alegra un montón que te gustara la crema de calabaza, la hacemos con mucho cariño. Y Javier se va a llevar tu comentario a casa. ¡Os esperamos!"

Cliente: Carlos | "Comida buena pero 40 minutos esperando. Servicio nefasto."
→ "Carlos, disculpa, tienes razón. 40 minutos esperando no se le hace a nadie. Ya he hablado con el equipo de sala. Esperamos verte de nuevo."

Cliente: Antonio | "La comida buena pero Juan el camarero es muy desagradable. No volveré."
→ "Antonio, lo siento mucho. Lo que pasaste con Juan no es aceptable. Ya lo hemos hablado con él. Gracias por decirlo."

AHORA RESPONDE A ESTA RESEÑA (IGNORA LAS ESTRELLAS, LEE SOLO EL TEXTO):

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

    const firstName = getFirstName(safeAuthor);
    const greeting = firstName ? `${firstName}, ` : '';
    const sentiment = detectSentiment(review);

    const positives = [
      `${greeting}gracias de verdad. Me alegra un montón que lo pasaras bien. ¡Te esperamos!`,
      `${greeting}gracias por venir. Nos alegra que todo fuera bien. ¡Hasta pronto!`,
    ];
    const neutrals = [
      `${greeting}gracias por tu sinceridad. Tomamos nota de lo que dices. Un saludo.`,
      `${greeting}gracias por tomarte el tiempo de escribir. Nos ayuda. Un saludo.`,
    ];
    const negatives = [
      `${greeting}siento mucho lo que pasaste. Hablaremos con el equipo. Gracias por decirlo.`,
      `${greeting}tienes razón y lo siento. No es lo que queremos. Tomamos nota. Un saludo.`,
    ];

    let templates: string[];
    if (sentiment === 'positive') templates = positives;
    else if (sentiment === 'negative') templates = negatives;
    else templates = neutrals;

    const response = templates[Math.floor(Math.random() * templates.length)];
    return Response.json({ response });
  } catch {
    return Response.json({ error: 'Error al generar respuesta' }, { status: 500 });
  }
}
