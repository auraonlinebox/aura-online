import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, businessEmail, reviews, timestamp } = body;

    const webhook = process.env.PROSPECT_WEBHOOK_URL;
    if (webhook) {
      const params = new URLSearchParams({
        businessName: businessName || '',
        businessEmail: businessEmail || '',
        reviews: JSON.stringify(reviews || []),
        timestamp: timestamp || new Date().toISOString(),
      });
      await fetch(`${webhook}?${params}`, { method: 'GET', redirect: 'follow' }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
