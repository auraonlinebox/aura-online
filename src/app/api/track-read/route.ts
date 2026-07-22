import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 });

    const auth = req.cookies.get('admin_auth')?.value;
    const valid = process.env.ADMIN_PASSWORD;
    if (valid && auth === valid) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const storageUrl = process.env.PROSPECT_STORAGE_URL || 'https://aura-storage.entretorres1x2.workers.dev';
    await fetch(`${storageUrl}/prospect/${slug}/read`, { method: 'POST' });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
