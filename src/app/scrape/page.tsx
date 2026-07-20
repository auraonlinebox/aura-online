'use client';

import { useState } from 'react';

const Th = ({ col, children, sortCol, sortAsc, onSort, align }: { col: string; children: React.ReactNode; sortCol: string | null; sortAsc: boolean; onSort: (col: string) => void; align?: 'left' | 'right' | 'center' }) => (
  <th className={`px-4 py-3 font-medium text-gray-600 text-${align || 'left'} cursor-pointer hover:text-orange-500 select-none transition-colors`}
    onClick={() => onSort(col)}>
    {children} <span className="text-gray-400 text-xs">{sortCol === col ? (sortAsc ? '↑' : '↓') : '↕'}</span>
  </th>
);

export default function ScrapePage() {
  const [businessType, setBusinessType] = useState('restaurantes');
  const [customType, setCustomType] = useState('');
  const [location, setLocation] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [minReviews, setMinReviews] = useState('0');
  const [maxResults, setMaxResults] = useState('60');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const search = async () => {
    const type = businessType === 'otro' ? customType.trim() : businessType;
    const q = `${type} ${location.trim()}`.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        q,
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

  const sortedResults = sortCol
    ? [...results].sort((a, b) => {
        const va = a[sortCol] ?? '';
        const vb = b[sortCol] ?? '';
        const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
        return sortAsc ? cmp : -cmp;
      })
    : results;

  const downloadCsv = () => {
    if (!results.length) return;
    const headers = ['Nombre', 'Dirección', 'Rating', 'Reseñas', 'Tipo', 'Place ID', 'Enlace'];
    const rows = results.map(r => [
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.address || '').replace(/"/g, '""')}"`,
      r.rating,
      r.reviews,
      `"${(r.types || '').replace(/"/g, '""')}"`,
      r.place_id,
      `https://www.google.com/maps/place/?q=place_id:${r.place_id}`,
    ]);
    const type = businessType === 'otro' ? customType.trim() : businessType;
    const label = `${type}-${location.trim() || 'sin-localidad'}`.replace(/\s+/g, '-');
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `places-${label}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; Volver</a>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Buscar negocios en Google Maps</h1>
        <p className="text-gray-500 mb-8">Encuentra negocios por tipo y localización, filtra por valoración y reseñas, exporta a CSV.</p>
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">Google limita a ~60 resultados por búsqueda. Para más resultados, busca por distrito o zona (ej: "restaurantes Madrid centro", "restaurantes Madrid norte").</p>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 space-y-4">
          <div className="grid sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Tipo de negocio</label>
              <select value={businessType} onChange={e => setBusinessType(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-orange-300">
                <option value="restaurantes">Restaurantes</option>
                <option value="bares">Bares / Cafeterías</option>
                <option value="peluquerías">Peluquerías / Barberías</option>
                <option value="talleres mecánicos">Talleres mecánicos</option>
                <option value="clínicas dentales">Clínicas dentales</option>
                <option value="fisioterapeutas">Fisioterapeutas</option>
                <option value="hoteles">Hoteles</option>
                <option value="veterinarios">Veterinarios</option>
                <option value="inmobiliarias">Inmobiliarias</option>
                <option value="academias">Academias / Autoescuelas</option>
                <option value="tiendas de mascotas">Tiendas de mascotas</option>
                <option value="lavanderías">Lavanderías</option>
                <option value="jardinería">Jardinería</option>
                <option value="limpiezas">Limpiezas</option>
                <option value="otro">Otros...</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            <div className={businessType === 'otro' ? 'sm:col-span-2' : 'sm:col-span-3'}>
              <label className="text-xs text-gray-500 font-medium">Localidad</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Ej: Madrid, Barcelona, ..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300" />
            </div>
            {businessType === 'otro' && (
              <div>
                <label className="text-xs text-gray-500 font-medium">Tipo personalizado</label>
                <input type="text" value={customType} onChange={e => setCustomType(e.target.value)}
                  placeholder="Ej: floristerías"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 bg-yellow-50" />
              </div>
            )}
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
                    <Th col="name" sortCol={sortCol} sortAsc={sortAsc} onSort={c => { setSortCol(c); setSortAsc(c === sortCol ? !sortAsc : true); }}>Nombre</Th>
                    <Th col="address" sortCol={sortCol} sortAsc={sortAsc} onSort={c => { setSortCol(c); setSortAsc(c === sortCol ? !sortAsc : true); }}>Dirección</Th>
                    <Th col="rating" sortCol={sortCol} sortAsc={sortAsc} onSort={c => { setSortCol(c); setSortAsc(c === sortCol ? !sortAsc : true); }} align="center">Rating</Th>
                    <Th col="reviews" sortCol={sortCol} sortAsc={sortAsc} onSort={c => { setSortCol(c); setSortAsc(c === sortCol ? !sortAsc : true); }} align="center">Reseñas</Th>
                    <Th col="types" sortCol={sortCol} sortAsc={sortAsc} onSort={c => { setSortCol(c); setSortAsc(c === sortCol ? !sortAsc : true); }}>Tipo</Th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Mapa</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((r, i) => (
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
                      <td className="px-4 py-3 text-center">
                        <a href={`https://www.google.com/maps/place/?q=place_id:${r.place_id}`} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 text-xs font-medium">Ver</a>
                      </td>
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
