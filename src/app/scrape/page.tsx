'use client';

import { useState } from 'react';

export default function ScrapePage() {
  const [query, setQuery] = useState('');
  const [minRating, setMinRating] = useState('3');
  const [minReviews, setMinReviews] = useState('10');
  const [maxResults, setMaxResults] = useState('60');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        min_rating: minRating,
        min_reviews: minReviews,
        max: maxResults,
      });
      const res = await fetch(`/api/scrape-places?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setResults(data.results || []);
      if (!data.results?.length) setError('Sin resultados con esos filtros');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!results.length) return;
    const headers = ['Nombre', 'Dirección', 'Rating', 'Reseñas', 'Tipo', 'Place ID'];
    const rows = results.map(r => [
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.address || '').replace(/"/g, '""')}"`,
      r.rating,
      r.reviews,
      `"${(r.types || '').replace(/"/g, '""')}"`,
      r.place_id,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `places-${query.trim().replace(/\s+/g, '-')}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; Volver</a>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Buscar negocios en Google Maps</h1>
        <p className="text-gray-500 mb-8">Encuentra negocios por tipo y localización, filtra por valoración y reseñas, exporta a CSV.</p>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 space-y-4">
          <div className="grid sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500 font-medium">Búsqueda</label>
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Ej: restaurantes Madrid, peluquerías Barcelona"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Rating mínimo</label>
              <select value={minRating} onChange={e => setMinRating(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-orange-300">
                {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5].map(n => <option key={n} value={n}>{n}★</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Reseñas mínimas</label>
              <select value={minReviews} onChange={e => setMinReviews(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-orange-300">
                {[0, 5, 10, 20, 30, 50, 100, 200, 500].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <div>
              <label className="text-xs text-gray-500 font-medium">Máx. resultados</label>
              <select value={maxResults} onChange={e => setMaxResults(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-orange-300">
                {[20, 40, 60].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button onClick={search} disabled={loading}
              className="px-8 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50">
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            {results.length > 0 && (
              <button onClick={downloadCsv}
                className="px-8 py-2.5 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900 transition-all">
                Descargar CSV
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
              {results.length} resultados
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Dirección</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Rating</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Reseñas</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.place_id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[250px] truncate">{r.address}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${r.rating >= 4 ? 'text-emerald-600' : r.rating >= 3 ? 'text-amber-500' : 'text-red-500'}`}>
                          {r.rating}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{r.reviews}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate">{r.types}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
