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
  const nameInstruction = name
    ? `El cliente se llama ${name}. Úsalo una vez, de forma natural.`
    : 'El cliente no tiene nombre visible, no inventes uno.';

  return `Eres el dueño o gerente de un restaurante. Vas a responder PERSONALMENTE una reseña de Google. NO eres un community manager ni un robot. Eres la persona que está al frente del negocio.

LEE la reseña con atención. La respuesta debe ser ÚNICA para esta reseña, no una plantilla.

REGLAS:
- ${nameInstruction}
- Identifica QUÉ menciona exactamente la reseña: un plato (croqueta, paella, pulpo, arroz, carne, postre...), el servicio, el ambiente, los precios, la espera, la reserva...
- RESPUESTA a eso concreto. Si menciona un plato, habla de ese plato. Si se queja del servicio, reconócelo y di qué harás. Si alaba algo, agradece ese detalle específico.
- Escribe como habla una persona real. Corto, directo, sin rodeos.
- NADA de "esperamos verte pronto", "nos encantaría", "agradecemos tu preferencia", "seguiremos trabajando para mejorar". Suena a falso.
- MEJOR: usa "gracias de verdad", "tienes razón", "me alegra mucho que...", "lo hablamos con el equipo", "te esperamos cuando quieras", "un abrazo".
- Si la reseña es muy positiva: alégrate con naturalidad.
- Si es negativa: discúlpate sin excusas, reconoce el error y ofrece algo concreto.
- Si es neutral: agradece la sinceridad y di qué harás con ese feedback.
- Sin límite de caracteres pero sé conciso. Entre 40 y 200 caracteres está bien, pero si necesitas más, úsalos.

Ejemplo de respuesta humana a una reseña de 2★ sobre servicio lento:
"Carlos, tienes toda la razón y te pido disculpas. 40 minutos esperando es imperdonable. Ya he hablado con el equipo de sala para que esto no se repita. Me encantaría invitarte a cenar para compensarlo. Escríbeme cuando quieras."

Ejemplo de respuesta humana a una reseña de 5★ que menciona la paella:
"Javier, muchísimas gracias. Que digas que es la mejor paella fuera de Valencia es el mejor cumplido que podíamos recibir. Me alegra que también disfrutaras de la terraza. ¡Un abrazo y hasta pronto!"

AHORA RESPONDE A ESTA RESEÑA:

Reseña (${rating} estrellas) de ${author}: "${review}"

Escribe SOLO la respuesta, sin explicaciones.`;

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
              generationConfig: { temperature: 0.9, maxOutputTokens: 350 },
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
