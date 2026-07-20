'use client';

import { useState, useEffect, useMemo } from 'react';

const STORAGE_URL = 'https://aura-storage.entretorres1x2.workers.dev';

type SortDir = 'asc' | 'desc';

export default function TrackingPage() {
  const [prospects, setProspects] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tab, setTab] = useState<'prospects' | 'emails'>('prospects');
  const [loading, setLoading] = useState(true);
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

  const removeEvent = async (eventKey: string) => {
    const emailId = eventKey.replace('email-event-', '');
    await fetch(`${STORAGE_URL}/email-event/${emailId}`, { method: 'DELETE' }).catch(() => {});
    setEvents(e => e.filter((x: any) => x._eventKey !== eventKey));
  };

  useEffect(() => {
    Promise.all([
      fetch(`${STORAGE_URL}/prospects`).then(r => r.json()).catch(() => ({ prospects: [] })),
      fetch(`${STORAGE_URL}/email-events`).then(r => r.json()).catch(() => ({ events: [] })),
    ]).then(([pData, eData]) => {
      setProspects(pData.prospects || []);
      setEvents(eData.events || []);
    }).finally(() => setLoading(false));
  }, []);

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

  const sortedEvents = useMemo(() => {
    const sorted = [...events];
    sorted.sort((a: any, b: any) => {
      const va = a.receivedAt || 0;
      const vb = b.receivedAt || 0;
      return sortDir === 'desc' ? vb - va : va - vb;
    });
    return sorted;
  }, [events, sortDir]);

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-orange-500 ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>;
  };

  const Th = ({ col, children, align = 'left' }: { col: string; children: React.ReactNode; align?: string }) => (
    <th className={`px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none text-${align}`} onClick={() => toggleSort(col)}>
      {children} <SortIcon col={col} />
    </th>
  );

  const eventLabel = (type: string) => {
    const map: Record<string, string> = {
      'email.sent': 'Enviado', 'email.delivered': 'Entregado', 'email.bounced': 'Rebotado',
      'email.complained': 'Spam', 'email.opened': 'Abierto', 'email.clicked': 'Clickeado',
      'email.delivery_delayed': 'Retrasado',
    };
    return map[type] || type;
  };

  const eventColor = (type: string) => {
    if (type?.includes('bounced') || type?.includes('complained')) return 'text-red-600 bg-red-50 border-red-200';
    if (type?.includes('delivered') || type?.includes('sent')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (type?.includes('opened') || type?.includes('clicked')) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const stats = {
    total: prospects.length,
    leidos: prospects.filter((p: any) => p.readAt > 0).length,
    noLeidos: prospects.filter((p: any) => !p.readAt).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; Volver</a>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Dashboard de seguimiento</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">Prospectos enviados</div>
          </div>
          <div className="bg-white border border-emerald-200 rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-emerald-600">{stats.leidos}</div>
            <div className="text-xs text-gray-500 mt-1">Prospectos abiertos</div>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-amber-500">{stats.noLeidos}</div>
            <div className="text-xs text-gray-500 mt-1">Sin abrir</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('prospects')} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'prospects' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            Prospectos ({prospects.length})
          </button>
          <button onClick={() => setTab('emails')} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'emails' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            Emails ({events.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Cargando...</div>
        ) : tab === 'prospects' ? (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-500 flex items-center gap-3">
              <span>{prospects.length} prospectos</span>
              <a href={`${STORAGE_URL}/prospects`} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline text-xs">(JSON)</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <Th col="businessName">Negocio</Th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                    <Th col="createdAt" align="right">Enviado</Th>
                    <Th col="readAt" align="right">Leído</Th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Link</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProspects.map((p: any, i: number) => (
                    <tr key={p.slug} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.businessName || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {p.readAt > 0 ? (
                          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full border text-emerald-600 bg-emerald-50 border-emerald-200">Leído</span>
                        ) : (
                          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full border text-amber-600 bg-amber-50 border-amber-200">Sin abrir</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs">{p.createdAt ? new Date(p.createdAt).toLocaleString('es-ES') : '—'}</td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs">{p.readAt > 0 ? new Date(p.readAt).toLocaleString('es-ES') : '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <a href={`/prospect/${p.slug}?status=1`} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 text-xs font-medium">Ver</a>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => resendProspect(p.slug)} className="text-xs font-medium text-blue-500 hover:text-blue-600">
                          Reenviar
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeProspect(p.slug)} disabled={deleting === p.slug} className="text-red-300 hover:text-red-500 transition-all text-xs disabled:opacity-30">
                          {deleting === p.slug ? '...' : '✕'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {prospects.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">No hay prospectos aún</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-500 flex items-center gap-3">
              <span>{events.length} eventos</span>
              <span className="text-xs text-amber-600">Para recibir eventos, configura el webhook en <a href="https://resend.com/webhooks" target="_blank" rel="noopener noreferrer" className="underline font-medium">resend.com/webhooks</a> con URL: <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800">https://aura-online-y1k8.onrender.com/api/resend-webhook</code></span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Evento</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Asunto</th>
                    <Th col="receivedAt" align="right">Fecha</Th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEvents.map((e: any, i: number) => {
                    const d = e.data || {};
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-3"><span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${eventColor(e.type)}`}>{eventLabel(e.type)}</span></td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{(d.to || []).join(', ')}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[250px] truncate">{d.subject || '—'}</td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">{e.receivedAt ? new Date(e.receivedAt).toLocaleString('es-ES') : '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => removeEvent(e._eventKey)} className="text-red-300 hover:text-red-500 transition-all text-xs">
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {events.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">No hay eventos aún</td></tr>
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
