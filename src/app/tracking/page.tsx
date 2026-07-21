'use client';

import { useState, useEffect, useMemo } from 'react';

const STORAGE_URL = 'https://aura-storage.entretorres1x2.workers.dev';
type SortDir = 'asc' | 'desc';

export default function TrackingPage() {
  const [prospects, setProspects] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'prospects' | 'contacts'>('prospects');
  const [sortCol, setSortCol] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deleting, setDeleting] = useState<string | null>(null);

  const resendProspect = (slug: string) => {
    window.location.href = `/prospect/new?edit=${slug}`;
  };

  const removeProspect = async (slug: string) => {
    if (!confirm('¿Eliminar este prospecto del tracking?')) return;
    setDeleting(slug);
    await fetch(`${STORAGE_URL}/prospect/${slug}`, { method: 'DELETE' }).catch(() => {});
    setProspects(p => p.filter(x => x.slug !== slug));
    setDeleting(null);
  };

  const removeContact = async (id: string) => {
    if (!confirm('¿Eliminar este contacto?')) return;
    setDeleting(id);
    await fetch(`${STORAGE_URL}/contact/${id.replace('contact-', '')}`, { method: 'DELETE' }).catch(() => {});
    setContacts(c => c.filter(x => x.id !== id));
    setDeleting(null);
  };

  useEffect(() => {
    Promise.all([
      fetch(`${STORAGE_URL}/prospects`).then(r => r.json()).catch(() => ({ prospects: [] })),
      fetch(`${STORAGE_URL}/contacts`).then(r => r.json()).catch(() => ({ contacts: [] })),
    ]).then(([pData, cData]) => {
      setProspects(pData.prospects || []);
      setContacts(cData.contacts || []);
    }).finally(() => setLoading(false));
  }, []);

  const contactedNames = useMemo(() => {
    const names = new Set<string>();
    for (const c of contacts) {
      if (c.businessName) names.add(c.businessName.toLowerCase().trim());
    }
    return names;
  }, [contacts]);

  const prospectHasContact = (name: string) => contactedNames.has((name || '').toLowerCase().trim());

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const sortedProspects = useMemo(() => {
    const sorted = [...prospects];
    sorted.sort((a: any, b: any) => {
      let va = a[sortCol] ?? '';
      let vb = b[sortCol] ?? '';
      if (sortCol === 'businessName') { va = (va || '').toLowerCase(); vb = (vb || '').toLowerCase(); }
      const cmp = va > vb ? 1 : va < vb ? -1 : 0;
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return sorted;
  }, [prospects, sortCol, sortDir]);

  const sortedContacts = useMemo(() => {
    const sorted = [...contacts];
    sorted.sort((a: any, b: any) => {
      const va = a.createdAt || 0;
      const vb = b.createdAt || 0;
      return sortDir === 'desc' ? vb - va : va - vb;
    });
    return sorted;
  }, [contacts, sortDir]);

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-orange-500 ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>;
  };

  const Th = ({ col, children, align = 'left' }: { col: string; children: React.ReactNode; align?: string }) => (
    <th className={`px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none text-${align}`} onClick={() => toggleSort(col)}>
      {children} <SortIcon col={col} />
    </th>
  );

  const stats = {
    total: prospects.length,
    leidos: prospects.filter((p: any) => p.readAt > 0).length,
    noLeidos: prospects.filter((p: any) => !p.readAt).length,
    contactaron: contacts.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; Volver</a>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Dashboard de seguimiento</h1>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">Prospectos enviados</div>
          </div>
          <div className="bg-white border border-emerald-200 rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-emerald-600">{stats.leidos}</div>
            <div className="text-xs text-gray-500 mt-1">Visitaron el enlace</div>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-amber-500">{stats.noLeidos}</div>
            <div className="text-xs text-gray-500 mt-1">No visitaron aún</div>
          </div>
          <div className="bg-white border border-purple-200 rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-purple-600">{stats.contactaron}</div>
            <div className="text-xs text-gray-500 mt-1">Formularios recibidos</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('prospects')} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'prospects' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            Prospectos ({prospects.length})
          </button>
          <button onClick={() => setTab('contacts')} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'contacts' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            Contactos ({contacts.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Cargando...</div>
        ) : tab === 'prospects' ? (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-500 flex items-center gap-3">
              <span>{prospects.length} prospectos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <Th col="businessName">Negocio</Th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Contactó</th>
                    <Th col="createdAt" align="right">Enviado</Th>
                    <Th col="readAt" align="right">Visitó</Th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Link</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Reenviado</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProspects.map((p: any, i: number) => {
                    const contacto = prospectHasContact(p.businessName);
                    return (
                      <tr key={p.slug} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-3 font-medium text-gray-900">{p.businessName || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          {p.readAt > 0 ? (
                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full border text-emerald-600 bg-emerald-50 border-emerald-200">Visitó</span>
                          ) : (
                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full border text-amber-600 bg-amber-50 border-amber-200">Sin visita</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {contacto ? (
                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full border text-purple-600 bg-purple-50 border-purple-200">Sí</span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">{p.createdAt ? new Date(p.createdAt).toLocaleString('es-ES') : '—'}</td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">{p.readAt > 0 ? new Date(p.readAt).toLocaleString('es-ES') : '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <a href={`/prospect/${p.slug}?status=1`} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 text-xs font-medium">Ver</a>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400 text-xs">{p.lastResentAt > 0 ? new Date(p.lastResentAt).toLocaleString('es-ES') : '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => resendProspect(p.slug)} className="text-xs font-medium text-blue-500 hover:text-blue-600">Reenviar</button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => removeProspect(p.slug)} disabled={deleting === p.slug} className="text-red-300 hover:text-red-500 transition-all text-xs disabled:opacity-30">
                            {deleting === p.slug ? '...' : '✕'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {prospects.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">No hay prospectos aún</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-500 flex items-center gap-3">
              <span>{contacts.length} contactos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Negocio</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Teléfono</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Fecha</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedContacts.map((c: any, i: number) => (
                    <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.businessName || '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{c.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{c.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{c.phone || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{c.tipoNegocio || '—'}</td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleString('es-ES') : '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeContact(c.id)} disabled={deleting === c.id} className="text-red-300 hover:text-red-500 transition-all text-xs disabled:opacity-30">
                          {deleting === c.id ? '...' : '✕'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {contacts.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">No hay contactos aún</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}