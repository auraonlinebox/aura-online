interface Review {
  author: string;
  text: string;
  rating: number;
  response?: string;
}

interface ProspectData {
  businessName: string;
  businessEmail?: string;
  reviews: Review[];
  createdAt: number;
  readAt?: number;
}

async function sendReadNotification(slug: string, data: ProspectData, env: { RESEND_API_KEY?: string }) {
  try {
    if (!env.RESEND_API_KEY) return;
    const readDate = new Date(data.readAt!).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
    const url = `https://aura-online.es/prospect/${slug}`;
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1f2937;">✅ Prospecto leído</h2>
        <p style="color:#6b7280;font-size:15px;"><strong>${data.businessName}</strong> ha abierto el enlace de AURA.</p>
        <p style="color:#6b7280;font-size:14px;">📅 ${readDate}</p>
        <p style="color:#6b7280;font-size:14px;">🔗 <a href="${url}" style="color:#f97316;">${url}?status=1</a></p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
        <p style="color:#9ca3af;font-size:13px;">AURA - Reputación Digital</p>
      </div>`;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Ana de AURA <hello@aura-online.es>',
        to: ['auraonlinebox@gmail.com'],
        subject: `👀 ${data.businessName} ha visto su prospecto de AURA`,
        html,
      }),
    });
  } catch (e) {
    console.error('sendReadNotification error', e);
  }
}

export default {
  async fetch(req: Request, env: { aura_prospects: KVNamespace, RESEND_API_KEY?: string }, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const cors = {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
    };

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, ...cors });

    if (req.method === 'POST' && url.pathname === '/prospect') {
      const data: ProspectData = await req.json();
      const slug = crypto.randomUUID().slice(0, 8);
      await env.aura_prospects.put(slug, JSON.stringify({ ...data, readAt: 0 }));
      return new Response(JSON.stringify({ slug, id: slug }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if ((req.method === 'PUT' || req.method === 'POST') && url.pathname.match(/^\/prospect\/[^\/]+\/read$/)) {
      const slug = url.pathname.split('/')[2];
      const raw = await env.aura_prospects.get(slug);
      if (!raw) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
      const data: ProspectData = JSON.parse(raw);
      const wasRead = data.readAt && data.readAt > 0;
      data.readAt = data.readAt || Date.now();
      await env.aura_prospects.put(slug, JSON.stringify(data));
      if (!wasRead) ctx.waitUntil(sendReadNotification(slug, data, env));
      return new Response(JSON.stringify({ read: true, readAt: data.readAt }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if ((req.method === 'PUT' || req.method === 'POST') && url.pathname.startsWith('/prospect/')) {
      const slug = url.pathname.split('/')[2];
      const data = await req.json();
      await env.aura_prospects.put(slug, JSON.stringify(data));
      return new Response(JSON.stringify({ slug, id: slug }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'GET' && url.pathname.startsWith('/prospect/')) {
      const slug = url.pathname.split('/')[2];
      const raw = await env.aura_prospects.get(slug);
      if (!raw) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
      const data: ProspectData = JSON.parse(raw);
      return new Response(JSON.stringify(data), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
  },
};
