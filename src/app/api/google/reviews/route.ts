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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 });

  const accessToken = await getAccessToken(clientId);
  if (!accessToken) return NextResponse.json({ error: 'not_connected', needsAuth: true });

  const accountsRes = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const accounts = await accountsRes.json();
  const accountName = accounts.accounts?.[0]?.name;
  if (!accountName) return NextResponse.json({ error: 'no_business_account' });

  const locationsRes = await fetch(`https://mybusiness.googleapis.com/v4/${accountName}/locations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const locations = await locationsRes.json();
  const locationName = locations.locations?.[0]?.name;
  if (!locationName) return NextResponse.json({ error: 'no_locations' });

  const reviewsRes = await fetch(
    `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const reviews = await reviewsRes.json();

  const mapped = (reviews.reviews || []).map((r: any) => ({
    id: r.reviewId,
    author: r.reviewer?.displayName || 'Anónimo',
    rating: parseInt(r.starRating?.replace('STAR_RATING_', '') || '3'),
    text: r.comment || '',
    response: r.reply?.comment || null,
    date: r.createTime || '',
    updateTime: r.updateTime || '',
  }));

  return NextResponse.json({ reviews: mapped, accountName, locationName });
}
