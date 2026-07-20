import { NextRequest, NextResponse } from 'next/server';
import { saveProspect, getProspect } from '@/lib/prospects';

export async function POST(req: NextRequest) {
  const { businessName, businessEmail, reviews, keywords } = await req.json();
  if (!businessName || !reviews?.length) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }
  const slug = await saveProspect({ businessName, businessEmail, reviews, keywords });
  return NextResponse.json({ slug, url: `https://aura-online.es/prospect/${slug}` });
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 });
  const data = await getProspect(slug);
  if (!data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  const storageUrl = process.env.PROSPECT_STORAGE_URL || 'https://aura-storage.entretorres1x2.workers.dev';
  const readRes = await fetch(`${storageUrl}/prospect/${slug}`).catch(() => null);
  const readData = readRes?.ok ? await readRes.json() : null;
  return NextResponse.json({ ...data, readAt: readData?.readAt || 0 });
}
