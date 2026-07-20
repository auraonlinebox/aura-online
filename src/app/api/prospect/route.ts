import { NextRequest, NextResponse } from 'next/server';
import { saveProspect, getProspect, updateProspect } from '@/lib/prospects';

export async function POST(req: NextRequest) {
  const { businessName, businessEmail, reviews, keywords } = await req.json();
  if (!businessName || !reviews?.length) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }
  const slug = await saveProspect({ businessName, businessEmail, reviews, keywords });
  return NextResponse.json({ slug, url: `https://aura-online.es/prospect/${slug}` });
}

export async function PUT(req: NextRequest) {
  const { slug, businessName, businessEmail, reviews, keywords } = await req.json();
  if (!slug || !businessName || !reviews?.length) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }
  const ok = await updateProspect(slug, { businessName, businessEmail, reviews, keywords });
  if (!ok) return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  return NextResponse.json({ slug, url: `https://aura-online.es/prospect/${slug}` });
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 });
  const data = await getProspect(slug);
  if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(data);
}