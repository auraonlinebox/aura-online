import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const valid = process.env.ADMIN_PASSWORD;
    if (!password || password !== valid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}