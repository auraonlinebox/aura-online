'use client';

import { useState } from 'react';

export default function NewProspect() {
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [reviews, setReviews] = useState([{ author: '', text: '', rating: 5 }]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [preview, setPreview] = useState<{ html: string; responses: any[]; subject: string } | null>(null);
  const [sent, setSent] = useState(false);
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = () => {
    const errs: string[] = [];
    if (!businessName.trim()) errs.push('Nombre del negocio');
    if (!businessEmail.trim()) errs.push('Email del negocio');
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
          businessEmail: businessEmail.trim(),
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
        subject: `${businessName.trim()} — tus reseñas de Google respondidas con AURA`,
      });
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const sendEmail = async () => {
    if (!preview) return;
    setLoading(true);
    setProgress('Enviando email...');
    try {
      const res = await fetch('/api/send-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          businessEmail: businessEmail.trim(),
          reviews: reviews.map((r) => ({ ...r, rating: Number(r.rating) })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error');
      }
      setSent(true);

      const data = await res.json();
      const slugRes = await fetch('/api/prospect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          reviews: reviews.map((r, i) => ({ ...r, rating: Number(r.rating), response: data.responses[i]?.response })),
        }),
      });
      const slugData = await slugRes.json();
      setSlug(slugData.url);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; Volver</a>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Nuevo prospecto</h1>
        <p className="text-gray-500 mb-8">Introduce los datos del negocio, genera una preview del email y envíalo cuando estés conforme.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Nombre del negocio</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="Ej: Corto y Cambio" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Email del negocio</label>
              <input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" placeholder="info@negocio.com" />
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
              {loading ? (progress || 'Generando...') : '🚀 Generar preview del email'}
            </button>
          )}

          {preview && !sent && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800 font-medium">✅ Preview generada — revisa el email antes de enviarlo</p>
                <p className="text-xs text-blue-600 mt-1">Asunto: {preview.subject}</p>
                <p className="text-xs text-blue-600">Para: {businessEmail}</p>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto bg-white">
                <iframe srcDoc={preview.html} className="w-full h-[500px]" title="Preview del email" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={sendEmail}
                  disabled={loading}
                  className="flex-1 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {loading ? (progress || 'Enviando...') : '📤 Enviar email'}
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
              <p className="text-sm text-green-800 font-medium">✅ Email enviado a {businessEmail}</p>
              {slug && (
                <>
                  <p className="text-xs text-green-600">Enlace de respaldo (para WhatsApp):</p>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={slug} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white" onClick={(e) => (e.target as HTMLInputElement).select()} />
                    <button onClick={copyLink} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-all whitespace-nowrap">{copied ? '¡Copiado!' : 'Copiar'}</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
