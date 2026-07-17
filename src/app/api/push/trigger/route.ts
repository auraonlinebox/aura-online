import webpush from 'web-push';

const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:auraonlinebox@gmail.com';

if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
}

const WEBHOOK = 'https://script.google.com/macros/s/AKfycbyNtOHk1u4HagOiIrMRzMa8L_yvzGQ6jxRSm9AEbmxkWGbBWY-VBiO8o66b9PVnMjc/exec';

export async function POST(req: Request) {
  try {
    if (!vapidPublic || !vapidPrivate) {
      return Response.json({ error: 'VAPID keys not configured' }, { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const { subscription, title, body, url, clientId } = await req.json();

    if (subscription?.endpoint) {
      const payload = JSON.stringify({
        title: title || 'AURA — Nueva reseña',
        body: body || 'Tienes una nueva reseña de Google pendiente.',
        url: url || '/dashboard',
      });
      await webpush.sendNotification(subscription, payload);
    }

    if (clientId) {
      const subRes = await fetch(`${WEBHOOK}?${new URLSearchParams({ action: 'get_push_subscriptions', clientId })}`);
      if (subRes.ok) {
        const data = await subRes.json();
        const subscriptions = data.subscriptions || [];
        const payload = JSON.stringify({
          title: title || 'AURA — Nueva reseña',
          body: body || 'Tienes una nueva reseña de Google pendiente.',
          url: url || `/dashboard/${clientId}`,
        });
        await Promise.allSettled(subscriptions.map((sub: any) =>
          webpush.sendNotification(sub, payload).catch(() => {})
        ));
      }
    }

    return Response.json({ ok: true });
  } catch (err: any) {
    if (err?.statusCode === 410) {
      return Response.json({ error: 'Suscripción expirada' }, { status: 410 });
    }
    return Response.json({ error: 'Error al enviar notificación' }, { status: 500 });
  }
}
