import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, businessEmail, reviews, timestamp, via } = body;
    let slug = body.slug || '';
    const slugId = slug.split('/').pop() || slug;

    const webhook = process.env.PROSPECT_WEBHOOK_URL;
    if (webhook) {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          via: via || 'email',
          timestamp: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'long', timeStyle: 'medium' }),
          businessName: businessName || '',
          businessEmail: businessEmail || '',
          reviews: (reviews || []).map((r: any) => `${r.author}: "${r.text}" (${r.rating}★)`).join(' | '),
          slug: `https://aura-online.es/prospect/${slugId}?status=1`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
