'use client';

import { useState, useEffect } from 'react';

const EMOJIS = ['😊', '🙌', '👏', '💪', '⭐', '❤️', '🔥', '🎯', '👍', '🌟', '🍽️', '🤝', '✅', '🙏', '✨', '🎉', '💎', '🤩', '😍', '💯', '🫶', '👀', '🏆', '🚗', '💇', '🦷', '🧹', '🌿', '🐾', '🎊'];

export default function NewProspect() {
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [reviews, setReviews] = useState([{ author: '', text: '', rating: 5 }]);
  const [editingSlug, setEditingSlug] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('edit');
    if (!slug) { setLoadingData(false); return; }
    setEditingSlug(slug);
    fetch(`/api/prospect?slug=${slug}`).then(r => r.json()).then(data => {
      if (data.businessName) setBusinessName(data.businessName);
      if (data.businessEmail) setBusinessEmail(data.businessEmail);
      if (data.reviews?.length) setReviews(data.reviews.map((r: any) => ({ author: r.author, text: r.text, rating: r.rating || 5 })));
    }).catch(() => {}).finally(() => setLoadingData(false));
  }, []);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [generated, setGenerated] = useState(false);
  const [sent, setSent] = useState(false);
  const [slug, setSlug] = useState('');
  const [responses, setResponses] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState(false);
  const [via, setVia] = useState('instagram_dm');
  const [personality, setPersonality] = useState(1.3);
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>(['😊', '🙌', '👏']);

  const validate = () => {
    const errs: string[] = [];
    if (!businessName.trim()) errs.push('Nombre del negocio');
    reviews.every((r, i) => {
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

  const generateAll = async () => {
    if (!validate()) return;
    setLoading(true);
    setProgress('Generando respuestas...');
    setGenerated(false);
    setSent(false);
    try {
      const res = await fetch('/api/generate-examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examples: reviews.map(r => ({ text: r.text, author: r.author, business: businessName })),
          personality: 1.3,
          emojis: ['😊', '🙌', '👏'],
        }),
      });
      if (!res.ok) throw new Error('Error al generar');
      const data = await res.json();
      if (data.examples) {
        setResponses(data.examples.map((e: any, i: number) => ({ ...reviews[i], response: e.response })));
        setGenerated(true);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const regenerateOne = async (i: number) => {
    const r = responses[i];
    if (!r) return;
    try {
      const res = await fetch('/api/generate-examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examples: [{ text: r.text, author: r.author, business: businessName }],
          personality,
          emojis: selectedEmojis,
        }),
      });
      const d = await res.json();
      if (d.examples?.[0]?.response) {
        const copy = [...responses];
        copy[i] = { ...copy[i], response: d.examples[0].response };
        setResponses(copy);
      }
    } catch {}
  };

  const regenerateAll = async () => {
    setLoading(true);
    setProgress('Regenerando todas...');
    try {
      const res = await fetch('/api/generate-examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examples: reviews.map(r => ({ text: r.text, author: r.author, business: businessName })),
          personality,
          emojis: selectedEmojis,
        }),
      });
      const data = await res.json();
      if (data.examples) {
        setResponses(data.examples.map((e: any, i: number) => ({ ...reviews[i], response: e.response })));
      }
    } catch {}
    setLoading(false);
    setProgress('');
  };

  const finish = async () => {
    if (!generated) return;
    setLoading(true);
    setProgress('Guardando prospecto...');
    try {
      const currentSlug = editingSlug;
      const STORAGE_URL = 'https://aura-storage.entretorres1x2.workers.dev';
      let finalSlug = currentSlug;

      if (currentSlug) {
        await fetch(`${STORAGE_URL}/prospect/${currentSlug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: businessName.trim(),
            businessEmail: businessEmail.trim() || undefined,
            reviews: reviews.map((r, i) => ({ ...r, rating: Number(r.rating), response: responses[i]?.response })),
            readAt: 0,
          }),
        });
      } else {
        const slugRes = await fetch('/api/prospect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: businessName.trim(),
            businessEmail: businessEmail.trim() || undefined,
            reviews: reviews.map((r, i) => ({ ...r, rating: Number(r.rating), response: responses[i]?.response })),
          }),
        });
        const slugData = await slugRes.json();
        finalSlug = slugData.slug;
        setSlug(slugData.slug);
      }

      if (currentSlug) {
        await fetch(`${STORAGE_URL}/prospect/${currentSlug}/resent`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timestamp: Date.now() }),
        }).catch(() => {});
      } else {
        await fetch('/api/log-prospect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: businessName.trim(),
            businessEmail: businessEmail.trim(),
            reviews: reviews.map(r => ({ author: r.author, text: r.text, rating: r.rating })),
            slug: `/prospect/${finalSlug}`,
            via,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {});
      }

      if ((via === 'email' || currentSlug) && businessEmail.trim()) {
        setProgress('Enviando email...');
        await fetch('/api/send-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: businessName.trim(),
            businessEmail: businessEmail.trim(),
            reviews: reviews.map((r) => ({ ...r, rating: Number(r.rating) })),
            slug: finalSlug,
            prospectUrl: `https://aura-online.es/prospect/${finalSlug}`,
          }),
          signal: AbortSignal.timeout(120000),
        });
      }

      setSent(true);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const reviewBlocks = responses.map((r, i) =>
    `👤 ${r.author} ${'⭐'.repeat(r.rating)}\n"${r.text}"\n✍️ Respuesta de AURA: ${r.response}`
  ).join('\n\n');

  const msgText =
    `${businessName} ¿Quién responde vuestras reseñas de GOOGLE?\n\n` +
    `👋 Hola! Soy Ana de AURA - Reputación Digital\n\n` +
    `He preparado respuestas automatizadas para las reseñas de Google de ${businessName} más recientes. Por ejemplo:\n\n` +
    `${reviewBlocks.split('\n\n')[0]}\n\n` +
    `✅ Responder reseñas sube tu valoración en Google y mejora tu reputación online.\n` +
    `❌ No responder… las críticas sin respuesta ahuyentan clientes.\n\n` +
    `🔗 Aquí tenéis las respuestas completas y el análisis:\nhttps://aura-online.es/prospect/${slug}\n\n` +
    `Sin compromiso. Echadle un vistazo y si os gusta, hablamos.\n\n` +
    `👉 https://aura-online.es`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <a href="/tracking" className="text-orange-500 text-sm hover:underline">&larr; Volver al tracking</a>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{editingSlug ? 'Reenviar prospecto' : 'Nuevo prospecto'}</h1>
        <p className="text-gray-500 mb-8">{editingSlug ? 'Revisa los datos, corrige lo que falte y reenvía.' : 'Introduce los datos del negocio, genera las respuestas y compártelas.'}</p>
        {loadingData && <p className="text-gray-400 text-center py-8">Cargando...</p>}
        {!loadingData && <><div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Nombre del negocio</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300" placeholder="Ej: Corto y Cambio" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Email (opcional)</label>
              <input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300" placeholder="info@negocio.com" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Método de envío</label>
              <select value={via} onChange={(e) => setVia(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-orange-300">
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
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

          {!generated && !sent && (
            <button onClick={generateAll} disabled={loading} className="w-full py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 text-base">
              {loading ? (progress || 'Generando...') : '🚀 Generar respuestas'}
            </button>
          )}

          {/* Generated responses + controls */}
          {generated && !sent && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800 font-medium">Aquí tienes las respuestas. Edítalas directamente o ajústalas con los controles de abajo.</p>
              </div>

              {responses.map((r, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{r.author}</span>
                      <span className="text-amber-400 text-sm">{'⭐'.repeat(r.rating)}</span>
                    </div>
                    <button onClick={() => regenerateOne(i)} className="text-xs text-orange-500 hover:text-orange-600 font-medium">🔄 Regenerar</button>
                  </div>
                  <p className="text-sm text-gray-500 italic">"{r.text}"</p>
                  <textarea value={r.response} onChange={(e) => { const copy = [...responses]; copy[i] = { ...copy[i], response: e.target.value }; setResponses(copy); }} rows={3} className="w-full px-3 py-2 border border-orange-200 rounded-xl text-sm resize-y bg-orange-50 focus:outline-none focus:border-orange-300" />
                </div>
              ))}

              {/* Personalidad + Emojis (post-generation) */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-500 font-medium">Personalidad</label>
                    <span className="text-xs text-gray-400">{personality <= 0.8 ? 'Conservadora' : personality <= 1.2 ? 'Equilibrada' : 'Creativa'}</span>
                  </div>
                  <input type="range" min="0.5" max="1.5" step="0.1" value={personality} onChange={(e) => setPersonality(parseFloat(e.target.value))} className="w-full accent-orange-500" />
                  <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
                    <span>0.5</span><span>0.7</span><span>0.9</span><span>1.1</span><span>1.3</span><span>1.5</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-2">Emojis en respuestas <span className="text-gray-300 font-normal">(solo si encajan)</span></label>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => setSelectedEmojis(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])} className={`w-8 h-8 text-base flex items-center justify-center rounded-lg border transition-all ${selectedEmojis.includes(e) ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200 opacity-40 hover:opacity-80'}`}>{e}</button>
                    ))}
                  </div>
                </div>
                <button onClick={regenerateAll} disabled={loading} className="w-full py-2.5 bg-orange-100 text-orange-700 font-medium rounded-xl hover:bg-orange-200 transition-all text-sm">
                  {loading ? (progress || 'Regenerando...') : '🔄 Regenerar todas con estos ajustes'}
                </button>
              </div>

              <button onClick={finish} disabled={loading} className="w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 text-base">
                {loading ? (progress || 'Guardando...') : '✅ Guardar prospecto y enviar'}
              </button>
            </div>
          )}

          {sent && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
              <p className="text-sm text-green-800 font-medium">
                ✅ Prospecto guardado para {businessName}
                {via === 'email' && businessEmail ? ` — email enviado a ${businessEmail}` : ''}
              </p>

              {slug && responses.length > 0 && (
                <>
                  <a href={`/prospect/${slug}?status=1`} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all text-sm text-center">
                    👁️ Ver prospecto completo
                  </a>
                  <textarea defaultValue={msgText} rows={10} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-y font-mono" />
                  <div className="flex flex-col gap-2">
                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(msgText)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-all text-sm">
                      Enviar por WhatsApp
                    </a>
                    <button onClick={() => { navigator.clipboard.writeText(msgText); setCopiedText(true); setTimeout(() => setCopiedText(false), 2000); }} className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all text-sm">
                      {copiedText ? '¡Copiado!' : 'Copiar texto (Instagram / X / redes)'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div></>}
      </div>
    </div>
  );
}