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

  return `Eres el dueño de un restaurante en España. Vas a contestar una reseña de Google. Tienes que sonar como una persona real, no como un departamento de marketing.

FORMA DE TRABAJAR:
1. LEE la reseña.
2. SACA los detalles importantes: ¿nombra un plato? (croqueta, paella, pulpo, arroz, crema de calabaza, tartar, carne, postre...), ¿habla del servicio? (camarero, espera, atención), ¿del ambiente? (terraza, decoración, espacio), ¿de los precios?, ¿de una reserva?
3. RESPONDE a esos detalles. Si dice "el pulpo a la gallega espectacular", dile algo sobre el pulpo. Si dice "el camarero Javier nos trató fenomenal", menciónalo. Si dice "esperamos 40 minutos", discúlpate por eso concreto.
4. USA el nombre del cliente si es visible.${name ? ` El cliente se llama ${name}.` : ''}
5. CIERRA con algo corto y cálido: "un abrazo", "hasta pronto", "te esperamos".

FRASES QUE NUNCA USAR: "agradecemos su preferencia", "nos complace informarle", "valoramos su opinión", "seguiremos trabajando para mejorar", "esperamos verte pronto", "te invito a cenar", "invitarte personalmente". Eso suena a robot.

FRASES QUE SÍ USAR: "gracias de verdad", "tienes razón", "me alegra que mencionaras...", "lo he hablado con el equipo", "te esperamos cuando quieras", "un abrazo".

NO escribas más de 3 frases. Sé directo. Nada de introducciones. Nada de "como dueño del restaurante". Empieza con el nombre si lo tienes, o con "gracias" directamente.

EJEMPLOS DE RESPUESTAS QUE ESTÁN BIEN:

Cliente: María | 5★ | "Espectacular todo. La crema de calabaza y el tartar de atún son increíbles. El camarero Javier nos trató fenomenal."
Respuesta: "María, muchísimas gracias. Me alegra especialmente que mencionaras la crema de calabaza y el tartar — son dos platos que cuidamos mucho. Y Javier se va a llevar tu comentario a casa, se lo merece. ¡Os esperamos cuando queráis!"

Cliente: Carlos | 2★ | "La comida buena pero el servicio nefasto. Estuvimos 40 minutos esperando para que nos tomaran nota."
Respuesta: "Carlos, gracias por ser sincero y disculpa la espera. No es normal y ya hemos hablado con el equipo para que no vuelva a pasar. Esperamos verte de nuevo y que sea una experiencia mucho mejor. Un saludo."

Cliente: Laura | 4★ | "El pulpo a la gallega espectacular. El único pero es que el local se queda pequeño los fines de semana."
Respuesta: "Laura, gracias por tu visita. El pulpo a la gallega es uno de nuestros platos estrella y me alegra que lo disfrutaras. Tienes razón con el espacio los fines de semana — estamos buscando soluciones. ¡Hasta pronto!"

Cliente: Javier | 5★ | "La mejor paella que he probado fuera de Valencia. La terraza encantadora."
Respuesta: "Javier, viniendo de alguien que entiende de paella, tu comentario nos llega al corazón. Me alegra que también disfrutaras de la terraza. ¡Te esperamos cuando quieras!"

Cliente: Ana | 3★ | "Bien pero caro. Las raciones pequeñas y los precios altos."
Respuesta: "Ana, gracias por tu sinceridad. Tomamos nota de lo de las raciones, lo revisaremos con el equipo de cocina. Un saludo."

Cliente: David | 1★ | "Teníamos reserva y no había mesa. Mala organización."
Respuesta: "David, lamento muchísimo lo que pasó. No tiene excusa. Ya hemos revisado el sistema de reservas para que no se repita. Esperamos que nos des una segunda oportunidad."

AHORA RESPONDE A ESTA:

Reseña (${rating} estrellas) de ${author}: "${review}"

Escribe SOLO la respuesta.`;

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
      `${greeting}siento muchísimo lo que pasaste. No es la experiencia que queremos dar. Ya hemos hablado con el equipo para solucionarlo. Esperamos que nos des otra oportunidad y poder demostrarte que podemos hacerlo mejor.`,
      `${greeting}lamento de verdad lo que ocurrió. Tienes razón. Ya estamos trabajando en ello para que no vuelva a pasar. Esperamos verte de nuevo por aquí.`,
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
