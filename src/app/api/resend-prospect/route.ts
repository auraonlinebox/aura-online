import { NextRequest, NextResponse } from 'next/server';

const STORAGE_URL = process.env.PROSPECT_STORAGE_URL || 'https://aura-storage.entretorres1x2.workers.dev';

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 });

    const raw = await fetch(`${STORAGE_URL}/prospect/${slug}`).then(r => r.json()).catch(() => null);
    if (!raw?.businessEmail) return NextResponse.json({ error: 'Sin email guardado' }, { status: 400 });

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://aura-online-y1k8.onrender.com'}/api/send-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: raw.businessName,
        businessEmail: raw.businessEmail,
        reviews: raw.reviews?.map((r: any) => ({ author: r.author, text: r.text, rating: r.rating })) || [],
        slug,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}