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

const EJEMPLOS = `
⭐ RESEÑA 5★: "Espectacular todo. La crema de calabaza y el tartar de atún son increíbles. El camarero Javier nos trató fenomenal."
RESPUESTA: "María, muchísimas gracias. Me alegra especialmente que mencionaras la crema de calabaza y el tartar — son dos platos que cuidamos mucho. Y Javier se va a llevar tu comentario a casa, se lo merece. ¡Os esperamos cuando queráis!"

⭐ RESEÑA 2★: "La comida buena pero el servicio nefasto. Estuvimos 40 minutos esperando para que nos tomaran nota."
RESPUESTA: "Carlos, gracias por ser sincero. Lamento muchísimo la espera, no es lo que queremos que viváis aquí. Ya hemos hablado con el equipo para organizar mejor los turnos. Me encantaría que nos dieras otra oportunidad para demostrártelo. Un abrazo."

⭐ RESEÑA 4★: "Muy buena experiencia. El pulpo a la gallega espectacular y el arroz con leche casero riquísimo. El único pero es que el local se queda pequeño los fines de semana."
RESPUESTA: "Laura, gracias por tu visita. El pulpo a la gallega es uno de nuestros platos estrella y me alegra que lo disfrutaras. Tienes razón con el espacio los fines de semana — estamos mirando cómo mejorarlo. ¡Hasta pronto!"

⭐ RESEÑA 5★: "La mejor paella que he probado fuera de Valencia. El trato inmejorable y la terraza encantadora."
RESPUESTA: "Javier, viniendo de alguien que entiende de paella, tu comentario nos llega al corazón. Me alegra que también disfrutaras de la terraza. ¡Te esperamos cuando quieras!"

⭐ RESEÑA 3★: "Bien pero caro para lo que ofrece. Las raciones son pequeñas y los precios algo elevados. El sitio está bien decorado."
RESPUESTA: "Ana, gracias por tu sinceridad, nos ayuda mucho. Tomamos nota de lo de las raciones, lo revisaremos con el equipo de cocina. Me alegra que el ambiente te gustara. Ojalá nos des otra oportunidad."

⭐ RESEÑA 1★: "Un desastre. Teníamos reserva confirmada y cuando llegamos no había mesa. Mala organización."
RESPUESTA: "David, lamento profundamente lo que pasó. Es imperdonable que tengas una reserva y al llegar no esté todo preparado. Ya hemos revisado el sistema para que no vuelva a ocurrir. Me encantaría invitarte personalmente a cenar para demostrarte que no somos así."
`;

function buildPrompt(review: string, rating: number | string, author: string): string {
  const name = getFirstName(author);
  const saludo = name ? `El cliente se llama ${name}. Úsalo de forma natural al empezar, como "gracias, ${name}".` : 'No uses nombre, el cliente no tiene nombre visible.';

  return `Eres el dueño de un restaurante en España. Vas a responder UNA reseña de Google. Tu respuesta debe sonar EXACTAMENTE como los ejemplos de abajo: naturales, españoles de verdad, agradecidos, mencionando lo concreto que dice cada cliente.

LEE la reseña, busca QUÉ menciona (un plato, el servicio, la espera, los precios, el ambiente...) y responde a ESO. No generalices. No repitas frases hechas.

${saludo}

ESTOS SON EJEMPLOS DE RESPUESTAS QUE SUENAN BIEN. IMITA ESTE TONO:
${EJEMPLOS}

AHORA RESPONDE A ESTA:

Reseña (${rating} estrellas) de ${author}: "${review}"

Escribe SOLO la respuesta, sin explicaciones. Directo.`;

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
