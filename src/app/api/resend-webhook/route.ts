import { NextRequest, NextResponse } from 'next/server';

const STORAGE_URL = process.env.PROSPECT_STORAGE_URL || 'https://aura-storage.entretorres1x2.workers.dev';

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    await fetch(`${STORAGE_URL}/email-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
