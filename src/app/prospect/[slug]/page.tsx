'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ProspectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [readAt, setReadAt] = useState<number | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  const [data, setData] = useState<{ businessName: string; reviews: { author: string; text: string; rating: number; response?: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const isStatusCheck = window.location.search.includes('status=1');
    setShowStatus(isStatusCheck);

    fetch(`/api/prospect?slug=${slug}`)
      .then((r) => { if (!r.ok) throw new Error('not_found'); return r.json(); })
      .then((d) => {
        setData(d);
        if (d.readAt) setReadAt(d.readAt);
        if (!isStatusCheck) {
          fetch(`https://aura-storage.entretorres1x2.workers.dev/prospect/${slug}/read`, { method: 'POST' }).catch(() => {});
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <div className="animate-spin w-8 h-8 border-4 border-orange-300 border-t-orange-500 rounded-full" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace no encontrado</h1>
        <p className="text-gray-500 mb-6">Este enlace no es válido o ha expirado.</p>
        <a href="/" className="inline-block px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-all">Ir a AURA</a>
      </div>
    </div>
  );

  const reviewRows = data?.reviews.map((r, i) => (
    <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid #eee' }}>
      <div style={{ marginBottom: 8 }}>
        <strong style={{ color: '#1f2937' }}>{r.author}</strong>{' '}
        <span style={{ color: '#f59e0b' }}>{'★'.repeat(r.rating)}</span>
      </div>
      <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 12, fontStyle: 'italic' }}>"{r.text}"</div>
      {r.response ? (
        <div style={{ background: '#fff7ed', borderLeft: '3px solid #f97316', padding: '12px 16px', borderRadius: 8, color: '#1f2937', fontSize: 14 }}>{r.response}</div>
      ) : (
        <div style={{ color: '#9ca3af', fontSize: 13, fontStyle: 'italic' }}>Respuesta no disponible</div>
      )}
    </div>
  ));

  return (
    <div style={{ margin: 0, padding: 0, background: '#f5f5f5', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: 600, margin: '0 auto', background: '#fff' }}>
        <tbody>
          <tr>
            <td style={{ background: '#fff', padding: '40px 24px 24px', textAlign: 'center' }}>
              {showStatus && (
                <div style={{ marginBottom: 16, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: readAt ? '#dcfce7' : '#fef3c7', color: readAt ? '#166534' : '#92400e' }}>
                  {readAt ? `✅ Leído — ${new Date(readAt).toLocaleString('es-ES')}` : '⏳ No leído aún'}
                </div>
              )}
              <img src="https://aura-online.es/logo.svg?v=2" alt="AURA" style={{ height: 64, border: 'none', display: 'block', margin: '0 auto' }} />
            </td>
          </tr>
          <tr>
            <td style={{ padding: '32px 24px', textAlign: 'justify' }}>
              <p style={{ color: '#1f2937', fontSize: 18, fontWeight: 600, margin: '0 0 12px' }}>Hola, soy Ana de AURA - Reputación Digital</p>
              <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px', textAlign: 'justify' }}>
                He visto que gestionáis un volumen altísimo de clientes y que muchos se toman la molestia de dejaros una reseña. Es una señal de que hacéis un gran trabajo.
              </p>
              <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px', textAlign: 'justify' }}>
                Me dedico a ayudar a negocios como el vuestro a cerrar ese círculo: que el cliente se sienta escuchado sin que eso suponga una carga de trabajo extra para vosotros.
              </p>
              <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
                Mirad cómo habríamos respondido a vuestras reseñas más recientes:
              </p>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tbody>{reviewRows}</tbody>
              </table>

              <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href="https://aura-online.es" style={{ display: 'inline-block', padding: '14px 36px', background: '#f97316', color: '#fff', textDecoration: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600 }}>
                  Probar AURA gratis
                </a>
                <p style={{ color: '#9ca3af', fontSize: 13, margin: '12px 0 0' }}>Sin compromiso. Sin tarjeta.</p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '32px 0' }} />

              <h2 style={{ color: '#1f2937', fontSize: 22, textAlign: 'center', margin: '0 0 8px' }}>¿Por qué elegir AURA?</h2>
              <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px', textAlign: 'center', fontStyle: 'italic' }}>
                Responder reseñas no es un lujo. Es lo que separa un negocio con buena imagen de uno que pasa desapercibido.
              </p>

              <table width="100%" cellPadding="0" cellSpacing="0">
                <tbody>
                  {[
                    ['Responder rápido sube tu estrella', 'Los negocios que responden a sus reseñas en menos de 24 horas mejoran su valoración media hasta un 0.3★. Google premia la actividad y posiciona mejor a quienes interactúan con sus clientes.'],
                    ['El 89% de los clientes lee las respuestas', 'Antes de elegir un negocio, la mayoría mira cómo el dueño responde. Una respuesta profesional y humana convierte a un indeciso en cliente. El silencio, en cambio, se interpreta como desinterés.'],
                    ['Sin AURA, pierdes clientes cada día', 'Cada reseña sin responder es una oportunidad perdida. Una crítica mal gestionada aleja a cientos de clientes potenciales. Una respuesta a tiempo puede recuperar a ese cliente y convencer a otros.'],
                    ['El algoritmo de Google te favorece', 'Google valora los perfiles activos. Cuantas más reseñas respondas, mejor apareces en las búsquedas locales. AURA te ayuda a mantener esa actividad sin esfuerzo.'],
                  ].map(([title, desc], i) => (
                    <tr key={i}>
                      <td style={{ padding: '0 0 20px' }}>
                        <table width="100%" cellPadding="0" cellSpacing="0">
                          <tbody>
                            <tr>
                              <td width="32" style={{ verticalAlign: 'top', textAlign: 'center' }}>
                                <span style={{ display: 'inline-block', width: 28, height: 28, background: '#f97316', color: '#fff', borderRadius: '50%', fontSize: 14, fontWeight: 700, lineHeight: '28px', textAlign: 'center' }}>{i + 1}</span>
                              </td>
                              <td style={{ paddingLeft: 12 }}>
                                <p style={{ color: '#1f2937', fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>{title}</p>
                                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.5, margin: 0 }}>{desc}</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table width="100%" cellPadding="0" cellSpacing="0" style={{ margin: '24px 0' }}>
                <tbody>
                  <tr>
                    <td style={{ background: '#fff7ed', borderLeft: '3px solid #f97316', padding: '16px 20px', borderRadius: 8 }}>
                      <p style={{ color: '#1f2937', fontSize: 15, lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                        Cada reseña sin responder es un cliente perdido. Con AURA, respondes en segundos, mejoras tu reputación y te olvidas de las preocupaciones mientras nosotros nos encargamos.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>

              <p style={{ color: '#1f2937', fontSize: 16, textAlign: 'center', fontWeight: 600, margin: '24px 0 20px' }}>
                Tus clientes hablan. AURA responde. Tú ganas.
              </p>

              <div style={{ textAlign: 'center', margin: '0 0 8px' }}>
                <a href="https://aura-online.es" style={{ display: 'inline-block', padding: '14px 36px', background: '#f97316', color: '#fff', textDecoration: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600 }}>
                  Probar AURA gratis
                </a>
                <p style={{ color: '#9ca3af', fontSize: 13, margin: '12px 0 0' }}>Sin compromiso. Sin tarjeta.</p>
              </div>

              <table width="100%" cellPadding="0" cellSpacing="0" style={{ margin: '28px 0 0' }}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center' }}>
                      <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.5, margin: '0 0 12px' }}>Si tenéis cualquier duda o consulta, no dudéis en escribirnos:</p>
                      <a href="mailto:auraonlinebox@gmail.com" style={{ display: 'inline-block', padding: '12px 28px', border: '1px solid #f97316', color: '#f97316', textDecoration: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
                        Contactar por email
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style={{ background: '#f9fafb', padding: 24, textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 4px' }}>AURA - Reputación Digital</p>
              <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Si prefieres no recibir más correos, responde a este email.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
