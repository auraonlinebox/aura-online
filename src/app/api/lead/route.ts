import { NextRequest, NextResponse } from 'next/server';

const SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyNtOHk1u4HagOiIrMRzMa8L_yvzGQ6jxRSm9AEbmxkWGbBWY-VBiO8o66b9PVnMjc/exec';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = new URLSearchParams({ name: body.name || '', email: body.email || '', restaurant: body.restaurant || '', phone: body.phone || '' });
    const res = await fetch(`${SHEET_WEBHOOK}?${params}`, { redirect: 'follow' });
    const text = await res.text();
    if (res.ok) return NextResponse.json({ success: true });
    return NextResponse.json({ success: false, error: text }, { status: 500 });
  } catch {
    return NextResponse.json({ success: false, error: 'Error al conectar con Google Sheets' }, { status: 500 });
  }
}
