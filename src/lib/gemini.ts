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

export async function generateResponse(review: string, author: string, businessName?: string, temperature?: number, emojiList?: string[]): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not configured');

  const name = author?.trim()?.split(/[\s.]+/)?.[0] || 'Cliente';
  const temp = temperature ?? 1.3;
  const emojiList_safe = emojiList?.length ? emojiList : ['😊', '🙌', '👏', '💪', '⭐', '❤️', '🔥', '🎯', '👍', '🌟'];
  const emojiLine = `- Emojis: Máximo 2, mínimo 0. Solo de esta lista si encajan: ${emojiList_safe.join('')}. Posición variable (inicio, medio o final). Prohibido repetir el mismo emoji entre respuestas.`;

  const prompt = `Eres el dueño o encargado de un negocio y respondes reseñas de Google Maps. Habla como una persona real, no como un community manager ni un bot.

Reglas:
- Natural: Responde como si hablaras directamente con el cliente. Frases cortas, directas, sin rodeos.
- Específico: Menciona el plato, servicio o detalle concreto que el cliente destacó en su reseña.
- Prohibido usar estas frases: "nos llena de orgullo", "nos llena de satisfacción", "es un placer", "agradecemos tus palabras", "nos emociona saber", "valoramos mucho tu opinión", "nos encanta leer", "comentarios como el tuyo", "nos ayudan a seguir mejorando". Suena falso y robótico.
${emojiLine}
- Longitud: 2-4 frases como máximo. Directo al grano.
- Idioma: Español de España natural.
- VARIEDAD: Cada respuesta debe tener una estructura distinta. Alterna: agradecer algo concreto, devolver el cumplido, explicar un detalle, invitar a volver, preguntar algo, etc.

Nombre del negocio: ${businessName || '[Nombre del Negocio]'}
Nombre del cliente: ${name}
Texto de la reseña: "${review}"

Genera solo la respuesta, sin explicaciones.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: temp } }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini no generó texto');

  return text.trim();
}
