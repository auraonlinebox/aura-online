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

function buildPrompt(review: string, rating: number | string, author: string): string {
  const name = getFirstName(author);
  const saludo = name ? `El cliente se llama ${name}. Dile "gracias, ${name}" de forma natural, como si lo conocieras.` : 'No uses nombre, no aparece.';

  return `Eres el dueño de un restaurante en España. Un cliente acaba de escribir una reseña de Google sobre tu negocio. Vas a contestarle TÚ mismo, como persona, no como empresa.

LEE la reseña y responde SOLO a lo que dice. Si habla de un plato, habla de ese plato. Si habla del servicio, responde sobre el servicio. Si habla de los precios, responde sobre los precios. Si habla de la espera, responde sobre la espera.

${saludo}

TONO: español de verdad, cálido, agradecido, sin palabras raras. Frases cortas. Suena a persona normal, no a marketing. Nada de "agradecemos su preferencia", "nos complace informarle", "seguiremos trabajando para mejorar" — eso suena a falso.

SI LA RESEÑA ES POSITIVA (4-5★): dale las gracias por algo concreto que haya dicho. Ej: "María, muchísimas gracias. Me alegra que te gustara el arroz, lo preparamos con mucho cariño. Un abrazo y hasta pronto."

SI LA RESEÑA ES NEGATIVA (1-2★): discúlpate sin excusas, reconoce su queja concreta y di qué harás. Ej: "Carlos, tienes razón y lo siento. 40 minutos esperando no tiene perdón. Ya hemos hablado con los camareros para que no vuelva a pasar. Te esperamos cuando quieras."

SI ES NEUTRAL (3★): agradece su sinceridad y responde al punto concreto que mencione.

AHORA RESPONDE A ESTA:

Reseña (${rating} estrellas) de ${author}: "${review}"

Escribe SOLO la respuesta, sin explicaciones. Nada de "como dueño del restaurante". Nada de introducciones. Directo al grano.`;

}

export async function POST(req: Request) {
  try {
    const { review, rating, author } = await req.json();
    if (!review || typeof review !== 'string' || review.length < 5) {
      return Response.json({ error: 'Escribe la reseña para generar una respuesta.' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const stars = rating || '?';
    const safeAuthor = typeof author === 'string' && author.trim() ? author.trim() : 'Cliente';
    const prompt = buildPrompt(review, stars, safeAuthor);

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

    const positives = [
      `${greeting}de verdad, gracias. Leer esto me hace el día. Trabajamos cada día para que cada cliente se vaya contento y saber que lo conseguimos es lo mejor. ¡Un abrazo y hasta pronto!`,
      `${greeting}me alegra muchísimo que lo pasaras bien. Esto es lo que nos motiva cada mañana. Gracias por tomarte el tiempo de escribirnos. Te esperamos cuando quieras.`,
      `${greeting}qué bonito mensaje. De verdad, gracias. Me encanta cuando la gente nota el cariño que le ponemos a esto. Nos vemos pronto, un abrazo.`,
    ];
    const neutrals = [
      `${greeting}gracias por tu sinceridad, de verdad. Cada opinión nos ayuda a mejorar. He tomado nota de lo que comentas y lo hablaremos en el equipo. Ojalá nos des otra oportunidad para demostrarte que podemos hacerlo mejor.`,
      `${greeting}agradezco que te hayas tomado el tiempo de escribir. Tus comentarios me sirven para mejorar. Espero verte de nuevo por aquí para que notes los cambios. Un saludo.`,
    ];
    const negatives = [
      `${greeting}siento muchísimo lo que pasaste. No es la experiencia que queremos dar. Ya hemos hablado con el equipo para solucionarlo. Me encantaría que volvieras como invitado para demostrarte que no somos así. Cuéntame cuándo te va bien.`,
      `${greeting}lamento de verdad lo que ocurrió. Tienes razón en todo lo que dices. Ya estamos trabajando en ello para que no vuelva a pasar. Si me das una oportunidad, te invito personalmente a cenar para compensarlo.`,
    ];

    let templates: string[];
    if (stars === '?' || Number(stars) >= 4) templates = positives;
    else if (Number(stars) >= 3) templates = neutrals;
    else templates = negatives;

    const response = templates[Math.floor(Math.random() * templates.length)];
    return Response.json({ response });
  } catch {
    return Response.json({ error: 'Error al generar respuesta' }, { status: 500 });
  }
}
