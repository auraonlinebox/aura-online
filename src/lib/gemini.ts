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
- Emojis: Muy importante — varía los emojis constantemente. No repitas los mismos en respuestas diferentes. Usa emojis contextualizados al contenido de la reseña. Si la reseña habla de comida, usa 🍽️ 🥘; si habla de atención al cliente, usa 👏 🤝; si de resultados, 💪 ✅; si de ambiente, 🌟 🎯; si de gratitud, 🙏 ❤️; si de volver, 🔄 🏃; etc. Máximo 3, mínimo 0. Si ningún emoji encaja de forma natural, no pongas ninguno. Deben sentirse parte del mensaje, no decoración pegada. Prohibido repetir los mismos emojis en respuestas distintas. Nada de banderas ni emojis exóticos.
- Longitud: Máximo 4-5 frases.
- Idioma: Español de España, impecable y natural.
- **Variedad obligatoria**: No empieces siempre con "Hola [nombre]". Alterna formas de apertura: agradecimiento directo, mención del servicio, frase de feedback, etc. Cada respuesta debe sonar distinta, nada repetitivo.

Nombre del negocio: ${businessName || '[Nombre del Negocio]'}
Nombre del cliente: ${name}
Texto de la reseña: "${review}"

Genera solo la respuesta, sin explicaciones.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 1.2 } }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini no generó texto');

  return text.trim();
}
