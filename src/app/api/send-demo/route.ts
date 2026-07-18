import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { businessName, businessEmail, reviews, preview } = await req.json();
    if (!businessName || !businessEmail || !reviews?.length) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const responses: { author: string; text: string; rating: number; response: string }[] = [];

    for (const r of reviews) {
      const response = await generateResponse(r.text, r.author, businessName);
      responses.push({ ...r, response });
    }

    const reviewRows = responses.map((r) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #eee;">
          <div style="margin-bottom: 8px;"><strong style="color:#1f2937;">${r.author}</strong> <span style="color:#f59e0b;">${'★'.repeat(r.rating)}</span></div>
          <div style="color:#6b7280; font-size:14px; margin-bottom:12px; font-style:italic;">"${r.text}"</div>
          <div style="background:#fff7ed; border-left:3px solid #f97316; padding:12px 16px; border-radius:8px; color:#1f2937; font-size:14px;">${r.response}</div>
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0; padding:0; background:#f5f5f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background:#fff;">
          <tr>
            <td style="background:#fff; padding:40px 24px 24px; text-align:center;">
              <img src="https://aura-online.es/logo.svg" alt="AURA" style="height:64px; border:none;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px; text-align:justify;">
              <p style="color:#1f2937; font-size:18px; font-weight:600; margin:0 0 12px;">Hola, soy Ana de AURA - Reputación Digital</p>
              <p style="color:#6b7280; font-size:15px; line-height:1.6; margin:0 0 20px; text-align:justify;">
                Hemos visto que <strong>${businessName}</strong> tiene reseñas en Google Maps sin responder. 
                Responderlas mejora tu reputación online y ayuda a captar más clientes. 
                Nosotros podemos hacerlo por ti de forma automática.
              </p>
              <p style="color:#6b7280; font-size:15px; line-height:1.6; margin:0 0 24px;">
                Así es como habríamos respondido a tus reseñas más recientes:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${reviewRows}
              </table>
              <div style="text-align:center; margin:32px 0;">
                <a href="https://aura-online.es" style="display:inline-block; padding:14px 36px; background:#f97316; color:#fff; text-decoration:none; border-radius:12px; font-size:16px; font-weight:600;">
                  Probar AURA gratis 7 días
                </a>
                <p style="color:#9ca3af; font-size:13px; margin:12px 0 0;">Sin compromiso. Sin tarjeta.</p>
              </div>
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

    if (preview) {
      return NextResponse.json({ preview: true, responses, html });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Ana de AURA" <${process.env.SMTP_USER}>`,
      to: businessEmail,
      subject: `${businessName} — tus reseñas de Google respondidas con AURA`,
      html,
    });

    return NextResponse.json({ success: true, responses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al enviar' }, { status: 500 });
  }
}
