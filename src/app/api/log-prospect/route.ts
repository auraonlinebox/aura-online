import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, businessEmail, reviews, timestamp, slug } = body;

    const webhook = process.env.PROSPECT_WEBHOOK_URL;
    if (webhook) {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: timestamp || new Date().toISOString(),
          businessName: businessName || '',
          businessEmail: businessEmail || '',
          reviews: JSON.stringify(reviews || []),
          slug: slug || '',
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
