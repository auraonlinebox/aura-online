export async function generateResponse(review: string, author: string, businessName?: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not configured');

  const name = author?.trim()?.split(/[\s.]+/)?.[0] || 'Cliente';

  const prompt = `Eres el Responsable de Atención al Cliente de un negocio. Tu objetivo es responder reseñas de Google Maps de forma humana, profesional, cercana y estratégica.

Reglas:
- Personalización: Si la reseña menciona un servicio específico, menciónalo explícitamente.
- Tono: Cálido, agradecido y directo. Lenguaje natural, sin clichés robóticos.
- Prohibido el uso de emojis.
- Longitud: Máximo 4-5 frases.
- Idioma: Español de España, impecable y natural.

Nombre del negocio: ${businessName || '[Nombre del Negocio]'}
Nombre del cliente: ${name}
Texto de la reseña: "${review}"

Genera solo la respuesta, sin explicaciones.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini no generó texto');

  return text.trim();
}
