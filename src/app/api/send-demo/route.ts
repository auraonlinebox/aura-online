import { NextRequest, NextResponse } from 'next/server';
import { generateResponse, analyzeKeywords } from '@/lib/gemini';
import { renderKeywordChartHtml } from '@/lib/keyword-chart';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { businessName, businessEmail, reviews, preview, html: preHtml, responses: preResponses, slug } = await req.json();
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
      const keywordChartHtml = keywords ? renderKeywordChartHtml(keywords) : '';

      const prospectLink = slug ? `https://aura-online.es/prospect/${slug}?status=1` : 'https://aura-online.es';

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
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#fff7ed; border-radius:12px; padding:20px;">
                    <p style="color:#1f2937; font-size:16px; font-weight:600; margin:0 0 8px;">${businessName}, esto son 2 minutos</p>
                    <p style="color:#6b7280; font-size:14px; line-height:1.5; margin:0;">
                      Hemos preparado respuestas para algunas de vuestras <strong>RESEÑAS REALES DE GOOGLE</strong> más recientes.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 0;">
              ${keywordChartHtml}
              <div style="text-align:center; margin:28px 0 0;">
                <a href="${prospectLink}?status=1" style="display:inline-block; padding:14px 36px; background:#f97316; color:#fff; text-decoration:none; border-radius:12px; font-size:16px; font-weight:600;">
                  Ver respuestas
                </a>
                <p style="color:#9ca3af; font-size:13px; margin:10px 0 0;">Sin compromiso. Sin tarjeta.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center; padding:20px; background:#f9fafb; border-radius:12px;">
                    <p style="color:#6b7280; font-size:13px; line-height:1.5; margin:0;">
                      Si prefieres que no te escriba más, responde a este email con "Baja" y te elimino.
                    </p>
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

    if (preview) {
      return NextResponse.json({ preview: true, responses, html, keywords });
    }

    const relayUrl = process.env.EMAIL_RELAY_URL;
    if (relayUrl) {
      // Wake Render up before sending
      await fetch(relayUrl.replace('/api/send-demo', ''), { signal: AbortSignal.timeout(30000) }).catch(() => {});
      const relayRes = await fetch(relayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, businessEmail, reviews, html, responses, preview: false, slug }),
      });
      const relayData = await relayRes.json();
      if (!relayRes.ok) throw new Error(relayData.error || 'Error en relay');
      return NextResponse.json({ success: true, responses, keywords });
    }

    const prospectLink = slug ? `https://aura-online.es/prospect/${slug}?status=1` : 'https://aura-online.es';
    const text = `${businessName},\n\nHemos preparado respuestas para algunas de vuestras RESEÑAS REALES DE GOOGLE más recientes.\n\n${prospectLink}\n\nSin compromiso.`;
    const subject = `${businessName} – ¿quién responde vuestras reseñas?`;

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
