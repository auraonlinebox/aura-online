export async function POST(req: Request) {
  try {
    const { review, rating } = await req.json();
    if (!review || typeof review !== 'string' || review.length < 5) {
      return Response.json({ error: 'Escribe la reseña para generar una respuesta.' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const stars = rating || '?';
    const prompt = `Eres AURA, un asistente de gestión de reputación para restaurantes. Responde a esta reseña de Google de forma profesional, empática y humana. La respuesta debe sonar a dueño del restaurante, no a robot.

Reseña recibida (${stars} estrellas): "${review}"

Responde SOLO con el texto de la respuesta, sin explicaciones ni introducción. Mínimo 40 caracteres, máximo 200. La respuesta debe agradecer, abordar el feedback y despedirse cordialmente.`;

    if (apiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
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

    // Fallback templates
    const positives = [
      `¡Muchas gracias por tu visita y por tomarte el tiempo de compartir tu experiencia! Nos alegra muchísimo que disfrutaras de tu tiempo con nosotros. Tus palabras nos motivan a seguir mejorando cada día. Te esperamos pronto. ¡Un saludo!`,
      `Agradecemos de corazón tu valoración tan positiva. Para nosotros es una satisfacción saber que nuestro esfuerzo se refleja en tu experiencia. Trabajamos cada día para ofrecer lo mejor a nuestros clientes. ¡Hasta pronto!`,
      `Nos encanta leer reseñas como la tuya. Saber que te fuiste contento es nuestra mayor recompensa. Muchas gracias por recomendarnos y por confiar en nosotros. Te esperamos con los brazos abiertos cuando quieras volver.`,
    ];
    const neutrals = [
      `Gracias por tu visita y por compartir tu opinión. Tomamos muy en serio todos los comentarios para seguir mejorando. Nos encantaría que nos dieras otra oportunidad y poder ofrecerte una experiencia aún mejor. ¡Te esperamos!`,
      `Agradecemos tu sinceridad. Cada opinión nos ayuda a identificar áreas de mejora y a ofrecer un mejor servicio. Trabajaremos en ello. Esperamos verte de nuevo por aquí para demostrarte que podemos hacerlo mejor.`,
    ];
    const negatives = [
      `Lamentamos mucho que tu experiencia no estuviera a la altura de lo que esperas de nosotros. Tomamos nota de tus comentarios y los trasladaremos a nuestro equipo para mejorar. Nos encantaría tener la oportunidad de compensarte en tu próxima visita.`,
      `Sentimos no haber cumplido con tus expectativas. Para nosotros cada cliente es importante y nos tomamos muy en serio tu feedback. Trabajaremos en los puntos que nos indicas para ofrecer un mejor servicio. Esperamos verte pronto de nuevo.`,
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
