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
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
    };

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, ...cors });

    if (req.method === 'POST' && url.pathname === '/prospect') {
      const data: ProspectData = await req.json();
      const slug = crypto.randomUUID().slice(0, 8);
      await env.aura_prospects.put(slug, JSON.stringify({ ...data, readAt: 0 }));
      const listRaw = await env.aura_prospects.get('_prospect-list').catch(() => null);
      const list = listRaw ? JSON.parse(listRaw) : [];
      list.unshift({ slug, businessName: data.businessName, createdAt: data.createdAt || Date.now() });
      await env.aura_prospects.put('_prospect-list', JSON.stringify(list.slice(0, 200)));
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

    if (req.method === 'POST' && url.pathname === '/email-event') {
      const event = await req.json();
      const eventId = event?.data?.email_id || crypto.randomUUID().slice(0, 8);
      const key = `email-event-${eventId}`;
      const existing = await env.aura_prospects.get(key).catch(() => null);
      const events = existing ? JSON.parse(existing) : [];
      events.push({ ...event, receivedAt: Date.now() });
      await env.aura_prospects.put(key, JSON.stringify(events));
      return new Response(JSON.stringify({ ok: true }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST' && url.pathname === '/migrate') {
      const keys = await env.aura_prospects.list();
      const items: any[] = [];
      for (const key of keys.keys) {
        if (key.name.startsWith('email-event-') || key.name.startsWith('_')) continue;
        const raw = await env.aura_prospects.get(key.name);
        if (raw) {
          const data = JSON.parse(raw);
          items.push({ slug: key.name, businessName: data.businessName || '—', createdAt: data.createdAt || 0, readAt: data.readAt || 0 });
        }
      }
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      await env.aura_prospects.put('_prospect-list', JSON.stringify(items));
      return new Response(JSON.stringify({ migrated: items.length }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT' && url.pathname.match(/^\/prospect\/[^\/]+\/resent$/)) {
      const slug = url.pathname.split('/')[2];
      const { timestamp } = await req.json();
      const raw = await env.aura_prospects.get(slug).catch(() => null);
      if (!raw) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
      const data = JSON.parse(raw);
      data.lastResentAt = timestamp || Date.now();
      await env.aura_prospects.put(slug, JSON.stringify(data));
      return new Response(JSON.stringify({ updated: true }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT' && url.pathname.match(/^\/prospect\/[^\/]+\/reset-read$/)) {
      const slug = url.pathname.split('/')[2];
      const raw = await env.aura_prospects.get(slug).catch(() => null);
      if (!raw) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
      const data = JSON.parse(raw);
      data.readAt = 0;
      await env.aura_prospects.put(slug, JSON.stringify(data));
      return new Response(JSON.stringify({ reset: true }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT' && url.pathname.match(/^\/prospect\/[^\/]+\/email$/)) {
      const slug = url.pathname.split('/')[2];
      const { email } = await req.json();
      if (!email) return new Response(JSON.stringify({ error: 'Falta email' }), { status: 400, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
      const raw = await env.aura_prospects.get(slug).catch(() => null);
      if (!raw) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
      const data = JSON.parse(raw);
      data.businessEmail = email;
      await env.aura_prospects.put(slug, JSON.stringify(data));
      return new Response(JSON.stringify({ updated: true }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/prospect/')) {
      const slug = url.pathname.split('/')[2];
      await env.aura_prospects.delete(slug);
      const listRaw = await env.aura_prospects.get('_prospect-list').catch(() => null);
      if (listRaw) {
        const list = JSON.parse(listRaw).filter((item: any) => item.slug !== slug);
        await env.aura_prospects.put('_prospect-list', JSON.stringify(list));
      }
      return new Response(JSON.stringify({ deleted: true }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'GET' && url.pathname === '/prospects') {
      const listRaw = await env.aura_prospects.get('_prospect-list').catch(() => null);
      const list = listRaw ? JSON.parse(listRaw) : [];
      const enriched = [];
      const cleanIndex = [];
      let changed = false;
      for (const item of list) {
        const raw = await env.aura_prospects.get(item.slug).catch(() => null);
        if (raw) {
          const data = JSON.parse(raw);
          enriched.push({ ...item, readAt: data.readAt || 0, businessEmail: data.businessEmail || '', lastResentAt: data.lastResentAt || 0 });
          cleanIndex.push(item);
        } else {
          changed = true; // skip deleted prospects
        }
      }
      if (changed) await env.aura_prospects.put('_prospect-list', JSON.stringify(cleanIndex));
      return new Response(JSON.stringify({ prospects: enriched }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'GET' && url.pathname === '/email-events') {
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
      const keys = await env.aura_prospects.list({ prefix: 'email-event-' });
      const all: any[] = [];
      for (const key of keys.keys.slice(-20)) {
        const raw = await env.aura_prospects.get(key.name);
        if (raw) {
          const events = JSON.parse(raw);
          events.forEach((e: any) => e._eventKey = key.name);
          all.push(...events);
        }
      }
      all.sort((a: any, b: any) => (b.receivedAt || 0) - (a.receivedAt || 0));
      return new Response(JSON.stringify({ events: all.slice(0, limit) }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/email-event/')) {
      const key = `email-event-${url.pathname.split('/')[2]}`;
      await env.aura_prospects.delete(key);
      return new Response(JSON.stringify({ deleted: true }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200, ...cors, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
  },
};
