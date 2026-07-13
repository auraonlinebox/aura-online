import { NextRequest, NextResponse } from 'next/server';

const SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyNtOHk1u4HagOiIrMRzMa8L_yvzGQ6jxRSm9AEbmxkWGbBWY-VBiO8o66b9PVnMjc/exec';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = new URLSearchParams({ name: body.name || '', email: body.email || '', restaurant: body.restaurant || '' });
    const url = `${SHEET_WEBHOOK}?${params}`;
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    const text = await res.text();
    return NextResponse.json({ success: res.ok, status: res.status, text: text.slice(0,200) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Error al conectar' }, { status: 500 });
  }
}
