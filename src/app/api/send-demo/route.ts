import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateResponse } from '@/lib/gemini';
import dns from 'dns';

export async function POST(req: NextRequest) {
  try {
    const { businessName, businessEmail, reviews, preview, html: preHtml, responses: preResponses } = await req.json();
    if (!businessName || !businessEmail || !reviews?.length) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    let responses: { author: string; text: string; rating: number; response: string }[] = preResponses;
    let html = preHtml;

    if (!responses) {
      responses = [];
      for (const r of reviews) {
        const response = await generateResponse(r.text, r.author, businessName);
        responses.push({ ...r, response });
      }
    }

    if (!html) {
      const reviewRows = responses.map((r) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #eee;">
          <div style="margin-bottom: 8px;"><strong style="color:#1f2937;">${r.author}</strong> <span style="color:#f59e0b;">${'★'.repeat(r.rating)}</span></div>
          <div style="color:#6b7280; font-size:14px; margin-bottom:12px; font-style:italic;">"${r.text}"</div>
          <div style="background:#fff7ed; border-left:3px solid #f97316; padding:12px 16px; border-radius:8px; color:#1f2937; font-size:14px;">${r.response}</div>
        </td>
      </tr>
    `).join('');

      html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0; padding:0; background:#f5f5f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background:#fff;">
          <tr>
            <td style="background:#fff; padding:40px 24px 24px; text-align:center;">
              <img src="https://aura-online.es/logo.svg?v=2" alt="AURA" style="height:64px; border:none; display:block; margin:0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px; text-align:justify;">
              <p style="color:#1f2937; font-size:18px; font-weight:600; margin:0 0 12px;">Hola, soy Ana de AURA - Reputación Digital</p>
              <p style="color:#6b7280; font-size:15px; line-height:1.6; margin:0 0 20px; text-align:justify;">
                He visto que gestionáis un volumen altísimo de clientes y que muchos se toman la molestia de dejaros una reseña. Es una señal de que hacéis un gran trabajo.
              </p>
              <p style="color:#6b7280; font-size:15px; line-height:1.6; margin:0 0 20px; text-align:justify;">
                Me dedico a ayudar a negocios como el vuestro a cerrar ese círculo: que el cliente se sienta escuchado sin que eso suponga una carga de trabajo extra para vosotros.
              </p>
              <p style="color:#6b7280; font-size:15px; line-height:1.6; margin:0 0 24px;">
                Mirad cómo habríamos respondido a vuestras reseñas más recientes:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${reviewRows}
              </table>
              <div style="text-align:center; margin:32px 0;">
                <a href="https://aura-online.es" style="display:inline-block; padding:14px 36px; background:#f97316; color:#fff; text-decoration:none; border-radius:12px; font-size:16px; font-weight:600;">
                  Probar AURA gratis
                </a>
                <p style="color:#9ca3af; font-size:13px; margin:12px 0 0;">Sin compromiso. Sin tarjeta.</p>
              </div>

              <hr style="border:none; border-top:1px solid #e5e7eb; margin:32px 0;" />

              <h2 style="color:#1f2937; font-size:22px; text-align:center; margin:0 0 8px;">¿Por qué elegir AURA?</h2>
              <p style="color:#6b7280; font-size:15px; line-height:1.6; margin:0 0 28px; text-align:center; font-style:italic;">
                Responder reseñas no es un lujo. Es lo que separa un negocio con buena imagen de uno que pasa desapercibido.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" style="vertical-align:top; text-align:center;">
                          <span style="display:inline-block; width:28px; height:28px; background:#f97316; color:#fff; border-radius:50%; font-size:14px; font-weight:700; line-height:28px; text-align:center;">1</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="color:#1f2937; font-size:15px; font-weight:600; margin:0 0 4px;">Responder rápido sube tu estrella</p>
                          <p style="color:#6b7280; font-size:14px; line-height:1.5; margin:0;">Los negocios que responden a sus reseñas en menos de 24 horas mejoran su valoración media hasta un 0.3★. Google premia la actividad y posiciona mejor a quienes interactúan con sus clientes.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" style="vertical-align:top; text-align:center;">
                          <span style="display:inline-block; width:28px; height:28px; background:#f97316; color:#fff; border-radius:50%; font-size:14px; font-weight:700; line-height:28px; text-align:center;">2</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="color:#1f2937; font-size:15px; font-weight:600; margin:0 0 4px;">El 89% de los clientes lee las respuestas</p>
                          <p style="color:#6b7280; font-size:14px; line-height:1.5; margin:0;">Antes de elegir un negocio, la mayoría mira cómo el dueño responde. Una respuesta profesional y humana convierte a un indeciso en cliente. El silencio, en cambio, se interpreta como desinterés.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" style="vertical-align:top; text-align:center;">
                          <span style="display:inline-block; width:28px; height:28px; background:#f97316; color:#fff; border-radius:50%; font-size:14px; font-weight:700; line-height:28px; text-align:center;">3</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="color:#1f2937; font-size:15px; font-weight:600; margin:0 0 4px;">Sin AURA, pierdes clientes cada día</p>
                          <p style="color:#6b7280; font-size:14px; line-height:1.5; margin:0;">Cada reseña sin responder es una oportunidad perdida. Una crítica mal gestionada aleja a cientos de clientes potenciales. Una respuesta a tiempo puede recuperar a ese cliente y convencer a otros.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" style="vertical-align:top; text-align:center;">
                          <span style="display:inline-block; width:28px; height:28px; background:#f97316; color:#fff; border-radius:50%; font-size:14px; font-weight:700; line-height:28px; text-align:center;">4</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="color:#1f2937; font-size:15px; font-weight:600; margin:0 0 4px;">El algoritmo de Google te favorece</p>
                          <p style="color:#6b7280; font-size:14px; line-height:1.5; margin:0;">Google valora los perfiles activos. Cuantas más reseñas respondas, mejor apareces en las búsquedas locales. AURA te ayuda a mantener esa actividad sin esfuerzo.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="background:#fff7ed; border-left:3px solid #f97316; padding:16px 20px; border-radius:8px;">
                    <p style="color:#1f2937; font-size:15px; line-height:1.6; margin:0; font-style:italic;">
                      Cada reseña sin responder es un cliente perdido. Con AURA, respondes en segundos, mejoras tu reputación y te olvidas de las preocupaciones mientras nosotros nos encargamos.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color:#1f2937; font-size:16px; text-align:center; font-weight:600; margin:24px 0 20px;">
                Tus clientes hablan. AURA responde. Tú ganas.
              </p>

              <div style="text-align:center; margin:0 0 8px;">
                <a href="https://aura-online.es" style="display:inline-block; padding:14px 36px; background:#f97316; color:#fff; text-decoration:none; border-radius:12px; font-size:16px; font-weight:600;">
                  Probar AURA gratis
                </a>
                <p style="color:#9ca3af; font-size:13px; margin:12px 0 0;">Sin compromiso. Sin tarjeta.</p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
                <tr>
                  <td style="text-align:center;">
                    <p style="color:#6b7280; font-size:14px; line-height:1.5; margin:0 0 12px;">Si tenéis cualquier duda o consulta, no dudéis en escribirnos:</p>
                    <a href="mailto:auraonlinebox@gmail.com" style="display:inline-block; padding:12px 28px; border:1px solid #f97316; color:#f97316; text-decoration:none; border-radius:12px; font-size:14px; font-weight:600;">
                      Contactar por email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb; padding:24px; text-align:center; border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af; font-size:13px; margin:0 0 4px;">AURA - Reputación Digital</p>
              <p style="color:#9ca3af; font-size:13px; margin:0;">Si prefieres no recibir más correos, responde a este email.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    }

    if (preview) {
      return NextResponse.json({ preview: true, responses, html });
    }

    const relayUrl = process.env.EMAIL_RELAY_URL;
    if (relayUrl) {
      // Wake Render up before sending
      await fetch(relayUrl.replace('/api/send-demo', ''), { signal: AbortSignal.timeout(30000) }).catch(() => {});
      const relayRes = await fetch(relayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, businessEmail, reviews, html, responses, preview: false }),
      });
      const relayData = await relayRes.json();
      if (!relayRes.ok) throw new Error(relayData.error || 'Error en relay');
      return NextResponse.json({ success: true, responses });
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');

    const addresses = await new Promise<string[]>((resolve, reject) => {
      dns.resolve4(smtpHost, (err, addrs) => {
        if (err) reject(err); else resolve(addrs);
      });
    });

    const transporter = nodemailer.createTransport({
      host: addresses[0],
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10000,
      tls: smtpPort === 465 ? { servername: smtpHost } : undefined,
    });

    await transporter.sendMail({
      from: `"Ana de AURA" <${process.env.SMTP_USER}>`,
      to: businessEmail,
      subject: `${businessName} — vuestras reseñas de Google respondidas con AURA`,
      html,
    });

    return NextResponse.json({ success: true, responses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al enviar' }, { status: 500 });
  }
}
