import { NextResponse } from 'next/server';

const WEBHOOK = 'https://script.google.com/macros/s/AKfycbyNtOHk1u4HagOiIrMRzMa8L_yvzGQ6jxRSm9AEbmxkWGbBWY-VBiO8o66b9PVnMjc/exec';

async function getAccessToken(clientId: string): Promise<string | null> {
  const res = await fetch(`${WEBHOOK}?${new URLSearchParams({ action: 'get_google_token', clientId })}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.refreshToken) return null;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: data.refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      grant_type: 'refresh_token',
    }),
  });
  const tokens = await tokenRes.json();
  return tokens.access_token || null;
}

export async function POST(req: Request) {
  const { clientId, reviewId, reply, locationName } = await req.json();
  if (!clientId || !reviewId || !reply) {
    return NextResponse.json({ error: 'clientId, reviewId, reply required' }, { status: 400 });
  }

  const accessToken = await getAccessToken(clientId);
  if (!accessToken) return NextResponse.json({ error: 'not_connected' });

  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/${locationName}/reviews/${reviewId}/reply`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment: reply }),
    }
  );

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Error publishing' }, { status: 500 });

  return NextResponse.json({ success: true, reply: data });
}
