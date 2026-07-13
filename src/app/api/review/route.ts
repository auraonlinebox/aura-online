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
  const greeting = name
    ? `La persona que escribió la reseña se llama ${name}. Dirígete a él/ella por su nombre de forma natural.`
    : 'No uses nombres, ya que el usuario no tiene un nombre visible válido.';

  return `Eres el dueño de un restaurante respondiendo personalmente a una reseña de Google. Tu tono es cercano, humano, agradecido y natural. NO suenas a robot, NO usas frases hechas.

INSTRUCCIONES:
- ${greeting}
- Menciona ALGO CONCRETO de lo que dice la reseña para mostrar que la has leído.
- Si la reseña menciona un plato concreto (croqueta, arroz, pulpo, carne...), responde sobre ese plato.
- Si la reseña habla del servicio, ambiente o precio, reconócelo.
- Agradécele su tiempo y despidete con calidez.
- NO hagas preguntas retóricas. NO uses "nos encantaría". NO suenes a plantilla.
- Máximo 150 caracteres. Suena a persona real, no a departamento de marketing.

Reseña (${rating} estrellas) de ${author}: "${review}"

Responde SOLO con el texto de la respuesta, sin explicaciones.`;

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
              generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
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
      `${greeting}¡Muchas gracias por tu visita! Nos alegra muchísimo que lo pasaras bien. Trabajamos cada día para que cada cliente se vaya con una sonrisa. ¡Te esperamos pronto!`,
      `${greeting}qué alegría leer tu reseña. Saber que disfrutaste de verdad es lo que nos da energía. Gracias por compartirlo y por recomendarnos. ¡Hasta la próxima!`,
    ];
    const neutrals = [
      `${greeting}gracias por tu sinceridad. Cada opinión nos ayuda a mejorar. Tomamos nota de lo que nos comentas y trabajaremos en ello. Nos encantaría que nos dieras otra oportunidad muy pronto.`,
    ];
    const negatives = [
      `${greeting}sentimos mucho que la experiencia no fuera la esperada. Nos tomamos muy en serio lo que nos cuentas y lo hablaremos con el equipo para que no vuelva a pasar. Nos encantaría invitarte a darle una segunda oportunidad.`,
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
