import { NextRequest, NextResponse } from 'next/server';

const SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyNtOHk1u4HagOiIrMRzMa8L_yvzGQ6jxRSm9AEbmxkWGbBWY-VBiO8o66b9PVnMjc/exec';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(SHEET_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      redirect: 'follow',
    });
    const text = await res.text();
    return NextResponse.json({ success: res.ok, raw: text });
  } catch {
    return NextResponse.json({ success: false, error: 'Error al conectar con Google Sheets' }, { status: 500 });
  }
}
