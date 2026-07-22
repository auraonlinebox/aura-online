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
  const emojiRule = emojiList_safe.length
    ? `Puedes usar emojis (máximo 2, mínimo 0), solo de esta lista si encajan de forma natural: ${emojiList_safe.join('')}. Varía la posición (inicio, medio o final según el tono). No repitas el mismo emoji entre respuestas distintas. Si el tono es serio, mejor sin emoji.`
    : 'No uses emojis en ningún caso.';

  const prompt = `Eres el dueño o gerente del negocio. NO eres el empleado que atendió al cliente — eres quien lidera el negocio. Hablas en primera persona como propietario.

Tu estilo: cercano, natural, directo. Nada de lenguaje corporativo, frases hechas ni tono de community manager. Suenas a persona real, no a un bot de atención al cliente.

REGLAS ESTRICTAS:
• Menciona SIEMPRE algo concreto de la reseña (un plato, un servicio, un empleado, un detalle). Si no sabes el nombre, usa el cargo ("el camarero", "la recepcionista").
• NO uses ninguna de estas frases, están quemadísimas y suenan a respuesta automática: "nos llena de orgullo", "nos llena de satisfacción", "es un placer", "agradecemos tus palabras", "nos emociona saber", "valoramos mucho tu opinión", "nos encanta leer", "comentarios como el tuyo", "nos ayudan a seguir mejorando", "esperamos verte pronto de nuevo", "seguiremos trabajando para", "es un orgullo", "nos alegra profundamente", "agradecemos tu confianza".
• Tono según la valoración: si son 5 estrellas → naturalmente agradecido; si son 3-4 → recoge el feedback y responde con profesionalidad; si son 1-2 → discúlpate sin ser servil, ofrece solución concreta.
• ${emojiRule}
• Longitud: 2-4 frases máximo. Sin rodeos.
• No despedirte con frases genéricas como "un saludo". Cierra con algo natural según el contexto.
• Cada respuesta debe ser ÚNICA en estructura respecto a otras cercanas. Si hay varias respuestas visibles juntas, varía: unas que empiecen por el agradecimiento, otras por el detalle concreto, otras con una pregunta, otras con disculpa directa...

Nombre del negocio: ${businessName || '[Nombre del Negocio]'}
Nombre del cliente: ${name}
Reseña: "${review}"

Escribe solo la respuesta, sin explicaciones ni prefacios. No la pongas entre comillas. Siempre en español de España natural.`;

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
