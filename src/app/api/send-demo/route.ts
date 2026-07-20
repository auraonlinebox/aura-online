import { NextRequest, NextResponse } from 'next/server';
import { generateResponse, analyzeKeywords } from '@/lib/gemini';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { businessName, businessEmail, reviews, preview, html: preHtml, responses: preResponses, slug, prospectUrl } = await req.json();
    if (!businessName || !businessEmail || !reviews?.length) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    let responses: { author: string; text: string; rating: number; response: string }[] = preResponses;
    let html = preHtml;
    let keywords: any = null;

    if (!responses) {
      responses = [];
      const [genResponses, genKeywords] = await Promise.all([
        Promise.all(reviews.map((r: any) => generateResponse(r.text, r.author, businessName))),
        analyzeKeywords(reviews).catch(() => null),
      ]);
      for (let i = 0; i < reviews.length; i++) {
        responses.push({ ...reviews[i], response: genResponses[i] });
      }
      keywords = genKeywords;
    }

    if (!html) {
      const prospectLink = prospectUrl || (slug && /^[a-z0-9-]+$/i.test(String(slug)) ? `https://aura-online.es/prospect/${slug}` : 'https://aura-online.es');
      const firstReview = responses[0];
      const reviewStars = firstReview ? '★'.repeat(firstReview.rating) + '☆'.repeat(5 - firstReview.rating) : '';

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
            <td style="padding:0 24px;">
              <p style="color:#1f2937; font-size:18px; font-weight:600; margin:0 0 16px;">Hola, soy Ana de AURA</p>
              <p style="color:#6b7280; font-size:15px; line-height:1.6; margin:0 0 20px;">
                Os he preparado respuestas automatizadas para algunas de vuestras reseñas de Google más recientes.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed; border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#1f2937; font-size:13px; font-weight:600; margin:0 0 6px; text-transform:uppercase; letter-spacing:0.5px;">RESEÑA DE GOOGLE RECIENTE</p>
                    <p style="color:#f59e0b; font-size:13px; margin:0 0 6px;">${reviewStars}</p>
                    <p style="color:#1f2937; font-size:15px; font-weight:600; margin:0 0 4px;">${firstReview?.author || 'Cliente'}</p>
                    <p style="color:#6b7280; font-size:14px; line-height:1.5; margin:0; font-style:italic;">"${firstReview?.text || ''}"</p>
                    <div style="background:#fff7ed; border-left:3px solid #f97316; padding:12px 16px; border-radius:8px; margin-top:12px; color:#1f2937; font-size:14px;">${firstReview?.response || ''}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 8px;">
                    <p style="color:#1f2937; font-size:13px; font-weight:600; margin:0 0 10px; text-transform:uppercase; letter-spacing:0.5px;">RESPONDER vs NO RESPONDER</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="8" style="background:#10b981; border-radius:4px 0 0 4px;"></td>
                        <td style="padding:10px 14px; background:#f0fdf4;">
                          <p style="color:#065f46; font-size:14px; font-weight:600; margin:0 0 2px;">✅ Si respondes</p>
                          <p style="color:#065f46; font-size:13px; margin:0; line-height:1.4;">Subes tu valoración media, el cliente se siente valorado y Google te posiciona mejor.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="8" style="background:#ef4444; border-radius:4px 0 0 4px;"></td>
                        <td style="padding:10px 14px; background:#fef2f2;">
                          <p style="color:#991b1b; font-size:14px; font-weight:600; margin:0 0 2px;">❌ Si no respondes</p>
                          <p style="color:#991b1b; font-size:13px; margin:0; line-height:1.4;">Una crítica sin respuesta ahuyenta clientes. El 89% lee las respuestas antes de elegir.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px;">
              <div style="text-align:center; margin:0 0 0;">
                <a href="${prospectLink}" style="display:inline-block; padding:14px 36px; background:#f97316; color:#fff; text-decoration:none; border-radius:12px; font-size:16px; font-weight:600;">
                  Ver respuestas y análisis completo
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center; padding:20px; background:#f9fafb; border-radius:12px;">
                    <p style="color:#6b7280; font-size:13px; line-height:1.5; margin:0;">
                      Si prefieres que no te escriba más, responde a este email con "Baja".
                    </p>
                    <img src="https://aura-online.es/api/track-open?slug=${slug || ''}&ts=${Date.now()}" width="1" height="1" alt="" style="display:none;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    }

    const subject = `${businessName}, ¿Quién responde vuestras reseñas de Google?`;

    if (preview) {
      return NextResponse.json({ preview: true, responses, html, keywords, subject });
    }

    const relayUrl = process.env.EMAIL_RELAY_URL;
    if (relayUrl) {
      // Wake Render up before sending
      await fetch(relayUrl.replace('/api/send-demo', ''), { signal: AbortSignal.timeout(30000) }).catch(() => {});
      const relayRes = await fetch(relayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, businessEmail, reviews, html, responses, preview: false, slug, prospectUrl }),
      });
      const relayData = await relayRes.json();
      if (!relayRes.ok) throw new Error(relayData.error || 'Error en relay');
      return NextResponse.json({ success: true, responses, keywords });
    }

    const plainProspectLink = prospectUrl || (slug && /^[a-z0-9-]+$/i.test(String(slug)) ? `https://aura-online.es/prospect/${slug}` : 'https://aura-online.es');
    const firstText = responses[0]?.text || '';
    const text = `${businessName},\n\nSoy Ana de AURA. Os he preparado las respuestas para vuestras reseñas de Google.\n\nEjemplo de una de vuestras reseñas:\n"${firstText}"\n\n✅ Si respondéis: sube la valoración, Google os posiciona mejor, el cliente vuelve.\n❌ Si no respondéis: las críticas sin respuesta ahuyentan clientes.\n\nVer las respuestas completas: ${plainProspectLink}`;

    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: gmailUser, pass: gmailPass },
      });
      await transporter.sendMail({
        from: `"Ana de AURA" <${gmailUser}>`,
        to: businessEmail,
        subject,
        html,
        text,
      });
      return NextResponse.json({ success: true, responses, keywords });
    }

    // Fallback to Resend
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: 'Email no configurado (sin Gmail ni Resend)' }, { status: 500 });
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Ana de AURA <hello@aura-online.es>',
        to: [businessEmail],
        subject,
        html,
        text,
        open_tracking: true,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data?.error?.message || data?.message || 'Error al enviar email');
    }
    return NextResponse.json({ success: true, responses, keywords });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al enviar' }, { status: 500 });
  }
}
