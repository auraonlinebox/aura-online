import { NextRequest, NextResponse } from 'next/server';
import { saveProspect, getProspect } from '@/lib/prospects';

export async function POST(req: NextRequest) {
  const { businessName, reviews } = await req.json();
  if (!businessName || !reviews?.length) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }
  const slug = saveProspect({ businessName, reviews, createdAt: Date.now() });
  return NextResponse.json({ slug, url: `https://aura-online.es/prospect/${slug}` });
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 });
  const data = getProspect(slug);
  if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(data);
}
