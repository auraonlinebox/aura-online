const WEBHOOK = 'https://script.google.com/macros/s/AKfycbyNtOHk1u4HagOiIrMRzMa8L_yvzGQ6jxRSm9AEbmxkWGbBWY-VBiO8o66b9PVnMjc/exec';

export async function POST(req: Request) {
  try {
    const { subscription, clientId } = await req.json();
    if (!subscription?.endpoint) {
      return Response.json({ error: 'Falta endpoint' }, { status: 400 });
    }

    await fetch(`${WEBHOOK}?${new URLSearchParams({
      action: 'store_push_subscription',
      clientId: clientId || 'default',
      endpoint: subscription.endpoint,
      p256dh: subscription.keys?.p256dh || '',
      auth: subscription.keys?.auth || '',
    })}`, { mode: 'no-cors' });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Suscripción inválida' }, { status: 400 });
  }
}
