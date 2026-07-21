const STORAGE_URL = 'https://aura-storage.entretorres1x2.workers.dev';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await fetch(`${STORAGE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true });
  }
}