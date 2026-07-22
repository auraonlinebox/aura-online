export async function analyzeKeywords(reviews: { text: string }[]): Promise<{ positive: { keyword: string; count: number }[]; negative: { keyword: string; count: number }[] }> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not configured');

  const texts = reviews.map(r => r.text).join('\n---\n');

  const prompt = `Analiza estas reseñas de Google y extrae palabras clave temáticas (máximo 5 positivas y 5 negativas) con el número de veces que se mencionan en las reseñas.

Responde SOLO con JSON en este formato exacto, sin explicaciones ni código:
{"positive":[{"keyword":"...","count":N}],"negative":[{"keyword":"...","count":N}]}

Reseñas:
${texts}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (!res.ok) throw new Error(`Gemini keyword error: ${res.status}`);

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini no generó keywords');

  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();
  return JSON.parse(cleaned);
}

export async function generateResponse(review: string, author: string, businessName?: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not configured');

  const name = author?.trim()?.split(/[\s.]+/)?.[0] || 'Cliente';

  const prompt = `Eres el Responsable de Atención al Cliente de un negocio. Tu objetivo es responder reseñas de Google Maps de forma humana, profesional, cercana y estratégica.

Reglas:
- Personalización: Si la reseña menciona un servicio específico, menciónalo explícitamente.
- Tono: Cálido, agradecido y directo. Lenguaje natural, sin clichés robóticos.
- Emojis: Máximo 2, mínimo 0. CRÍTICO: varía la posición de los emojis en cada respuesta — unas veces al inicio ("❤️ Mil gracias, María"), otras en medio ("nos alegramos mucho 😊 de que hayas disfrutado"), otras al final ("¡Te esperamos! 🙌"), y otras combinados. NUNCA pongas todos los emojis al final. Usa emojis contextualizados a la reseña (comida: 🍽️🥘, servicio: 👏🤝, resultados: 💪✅, ambiente: 🌟, gratitud: 🙏❤️, volver: 🔄). Prohibido repetir los mismos emojis entre respuestas distintas. Si ningún emoji encaja, no pongas ninguno.
- Longitud: Máximo 4-5 frases.
- Idioma: Español de España, impecable y natural.
- **OBLIGATORIO — Estructuras de apertura**: Elige UNA de estas 7 opciones, sin repetir la misma en respuestas consecutivas del mismo lote:
  1. "Gracias por tomarte el tiempo de escribirnos, [nombre]. Nos alegra especialmente que menciones..."
  2. "Valoramos mucho tu opinión, [nombre]. Que hayas destacado... nos llena de satisfacción."
  3. "Nos encanta leer experiencias como la tuya, [nombre]. El hecho de que ... demuestra que vamos por buen camino."
  4. "Agradecemos tus palabras, [nombre]. Para nosotros es importante saber que... ha sido de tu agrado."
  5. "Es un placer recibir reseñas tan constructivas como la tuya, [nombre]. Tomamos nota de... y te esperamos de nuevo."
  6. "Nos emociona saber que... , [nombre]. Comentarios como el tuyo nos ayudan a seguir mejorando día a día."
  7. [Crea una apertura completamente original que no se parezca a ninguna de las anteriores ni a las usadas en otras respuestas.]

Nombre del negocio: ${businessName || '[Nombre del Negocio]'}
Nombre del cliente: ${name}
Texto de la reseña: "${review}"

Genera solo la respuesta, sin explicaciones.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 1.3 } }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini no generó texto');

  return text.trim();
}
