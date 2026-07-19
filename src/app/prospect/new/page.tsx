'use client';

import { useState } from 'react';

export default function NewProspect() {
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [reviews, setReviews] = useState([{ author: '', text: '', rating: 5 }]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [preview, setPreview] = useState<{ html: string; responses: any[]; keywords: any; subject: string } | null>(null);
  const [sent, setSent] = useState(false);
  const [slug, setSlug] = useState('');
  const [responses, setResponses] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState(false);
  const [via, setVia] = useState('email');

  const validate = () => {
    const errs: string[] = [];
    if (!businessName.trim()) errs.push('Nombre del negocio');
    const valid = reviews.every((r, i) => {
      if (!r.author.trim()) { errs.push(`Autor de la reseña #${i + 1}`); return false; }
      if (!r.text.trim()) { errs.push(`Texto de la reseña #${i + 1}`); return false; }
      return true;
    });
    setErrors(errs);
    return errs.length === 0;
  };

  const addReview = () => {
    if (reviews.length >= 6) return;
    setReviews([...reviews, { author: '', text: '', rating: 5 }]);
  };

  const removeReview = (i: number) => {
    if (reviews.length <= 1) return;
    setReviews(reviews.filter((_, idx) => idx !== i));
  };

  const updateReview = (i: number, field: string, value: string | number) => {
    const copy = [...reviews];
    (copy[i] as any)[field] = value;
    setReviews(copy);
  };

  const generatePreview = async () => {
    if (!validate()) return;
    setLoading(true);
    setProgress('Generando respuestas con IA...');
    setPreview(null);
    setSent(false);
    try {
      const res = await fetch('/api/send-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          businessEmail: businessEmail.trim() || 'demo@example.com',
          reviews: reviews.map((r) => ({ ...r, rating: Number(r.rating) })),
          preview: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error');
      }
      const data = await res.json();
      setPreview({
        html: data.html,
        responses: data.responses,
        keywords: data.keywords,
        subject: `${businessName.trim()} — tus reseñas de Google respondidas con AURA`,
      });
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const finish = async () => {
    if (!preview) return;
    setLoading(true);
    setProgress('Guardando...');
    try {
      const responsesData = preview.responses;

      // 1. Create prospect in KV
      const slugRes = await fetch('/api/prospect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          reviews: reviews.map((r, i) => ({ ...r, rating: Number(r.rating), response: responsesData[i]?.response })),
          keywords: preview.keywords || null,
        }),
      });
      const slugData = await slugRes.json();
      setSlug(slugData.url);
      setResponses(responsesData);

      // 2. Log to GSheet
      await fetch('/api/log-prospect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          businessEmail: businessEmail.trim(),
          reviews: reviews.map(r => ({ author: r.author, text: r.text, rating: r.rating })),
          slug: slugData.url,
          via,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});

      // 3. If via is email and email exists, send email (non-blocking)
      if (via === 'email' && businessEmail.trim()) {
        setProgress('Enviando email...');
        await fetch('/api/send-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: businessName.trim(),
            businessEmail: businessEmail.trim(),
            reviews: reviews.map((r) => ({ ...r, rating: Number(r.rating) })),
          }),
          signal: AbortSignal.timeout(120000),
        }).catch(() => {});
      }

      setSent(true);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; Volver</a>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Nuevo prospecto</h1>
        <p className="text-gray-500 mb-8">Introduce los datos del negocio, genera las respuestas y compártelas.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Nombre del negocio</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="Ej: Corto y Cambio" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Email (opcional)</label>
              <input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="info@negocio.com" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Método de envío</label>
              <select value={via} onChange={(e) => setVia(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100">
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="formulario_contacto">Formulario de contacto</option>
                <option value="instagram_dm">Instagram DM</option>
                <option value="otro">Otros</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500 font-medium">Reseñas sin contestar ({reviews.length}/6)</label>
              {reviews.length < 6 && (
                <button onClick={addReview} className="text-xs text-orange-500 hover:text-orange-600 font-medium">+ Añadir reseña</button>
              )}
            </div>
            {reviews.map((r, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-xl bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                  {reviews.length > 1 && (
                    <button onClick={() => removeReview(i)} className="text-xs text-red-400 hover:text-red-500">Eliminar</button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={r.author} onChange={(e) => updateReview(i, 'author', e.target.value)} placeholder="Autor" className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300" />
                  <select value={r.rating} onChange={(e) => updateReview(i, 'rating', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-orange-300">
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'⭐'.repeat(n)}</option>)}
                  </select>
                </div>
                <textarea value={r.text} onChange={(e) => updateReview(i, 'text', e.target.value)} placeholder="Texto de la reseña" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 resize-none" />
              </div>
            ))}
          </div>

          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs text-red-600 font-medium mb-1">Completa los siguientes campos:</p>
              <ul className="list-disc list-inside text-xs text-red-500 space-y-0.5">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {!preview && !sent && (
            <button onClick={generatePreview} disabled={loading} className="w-full py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 text-base">
              {loading ? (progress || 'Generando...') : '🚀 Generar preview'}
            </button>
          )}

          {preview && !sent && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800 font-medium">✅ Preview generada</p>
                {via === 'email' && businessEmail && (
                  <>
                    <p className="text-xs text-blue-600 mt-1">Asunto: {preview.subject}</p>
                    <p className="text-xs text-blue-600">Para: {businessEmail}</p>
                  </>
                )}
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto bg-white">
                <iframe srcDoc={preview.html} className="w-full h-[500px]" title="Preview del email" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={finish}
                  disabled={loading}
                  className="flex-1 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {loading ? (progress || 'Guardando...') : '✅ Generar respuestas'}
                </button>
                <button
                  onClick={generatePreview}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-sm"
                >
                  Regenerar
                </button>
              </div>
            </div>
          )}

          {sent && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
              <p className="text-sm text-green-800 font-medium">
                ✅ Respuestas generadas para {businessName}
                {via === 'email' && businessEmail ? ` — email enviado a ${businessEmail}` : ''}
              </p>
              {slug && responses.length > 0 && (() => {
            const reviewBlocks = responses.map((r, i) =>
              `👤 ${r.author} ${'⭐'.repeat(r.rating)}\n"${r.text}"\n✅ ${r.response}`
            ).join('\n\n');

            const msgText =
              `👋 Hola, soy Ana de AURA - Reputación Digital\n\n` +
              `He visto que gestionáis un volumen altísimo de clientes en ${businessName} y que muchos se toman la molestia de dejaros una reseña. ¡Eso es señal de que hacéis un gran trabajo! 🎯\n\n` +
              `Me dedico a ayudar a negocios como el vuestro a cerrar ese círculo: que el cliente se sienta escuchado sin que eso suponga una carga extra para vosotros.\n\n` +
              `📋 Ponemos algunas de vuestras reseñas más recientes:\n\n${reviewBlocks}\n\n` +
              `💡 ¿Por qué elegir AURA?\n` +
              `1️⃣ Responder rápido sube tu estrella — los negocios que responden en menos de 24h mejoran su valoración media hasta un 0.3★\n` +
              `2️⃣ El 89% de los clientes lee las respuestas — una respuesta profesional convierte a un indeciso en cliente\n` +
              `3️⃣ Sin AURA, pierdes clientes cada día — cada reseña sin responder es una oportunidad perdida\n` +
              `4️⃣ El algoritmo de Google te favorece — cuantas más reseñas respondas, mejor apareces en búsquedas locales\n\n` +
              `🔍 Aquí podéis verlo todo en detalle:\n${slug}\n\n` +
              `🔥 Tus clientes hablan. AURA responde. Tú ganas.\n\n` +
              `👉 Probar AURA gratis: https://aura-online.es\n\n` +
              `📧 Si tenéis cualquier duda, escribidnos: auraonlinebox@gmail.com`;

            return (
              <>
                <div className="flex flex-col gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(msgText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-all text-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Enviar por WhatsApp
                  </a>
                  <button
                    onClick={() => { navigator.clipboard.writeText(msgText); setCopiedText(true); setTimeout(() => setCopiedText(false), 2000); }}
                    className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all text-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    {copiedText ? '¡Copiado!' : 'Copiar texto (Instagram / X / redes)'}
                  </button>
                </div>
              </>
            );
          })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
