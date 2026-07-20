import { NextRequest, NextResponse } from 'next/server';

const STORAGE_URL = process.env.PROSPECT_STORAGE_URL || 'https://aura-storage.entretorres1x2.workers.dev';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (slug) {
    fetch(`${STORAGE_URL}/prospect/${slug}/read`, { method: 'POST' }).catch(() => {});
  }
  return new NextResponse(null, { status: 204 });
}