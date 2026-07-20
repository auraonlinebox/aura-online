'use client';

import { useState, useEffect } from 'react';

const STORAGE_URL = 'https://aura-storage.entretorres1x2.workers.dev';

export default function TrackingPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${STORAGE_URL}/email-events`)
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const eventLabel = (type: string) => {
    const map: Record<string, string> = {
      'email.sent': 'Enviado',
      'email.delivered': 'Entregado',
      'email.bounced': 'Rebotado',
      'email.complained': 'Spam',
      'email.opened': 'Abierto',
      'email.clicked': 'Clickeado',
      'email.delivery_delayed': 'Retrasado',
    };
    return map[type] || type;
  };

  const eventColor = (type: string) => {
    if (type.includes('bounced') || type.includes('complained')) return 'text-red-600 bg-red-50 border-red-200';
    if (type.includes('delivered') || type.includes('sent')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (type.includes('opened') || type.includes('clicked')) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <a href="/" className="text-orange-500 text-sm hover:underline">&larr; Volver</a>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Seguimiento de emails</h1>
        <p className="text-gray-500 mb-8">Eventos de entrega, apertura y clics registrados por Resend.</p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-xs text-amber-700">
          Para empezar a recibir eventos, configura el webhook en Resend:
          <code className="block mt-1 text-amber-800 font-mono bg-amber-100/50 px-2 py-1 rounded">URL: https://aura-online-y1k8.onrender.com/api/resend-webhook</code>
          Ve a <a href="https://resend.com/webhooks" target="_blank" rel="noopener noreferrer" className="underline font-medium">resend.com/webhooks</a> y añade esta URL seleccionando los eventos que quieras trackingear.
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Cargando eventos...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No hay eventos aún. Configura el webhook en Resend.</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
              {events.length} eventos
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Evento</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Asunto</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e: any, i: number) => {
                    const d = e.data || {};
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${eventColor(e.type)}`}>
                            {eventLabel(e.type)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{(d.to || []).join(', ')}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[250px] truncate">{d.subject || '—'}</td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">
                          {e.receivedAt ? new Date(e.receivedAt).toLocaleString('es-ES') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
