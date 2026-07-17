import { NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://aura-online.es'}/api/google/callback`;
const WEBHOOK = 'https://script.google.com/macros/s/AKfycbyNtOHk1u4HagOiIrMRzMa8L_yvzGQ6jxRSm9AEbmxkWGbBWY-VBiO8o66b9PVnMjc/exec';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state') || 'default';

  if (error || !code) {
    return NextResponse.redirect(`/dashboard/${state}?error=google_auth_failed`);
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.refresh_token) {
      return NextResponse.redirect(`/dashboard/${state}?error=no_refresh_token`);
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = await userRes.json();

    await fetch(`${WEBHOOK}?${new URLSearchParams({
      action: 'store_google_token',
      clientId: state,
      email: user.email || '',
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: String(Date.now() + (tokens.expires_in || 3600) * 1000),
    })}`, { mode: 'no-cors' });

    return NextResponse.redirect(`/dashboard/${state}?google_connected=1`);
  } catch {
    return NextResponse.redirect(`/dashboard/${state}?error=token_exchange_failed`);
  }
}
