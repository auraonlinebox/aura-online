import webpush from 'web-push';

const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:auraonlinebox@gmail.com';

if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
}

export async function POST(req: Request) {
  try {
    if (!vapidPublic || !vapidPrivate) {
      return Response.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    const { subscription, title, body, url } = await req.json();
    if (!subscription?.endpoint) {
      return Response.json({ error: 'No hay suscripción' }, { status: 400 });
    }

    const payload = JSON.stringify({
      title: title || 'AURA — Nueva reseña',
      body: body || 'Tienes una nueva reseña de Google pendiente.',
      url: url || '/dashboard',
    });

    await webpush.sendNotification(subscription, payload);
    return Response.json({ ok: true });
  } catch (err: any) {
    if (err?.statusCode === 410) {
      return Response.json({ error: 'Suscripción expirada' }, { status: 410 });
    }
    return Response.json({ error: 'Error al enviar notificación' }, { status: 500 });
  }
}
