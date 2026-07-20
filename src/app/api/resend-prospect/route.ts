import { NextRequest, NextResponse } from 'next/server';

const STORAGE_URL = process.env.PROSPECT_STORAGE_URL || 'https://aura-storage.entretorres1x2.workers.dev';

export async function POST(req: NextRequest) {
  try {
    const { slug, email } = await req.json();
    if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 });

    const rawRes = await fetch(`${STORAGE_URL}/prospect/${slug}`).catch(() => null);
    if (!rawRes || !rawRes.ok) return NextResponse.json({ error: 'Prospecto no encontrado en KV' }, { status: 404 });
    const raw = await rawRes.json();
    if (!raw.businessName || !raw.reviews?.length) return NextResponse.json({ error: 'Datos del prospecto incompletos' }, { status: 400 });
    const businessEmail = email || raw.businessEmail;
    if (!businessEmail) return NextResponse.json({ error: 'Sin email guardado' }, { status: 400 });

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://aura-online-y1k8.onrender.com'}/api/send-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: raw.businessName,
        businessEmail,
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